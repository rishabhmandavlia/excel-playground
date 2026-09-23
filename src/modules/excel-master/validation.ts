import type { ImportBundle, ValidationIssue, ValidationResult } from "./_types";
import { COLUMNS, ENUMS, HEADER_TO_KEY } from "./schema";

const keyPattern = /^[a-z][a-z0-9_]{0,63}$/u;
const datePattern = /^(\d{4})-(\d{2})-(\d{2})$/u;
const add = (
  issues: ValidationIssue[],
  sheet: string,
  row: number,
  column: number,
  header: string,
  value: unknown,
  code: string,
  message: string,
  severity: ValidationIssue["severity"] = "ERROR",
) => issues.push({ severity, code, sheet, row, column, header, value, message });
const text = (value: unknown): string | null => {
  const s = String(value ?? "").trim();
  return s ? s : null;
};
const bool = (value: unknown): boolean | null =>
  typeof value === "boolean"
    ? value
    : String(value ?? "").trim() === "true"
      ? true
      : String(value ?? "").trim() === "false"
        ? false
        : null;
const validDate = (value: unknown): string | null => {
  const s = text(value);
  if (!s || !datePattern.test(s)) return null;
  const d = new Date(`${s}T00:00:00Z`);
  return d.toISOString().slice(0, 10) === s ? s : null;
};

