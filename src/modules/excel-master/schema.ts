import type { ExcelSheetName } from "./_types";

export const SHEETS: ExcelSheetName[] = [
  "Clients",
  "ClientLocations",
  "ClientContacts",
  "ClientRegistrations",
  "ClientMemberships",
  "ClientRegistrationLocations",
  "ClientComplianceReferences",
  "ClientBillToParties",
  "ClientEmployeeAssignments",
  "ClientServiceEngagements",
  "Services",
  "ServiceGstHistory",
  "ServiceFrequencyRates",
  "ServiceCustomFields",
  "ServiceTasks",
  "ServiceDependencies",
];

export const ENUMS = {
  clientType: ["INDIVIDUAL", "LEGAL_ENTITY"],
  constitution: [
    "INDIVIDUAL",
    "HUF",
    "PROPRIETORSHIP",
    "PARTNERSHIP",
    "AOP",
    "TRUST",
    "PRIVATE_LIMITED_COMPANY",
    "PUBLIC_LIMITED_COMPANY",
    "COOPERATIVE_SOCIETY",
    "BOI",
    "BANK",
    "LOCAL_AUTHORITY",
    "GOVERNMENT",
    "ARTIFICIAL_JURIDICAL_PERSON",
    "LLP",
    "ONE_PERSON_COMPANY",
    "UNSPECIFIED",
  ],
  residency: ["RESIDENT", "NRI"],
  locationType: [
    "registered_office",
    "head_office",
    "branch",
    "warehouse",
    "factory",
    "additional_place",
    "other",
  ],
  registrationType: ["GSTIN", "TAN", "IEC", "PROFESSIONAL_TAX", "SHOPS_ESTABLISHMENT", "OTHER"],
  registrationStatus: ["active", "suspended", "canceled", "surrendered", "expired"],
  classificationKind: ["HSN", "SAC"],
  taxability: ["TAXABLE", "NIL_RATED", "EXEMPTED"],
};

export type Column = {
  header: string;
  key: string;
  required?: boolean;
  type?: string;
  enum?: readonly string[];
};

export const COLUMNS = {
  Clients: [
    "client_key",
    "display_name",
    "type",
    "constitution",
    "legal_name",
    "pan",
    "tan",
    "gstin",
    "cin",
    "llpin",
    "primary_phone",
    "fax",
    "website",
    "residency",
    "group_name",
    "portal_email",
    "status_key",
    "is_director_or_partner_audit_liable",
  ].map((key, i) => ({
    header: `${key}${i < 3 ? " [required]" : ""}`,
    key,
    required: i < 3,
    type: i === 2 ? "enum" : i === 17 ? "boolean" : "text",
    enum:
      i === 2
        ? ENUMS.clientType
        : i === 3
          ? ENUMS.constitution
          : i === 13
            ? ENUMS.residency
            : undefined,
  })),
  ClientLocations: [
    "client_key",
    "location_key",
    "location_name",
    "location_type",
    "line1",
    "line2",
    "area",
    "city",
    "state",
    "postal_code",
    "country_code",
    "is_primary",
  ].map((key, i) => ({
    header: `${key}${[0, 1, 2, 3, 4, 7, 8, 9, 10, 11].includes(i) ? " [required]" : ""}`,
    key,
    required: [0, 1, 2, 3, 4, 7, 8, 9, 10, 11].includes(i),
    type: i === 3 ? "enum" : i === 11 ? "boolean" : "text",
    enum: i === 3 ? ENUMS.locationType : undefined,
  })),
  ClientContacts: [
    "client_key",
    "contact_key",
    "given_name",
    "family_name",
    "email",
    "phone",
    "is_primary_contact",
    "is_billing_contact",
    "is_service_contact",
    "designation_key",
    "access_role_key",
  ].map((key, i) => ({
    header: `${key}${i < 4 ? " [required]" : ""}`,
    key,
    required: i < 4,
    type: i >= 6 && i <= 8 ? "boolean" : "text",
  })),
  ClientRegistrations: [
    "client_key",
    "registration_key",
    "type",
    "registration_number",
    "effective_from",
    "effective_to",
    "status",
    "is_principal",
    "legal_name",
    "trade_name",
    "authority",
    "jurisdiction",
  ].map((key, i) => ({
    header: `${key}${[0, 1, 2, 3, 4, 6].includes(i) ? " [required]" : ""}`,
    key,
    required: [0, 1, 2, 3, 4, 6].includes(i),
    type: i === 2 || i === 6 ? "enum" : i === 4 || i === 5 ? "date" : i === 7 ? "boolean" : "text",
    enum: i === 2 ? ENUMS.registrationType : i === 6 ? ENUMS.registrationStatus : undefined,
  })),
  Services: [
    "service_key",
    "name",
    "is_non_gst",
    "hsn_sac_code",
    "classification_kind",
    "classification_description",
    "default_billable",
    "default_hourly_rate",
    "gst_applicability_date",
    "taxability",
    "cgst_rate",
    "sgst_rate",
    "igst_rate",
    "reverse_charge_applicable",
  ].map((key, i) => ({
    header: `${key}${[0, 1, 2].includes(i) ? " [required]" : ""}`,
    key,
    required: [0, 1, 2].includes(i),
    type: [2, 6, 13].includes(i)
      ? "boolean"
      : [7, 10, 11, 12].includes(i)
        ? "number"
        : i === 8
          ? "date"
          : i === 4 || i === 9
            ? "enum"
            : "text",
    enum: i === 4 ? ENUMS.classificationKind : i === 9 ? ENUMS.taxability : undefined,
  })),
  ServiceTasks: [
    "service_key",
    "task_key",
    "parent_task_key",
    "label",
    "sort_order",
    "expected_minutes",
    "due_date_offset_days",
    "frequency_key",
    "operational_role_key",
    "requires_verification",
    "is_active",
  ].map((key, i) => ({
    header: `${key}${[0, 1, 3, 4, 5, 6, 8, 9].includes(i) ? " [required]" : ""}`,
    key,
    required: [0, 1, 3, 4, 5, 6, 8, 9].includes(i),
    type: [4, 5, 6].includes(i) ? "number" : [9, 10].includes(i) ? "boolean" : "text",
  })),
  ServiceDependencies: ["service_key", "predecessor_task_key", "successor_task_key"].map((key) => ({
    header: `${key} [required]`,
    key,
    required: true,
    type: "text",
  })),
} as Record<ExcelSheetName, Column[]>;

