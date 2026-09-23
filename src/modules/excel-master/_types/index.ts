export type ExcelSheetName =
  | "Clients"
  | "ClientLocations"
  | "ClientContacts"
  | "ClientRegistrations"
  | "ClientMemberships"
  | "ClientRegistrationLocations"
  | "ClientComplianceReferences"
  | "ClientBillToParties"
  | "ClientEmployeeAssignments"
  | "ClientServiceEngagements"
  | "Services"
  | "ServiceGstHistory"
  | "ServiceFrequencyRates"
  | "ServiceCustomFields"
  | "ServiceTasks"
  | "ServiceDependencies";
export type ValidationSeverity = "ERROR" | "WARNING";
export type ValidationIssue = {
  severity: ValidationSeverity;
  code: string;
  sheet: string;
  row: number;
  column: number;
  header: string;
  value: unknown;
  message: string;
};
export type ImportBundle = {
  clients: Record<string, unknown>[];
  clientLocations: Record<string, unknown>[];
  clientContacts: Record<string, unknown>[];
  clientRegistrations: Record<string, unknown>[];
  clientMemberships: Record<string, unknown>[];
  clientRegistrationLocations: Record<string, unknown>[];
  clientComplianceReferences: Record<string, unknown>[];
  clientBillToParties: Record<string, unknown>[];
  clientEmployeeAssignments: Record<string, unknown>[];
  clientServiceEngagements: Record<string, unknown>[];
  services: Record<string, unknown>[];
  serviceGstHistory: Record<string, unknown>[];
  serviceFrequencyRates: Record<string, unknown>[];
  serviceCustomFields: Record<string, unknown>[];
  serviceTasks: Record<string, unknown>[];
  serviceDependencies: Record<string, unknown>[];
};
export type ValidationResult = { data: ImportBundle; issues: ValidationIssue[] };
export type ExcelRepository = {
  read(): Promise<ImportBundle>;
  replace(data: ImportBundle): Promise<void>;
};