export function validateBundle(data: ImportBundle): ValidationResult {
  const issues: ValidationIssue[] = [];
  const checkRows = (sheet: keyof typeof COLUMNS, rows: Record<string, unknown>[]) => {
    const columns = COLUMNS[sheet];
    rows.forEach((row, index) => {
      const rowNo = index + 5;
      if (Object.values(row).every((v) => text(v) === null)) {
        add(
          issues,
          sheet,
          rowNo,
          1,
          "",
          "",
          "REQUIRED_VALUE_MISSING",
          "Rows containing only whitespace are not allowed.",
        );
        return;
      }
      columns.forEach((column, columnIndex) => {
        const value = row[column.key];
        const header = column.header;
        const cleaned = text(value);
        if (column.required && !cleaned)
          add(
            issues,
            sheet,
            rowNo,
            columnIndex + 1,
            header,
            value,
            "REQUIRED_VALUE_MISSING",
            `${header} is required.`,
          );
        if (!cleaned) return;
        if (column.type === "boolean" && bool(value) === null)
          add(
            issues,
            sheet,
            rowNo,
            columnIndex + 1,
            header,
            value,
            "INVALID_TYPE",
            "Use a real boolean or exact true/false text.",
          );
        if (column.type === "number" && (typeof value !== "number" || !Number.isFinite(value)))
          add(
            issues,
            sheet,
            rowNo,
            columnIndex + 1,
            header,
            value,
            "INVALID_NUMBER",
            "Use a finite numeric Excel value.",
          );
        if (column.type === "date" && !validDate(value) && !(value instanceof Date))
          add(
            issues,
            sheet,
            rowNo,
            columnIndex + 1,
            header,
            value,
            "INVALID_DATE",
            "Use a valid Excel date or YYYY-MM-DD.",
          );
        if (column.enum && !column.enum.includes(String(value)))
          add(
            issues,
            sheet,
            rowNo,
            columnIndex + 1,
            header,
            value,
            "INVALID_ENUM",
            `Allowed values: ${column.enum.join(", ")}.`,
          );
        if (
          [
            "client_key",
            "location_key",
            "contact_key",
            "registration_key",
            "service_key",
            "task_key",
            "parent_task_key",
            "predecessor_task_key",
            "successor_task_key",
            "frequency_key",
            "operational_role_key",
            "designation_key",
            "access_role_key",
            "status_key",
          ].includes(column.key) &&
          !keyPattern.test(String(value))
        )
          add(
            issues,
            sheet,
            rowNo,
            columnIndex + 1,
            header,
            value,
            "INVALID_FORMAT",
            "Must match ^[a-z][a-z0-9_]{0,63}$.",
          );
      });
    });
    const key = (
      {
        Clients: "client_key",
        ClientLocations: "location_key",
        ClientContacts: "contact_key",
        ClientRegistrations: "registration_key",
        ClientMemberships: "contact_key",
        ClientRegistrationLocations: "registration_key",
        ClientComplianceReferences: "reference_number",
        ClientBillToParties: "bill_to_party_key",
        ClientEmployeeAssignments: "user_id",
        ClientServiceEngagements: "service_template_key",
        Services: "service_key",
        ServiceGstHistory: "gst_history_key",
        ServiceFrequencyRates: "frequency_key",
        ServiceCustomFields: "storage_key",
        ServiceTasks: "task_key",
        ServiceDependencies: "predecessor_task_key",
      } as const
    )[sheet];
    if (key) {
      const seen = new Set<string>();
      rows.forEach((row, i) => {
        const value = text(row[key]);
        if (value && seen.has(value))
          add(issues, sheet, i + 5, 1, key, value, "DUPLICATE_KEY", `${key} is duplicated.`);
        if (value) seen.add(value);
      });
    }
  };
  (Object.keys(COLUMNS) as (keyof typeof COLUMNS)[]).forEach((sheet) =>
    checkRows(sheet, data[mapSheet(sheet)]),
  );
  const clientKeys = new Set(
    data.clients.map((r) => text(r.client_key)).filter((value): value is string => Boolean(value)),
  );
  const serviceKeys = new Set(
    data.services
      .map((r) => text(r.service_key))
      .filter((value): value is string => Boolean(value)),
  );
  const taskKeys = new Map<string, Set<string>>();
  data.serviceTasks.forEach((r) => {
    const service = text(r.service_key);
    if (service) {
      if (!taskKeys.has(service)) taskKeys.set(service, new Set());
      taskKeys.get(service)?.add(text(r.task_key) ?? "");
    }
  });
  const refs = (rows: Record<string, unknown>[], sheet: string, field: string, set: Set<string>) =>
    rows.forEach((r, i) => {
      const value = text(r[field]);
      if (value && !set.has(value))
        add(
          issues,
          sheet,
          i + 5,
          1,
          field,
          value,
          "REFERENCE_NOT_FOUND",
          `${field} does not reference an existing key.`,
        );
    });
  refs(data.clientLocations, "ClientLocations", "client_key", clientKeys);
  refs(data.clientContacts, "ClientContacts", "client_key", clientKeys);
  refs(data.clientRegistrations, "ClientRegistrations", "client_key", clientKeys);
  refs(data.clientMemberships, "ClientMemberships", "client_key", clientKeys);
  refs(data.clientRegistrationLocations, "ClientRegistrationLocations", "client_key", clientKeys);
  refs(data.clientComplianceReferences, "ClientComplianceReferences", "client_key", clientKeys);
  refs(data.clientBillToParties, "ClientBillToParties", "client_key", clientKeys);
  refs(data.clientEmployeeAssignments, "ClientEmployeeAssignments", "client_key", clientKeys);
  refs(data.clientServiceEngagements, "ClientServiceEngagements", "client_key", clientKeys);
  refs(data.serviceTasks, "ServiceTasks", "service_key", serviceKeys);
  refs(data.serviceDependencies, "ServiceDependencies", "service_key", serviceKeys);
  refs(data.serviceGstHistory, "ServiceGstHistory", "service_key", serviceKeys);
  refs(data.serviceFrequencyRates, "ServiceFrequencyRates", "service_key", serviceKeys);
  refs(data.serviceCustomFields, "ServiceCustomFields", "service_key", serviceKeys);
  refs(
    data.clientServiceEngagements,
    "ClientServiceEngagements",
    "service_template_key",
    serviceKeys,
  );
  data.services.forEach((r, i) => validateService(r, issues, i + 5));
  data.clientLocations.forEach((r, i) => {
    if (bool(r.is_primary)) {
      const count = data.clientLocations.filter(
        (x) => x.client_key === r.client_key && bool(x.is_primary),
      ).length;
      if (count > 1)
        add(
          issues,
          "ClientLocations",
          i + 5,
          12,
          "is_primary [required]",
          r.is_primary,
          "MULTIPLE_PRIMARY_RECORDS",
          "Only one primary location is allowed per client.",
        );
    }
  });
  data.clientContacts.forEach((r, i) => {
    if (!text(r.email) && !text(r.phone))
      add(
        issues,
        "ClientContacts",
        i + 5,
        5,
        "email",
        "",
        "REQUIRED_VALUE_MISSING",
        "A contact needs an email or phone.",
      );
  });
  data.serviceTasks.forEach((r, i) => {
    const service = text(r.service_key);
    const parent = text(r.parent_task_key);
    if (parent && !taskKeys.get(service ?? "")?.has(parent))
      add(
        issues,
        "ServiceTasks",
        i + 5,
        3,
        "parent_task_key",
        parent,
        "REFERENCE_WRONG_SCOPE",
        "Parent task must exist in the same service.",
      );
  });
  for (const [service, keys] of taskKeys) {
    const parents = new Map(
      data.serviceTasks
        .filter((row) => row.service_key === service)
        .map((row) => [String(row.task_key), text(row.parent_task_key)]),
    );
    for (const key of keys) {
      const seen = new Set<string>();
      let cursor: string | null = key;
      while (cursor) {
        if (seen.has(cursor)) {
          add(
            issues,
            "ServiceTasks",
            5,
            3,
            "parent_task_key",
            cursor,
            "TASK_CYCLE",
            "Task parent hierarchy contains a cycle.",
          );
          break;
        }
        seen.add(cursor);
        cursor = parents.get(cursor) ?? null;
      }
    }
  }
  const duplicateEdges = new Set<string>();
  data.serviceDependencies.forEach((r, i) => {
    const service = text(r.service_key) ?? "";
    const pre = text(r.predecessor_task_key) ?? "";
    const suc = text(r.successor_task_key) ?? "";
    const edge = `${service}:${pre}:${suc}`;
    if (pre === suc || !taskKeys.get(service)?.has(pre) || !taskKeys.get(service)?.has(suc))
      add(
        issues,
        "ServiceDependencies",
        i + 5,
        2,
        "predecessor_task_key [required]",
        pre,
        "INVALID_DEPENDENCY",
        "Both endpoints must be different tasks in the same service.",
      );
    if (duplicateEdges.has(edge))
      add(
        issues,
        "ServiceDependencies",
        i + 5,
        2,
        "predecessor_task_key [required]",
        pre,
        "DUPLICATE_DEPENDENCY",
        "Dependency edge is duplicated.",
      );
    duplicateEdges.add(edge);
  });
  for (const service of serviceKeys) {
    const graph = new Map<string, string[]>();
    data.serviceDependencies
      .filter((row) => row.service_key === service)
      .forEach((row) => {
        const predecessor = String(row.predecessor_task_key);
        graph.set(predecessor, [...(graph.get(predecessor) ?? []), String(row.successor_task_key)]);
      });
    const visiting = new Set<string>();
    const visited = new Set<string>();
    const visit = (node: string): boolean => {
      if (visiting.has(node)) return true;
      if (visited.has(node)) return false;
      visiting.add(node);
      const cycle = (graph.get(node) ?? []).some(visit);
      visiting.delete(node);
      visited.add(node);
      return cycle;
    };
    if ([...graph.keys()].some(visit))
      add(
        issues,
        "ServiceDependencies",
        5,
        2,
        "predecessor_task_key [required]",
        service,
        "TASK_CYCLE",
        "Dependency graph contains a cycle.",
      );
  }
  return { data: normalize(data), issues };
}