const typedColumns = (
  keys: string[],
  required: string[] = [],
  types: Record<string, Column["type"]> = {},
): Column[] =>
  keys.map((key) => ({
    header: `${key}${required.includes(key) ? " [required]" : ""}`,
    key,
    required: required.includes(key),
    type: types[key] ?? "text",
  }));

COLUMNS.ClientMemberships = typedColumns(
  [
    "client_id",
    "client_key",
    "contact_id",
    "contact_key",
    "designation_key",
    "access_role_key",
    "is_primary_contact",
    "is_billing_contact",
    "is_service_contact",
    "effective_from",
    "effective_to",
    "is_active",
  ],
  ["client_id", "contact_id", "designation_key", "effective_from", "is_active"],
  {
    is_primary_contact: "boolean",
    is_billing_contact: "boolean",
    is_service_contact: "boolean",
    effective_from: "date",
    effective_to: "date",
    is_active: "boolean",
  },
);
COLUMNS.ClientRegistrationLocations = typedColumns(
  [
    "client_id",
    "client_key",
    "registration_id",
    "registration_key",
    "location_id",
    "location_key",
    "role",
    "effective_from",
    "effective_to",
    "is_active",
  ],
  ["client_id", "registration_id", "location_id", "role", "effective_from", "is_active"],
  { effective_from: "date", effective_to: "date", is_active: "boolean" },
);
COLUMNS.ClientComplianceReferences = typedColumns(
  [
    "client_id",
    "client_key",
    "financial_year_id",
    "financial_year_key",
    "reference_type",
    "reference_number",
    "effective_from",
    "effective_to",
    "is_active",
  ],
  [
    "client_id",
    "financial_year_id",
    "reference_type",
    "reference_number",
    "effective_from",
    "is_active",
  ],
  { effective_from: "date", effective_to: "date", is_active: "boolean" },
);
COLUMNS.ClientBillToParties = typedColumns(
  [
    "client_id",
    "client_key",
    "bill_to_party_key",
    "display_name",
    "legal_name",
    "gst_registration_mode",
    "gstin",
    "line1",
    "line2",
    "city",
    "state",
    "postal_code",
    "country_code",
    "effective_from",
    "effective_to",
    "is_default",
    "is_active",
  ],
  [
    "client_id",
    "bill_to_party_key",
    "display_name",
    "gst_registration_mode",
    "line1",
    "city",
    "state",
    "postal_code",
    "country_code",
    "effective_from",
    "is_active",
  ],
  { effective_from: "date", effective_to: "date", is_default: "boolean", is_active: "boolean" },
);
COLUMNS.ClientEmployeeAssignments = typedColumns(
  [
    "client_id",
    "client_key",
    "user_id",
    "operational_roles",
    "effective_from",
    "effective_to",
    "is_active",
  ],
  ["client_id", "user_id", "operational_roles", "effective_from", "is_active"],
  { effective_from: "date", effective_to: "date", is_active: "boolean" },
);
COLUMNS.ClientServiceEngagements = typedColumns(
  [
    "client_id",
    "client_key",
    "service_template_id",
    "service_template_key",
    "service_template_revision",
    "organization_id",
    "financial_year_id",
    "financial_year_key",
    "applicable",
    "provided_by_firm",
    "is_active",
    "is_billable",
    "effective_from",
    "effective_to",
    "frequency_key",
    "hourly_rate",
    "custom_amount",
    "final_amount",
    "bill_to_party_id",
    "recipient_emails",
    "scope_type",
    "scope_id",
    "scope_snapshot",
    "role_assignments",
    "node_assignments",
    "client_payments",
  ],
  [
    "client_id",
    "service_template_id",
    "service_template_key",
    "organization_id",
    "financial_year_id",
    "financial_year_key",
    "applicable",
    "provided_by_firm",
    "is_active",
    "is_billable",
    "effective_from",
    "frequency_key",
    "scope_type",
  ],
  {
    service_template_revision: "number",
    applicable: "boolean",
    provided_by_firm: "boolean",
    is_active: "boolean",
    is_billable: "boolean",
    effective_from: "date",
    effective_to: "date",
    hourly_rate: "number",
    custom_amount: "number",
    final_amount: "number",
  },
);
COLUMNS.ServiceGstHistory = typedColumns(
  [
    "service_template_id",
    "service_key",
    "gst_history_key",
    "applicability_date",
    "taxability",
    "cgst_rate",
    "sgst_rate",
    "igst_rate",
    "reverse_charge_applicable",
  ],
  [
    "gst_history_key",
    "applicability_date",
    "taxability",
    "cgst_rate",
    "sgst_rate",
    "igst_rate",
    "reverse_charge_applicable",
  ],
  {
    applicability_date: "date",
    cgst_rate: "number",
    sgst_rate: "number",
    igst_rate: "number",
    reverse_charge_applicable: "boolean",
  },
);
COLUMNS.ServiceFrequencyRates = typedColumns(
  ["service_template_id", "service_key", "frequency_key", "hourly_rate"],
  ["frequency_key", "hourly_rate"],
  { hourly_rate: "number" },
);
COLUMNS.ServiceCustomFields = typedColumns(
  [
    "service_template_id",
    "service_key",
    "field_id",
    "storage_key",
    "label",
    "field_type",
    "applies_to",
    "description",
    "is_required",
    "is_active",
    "sort_order",
    "task_node_id",
    "select_options",
  ],
  [
    "field_id",
    "storage_key",
    "label",
    "field_type",
    "applies_to",
    "is_required",
    "is_active",
    "sort_order",
  ],
  { is_required: "boolean", is_active: "boolean", sort_order: "number" },
);

