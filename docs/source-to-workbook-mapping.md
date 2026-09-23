# Source-to-workbook mapping audit

This audit maps the current ERP contracts into the standalone Excel workbook project. It is the basis for lossless round-trip exports. Authentication secrets are deliberately excluded.

| Source collection or API field | Source path | Workbook sheet | Workbook column | Create required | Update required | Excel type | Allowed values | Nullable | Round-trip transform | Secret handling |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| clients | `_id`, `key`, `revision` | Clients | `_id`, `client_key`, `revision` | key | yes | Text / number | stable key | ID no | Preserve ID and revision | ID is not secret |
| clients | `displayName`, `legalName`, `type`, `constitution` | Clients | `display_name`, `legal_name`, `type`, `constitution` | display/type | changed fields | Text / enum | client contract | legal name yes | Direct mapping | none |
| clients | `communicationPreferences.*` | Clients | `communication_email`, `communication_sms`, `communication_whatsapp` | no | changed fields | Boolean | true/false | no | Direct mapping | none |
| clients | `portalAccess.email`, `enabled`, `status` | Clients | `portal_email`, `portal_enabled`, `portal_status` | no | changed fields | Text / boolean / enum | portal status contract | email yes | Direct mapping | Excludes OTP, session, invite hashes and expiry tokens |
| clients | `addresses[]` | Clients / ClientLocations | address fields | no | changed fields | Text | address fields | fields vary | Preserve embedded address or normalize through location adapter | none |
| contacts | `emails[]`, `phones[]`, `userId` | ClientContacts | `email_points`, `phone_points`, `user_id` | contact identity | changed fields | Reversible JSON text | contact points | yes | JSON arrays; never lossy flattening | none |
| clientMemberships | relationship document | ClientMemberships | client/contact IDs, roles, dates, flags | relation IDs | yes | Text / date / boolean | active role keys | some | Direct mapping | none |
| clientRegistrations | registration document | ClientRegistrations | registration fields | client/key/type | yes | Text / date / boolean | GSTIN, TAN | optional fields | Direct mapping | encrypted values use application path | identifier values are sensitive |
| clientRegistrationLocations | relationship document | ClientRegistrationLocations | registration/location IDs, role, dates | IDs and role | yes | Text / date / boolean | configured roles | end date yes | Direct mapping | none |
| clientComplianceReferences | relationship document | ClientComplianceReferences | financial year, type, number, dates | required matrix | yes | Text / date / boolean | compliance types | end date yes | Direct mapping | none |
| clientBillToParties | bill-to document | ClientBillToParties | party, GST, address, dates | required matrix | yes | Text / date / boolean | GST_REGISTERED, NON_GST | legal/GST fields vary | Direct mapping | none |
| clientEmployeeAssignments | assignment document | ClientEmployeeAssignments | user, operational roles, dates | user/roles/dates | yes | Text / date / boolean | owner, manager, preparer, reviewer | end date yes | Direct mapping | none |
| clientServiceEngagements | engagement document | ClientServiceEngagements | scope, billing, recipients, roles, node assignments, payments | required matrix | yes | Text / date / number / reversible JSON | scope contract | many | Nested arrays use reversible JSON | no credentials |
| serviceTemplates | base service document | Services | key, revision, tax and policy fields | key/name/GST mode | yes | Text / enum / number | service contract | varies | Direct mapping | none |
| serviceTemplates | `gstRateHistory[]` | ServiceGstHistory | history key, date, rates | full history entry | yes | Date / number / enum | taxability contract | no | One row per history entry | none |
| serviceTemplates | `frequencyHourlyRates[]` | ServiceFrequencyRates | frequency key, hourly rate | rate entry | yes | Text / number | configured frequencies | no | One row per rate | none |
| serviceTemplates | `customFields[]` | ServiceCustomFields | field metadata and options | field key/type | yes | Text / boolean / number | field types and applies-to | options vary | JSON for select options | none |
| serviceTemplates | `taskTree[]` | ServiceTasks | `task_node_id`, `task_key`, parent node/key | node key | yes | Text / number / boolean | role/frequency contract | parent varies | Embedded node, never invented Mongo task ID | none |
| serviceTemplates | `dependencies[]` | ServiceDependencies | predecessor/successor node IDs/keys | endpoints | yes | Text | existing same-service node IDs | no | Direct mapping | none |

## Deliberate exclusions

OTP hashes, invite token hashes, session tokens, session expiry data, authentication secrets, and any similar credential material are never exported. The Excel import can request a portal invitation only through an explicit future UI confirmation, not through persistent master-data columns.