function validateService(row: Record<string, unknown>, issues: ValidationIssue[], rowNo: number) {
  const nonGst = bool(row.is_non_gst);
  const gst = [
    row.gst_applicability_date,
    row.taxability,
    row.cgst_rate,
    row.sgst_rate,
    row.igst_rate,
    row.reverse_charge_applicable,
  ];
  const anyGst = gst.some((v) => text(v) !== null);
  if (nonGst === true && (text(row.hsn_sac_code) || anyGst))
    add(
      issues,
      "Services",
      rowNo,
      4,
      "hsn_sac_code",
      row.hsn_sac_code,
      "INVALID_GST_CONFIGURATION",
      "Non-GST services must not contain GST or classification fields.",
    );
  if (nonGst === false && (!text(row.hsn_sac_code) || gst.some((v) => text(v) === null)))
    add(
      issues,
      "Services",
      rowNo,
      4,
      "hsn_sac_code",
      row.hsn_sac_code,
      "PARTIAL_GROUP",
      "GST services require HSN/SAC and the complete GST group.",
    );
  if (
    typeof row.cgst_rate === "number" &&
    typeof row.sgst_rate === "number" &&
    row.cgst_rate !== row.sgst_rate
  )
    add(
      issues,
      "Services",
      rowNo,
      11,
      "sgst_rate",
      row.sgst_rate,
      "INVALID_GST_CONFIGURATION",
      "CGST and SGST must match.",
    );
  if (
    typeof row.cgst_rate === "number" &&
    typeof row.sgst_rate === "number" &&
    typeof row.igst_rate === "number" &&
    row.igst_rate !== row.cgst_rate + row.sgst_rate
  )
    add(
      issues,
      "Services",
      rowNo,
      13,
      "igst_rate",
      row.igst_rate,
      "INVALID_GST_CONFIGURATION",
      "IGST must equal CGST plus SGST.",
    );
}
function normalize(data: ImportBundle): ImportBundle {
  const clean = (rows: Record<string, unknown>[]) =>
    rows.map((r) =>
      Object.fromEntries(Object.entries(r).map(([k, v]) => [k, text(v) === null ? null : v])),
    );
  return {
    clients: clean(data.clients),
    clientLocations: clean(data.clientLocations),
    clientContacts: clean(data.clientContacts),
    clientRegistrations: clean(data.clientRegistrations),
    clientMemberships: clean(data.clientMemberships),
    clientRegistrationLocations: clean(data.clientRegistrationLocations),
    clientComplianceReferences: clean(data.clientComplianceReferences),
    clientBillToParties: clean(data.clientBillToParties),
    clientEmployeeAssignments: clean(data.clientEmployeeAssignments),
    clientServiceEngagements: clean(data.clientServiceEngagements),
    services: clean(data.services),
    serviceGstHistory: clean(data.serviceGstHistory),
    serviceFrequencyRates: clean(data.serviceFrequencyRates),
    serviceCustomFields: clean(data.serviceCustomFields),
    serviceTasks: clean(data.serviceTasks),
    serviceDependencies: clean(data.serviceDependencies),
  };
}
function mapSheet(sheet: keyof typeof COLUMNS): keyof ImportBundle {
  return (
    {
      Clients: "clients",
      ClientLocations: "clientLocations",
      ClientContacts: "clientContacts",
      ClientRegistrations: "clientRegistrations",
      ClientMemberships: "clientMemberships",
      ClientRegistrationLocations: "clientRegistrationLocations",
      ClientComplianceReferences: "clientComplianceReferences",
      ClientBillToParties: "clientBillToParties",
      ClientEmployeeAssignments: "clientEmployeeAssignments",
      ClientServiceEngagements: "clientServiceEngagements",
      Services: "services",
      ServiceGstHistory: "serviceGstHistory",
      ServiceFrequencyRates: "serviceFrequencyRates",
      ServiceCustomFields: "serviceCustomFields",
      ServiceTasks: "serviceTasks",
      ServiceDependencies: "serviceDependencies",
    } as const
  )[sheet];
}