COLUMNS.Clients.push(
  ...typedColumns(
    [
      "communication_email",
      "communication_sms",
      "communication_whatsapp",
      "portal_enabled",
      "portal_status",
      "embedded_addresses",
      "statutory_identifiers",
    ],
    [],
    {
      communication_email: "boolean",
      communication_sms: "boolean",
      communication_whatsapp: "boolean",
      portal_enabled: "boolean",
    },
  ),
);
COLUMNS.ClientContacts.push(
  ...typedColumns(["user_id", "email_points", "phone_points", "is_active"], [], {
    is_active: "boolean",
  }),
);
COLUMNS.ClientLocations.push(
  ...typedColumns(["client_id", "effective_from", "effective_to", "is_active"], [], {
    effective_from: "date",
    effective_to: "date",
    is_active: "boolean",
  }),
);
COLUMNS.ClientRegistrations.push(
  ...typedColumns(["client_id", "cancellation_reason", "is_active"], [], { is_active: "boolean" }),
);
COLUMNS.Services.push(
  ...typedColumns(
    [
      "is_active",
      "schema_version",
      "classification_code",
      "scheduling_due_date_offset_days",
      "allowed_task_status_keys",
      "allowed_work_status_keys",
      "initial_task_status_key",
      "initial_work_status_key",
      "target_scope_allowed",
      "target_scope_default",
      "target_scope_required_registration_type",
    ],
    [],
    { is_active: "boolean", schema_version: "number", scheduling_due_date_offset_days: "number" },
  ),
);
COLUMNS.ServiceTasks.push(
  ...typedColumns(["task_node_id", "parent_task_node_id", "service_template_id"], []),
);
COLUMNS.ServiceDependencies.push(
  ...typedColumns(["service_template_id", "predecessor_node_id", "successor_node_id"], []),
);

export const HEADER_TO_KEY = (header: string) => header.replace(/\s*\[required\]\s*$/u, "").trim();
