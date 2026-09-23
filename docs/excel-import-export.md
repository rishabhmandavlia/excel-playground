# Excel import and export

The standalone React workflow is available at `http://localhost:5173`.

## Development

```sh
bun install
bun run dev
bun test
bun run typecheck
bun run build
```

## Vercel deployment

This project is configured for Vercel with `vercel.json`. Import the project from this directory and use:

```sh
bun install
bun run vercel-build
```

Vercel serves the React build from `dist` and routes `/api/excel-master/*` to the bundled serverless handler in `api/index.js`. The handler is built from `src/vercel-api.ts` so Vercel does not need to resolve source TypeScript modules at runtime. The current repository adapter is in-memory, so imported data resets when the serverless instance is replaced; connect a durable adapter before using this in production.

The API exposes `/api/excel-master/template`, `/demo`, `/export`, `/validate`, `/import`, and `/report`.
The demo repository is in-memory and isolated behind `ExcelRepository`; replace it with a durable adapter when the persistence contract is finalized.

## Workbook sheets

`README` explains the contract. `Clients`, `ClientLocations`, `ClientContacts`, `ClientRegistrations`, `Services`, `ServiceTasks`, and `ServiceDependencies` are input sheets. `ValidationReport` is generated output and is never read as input.

Blocking validation covers required values, exact headers, duplicate/unknown columns, formula cells, stable-key format and uniqueness, enum/type/date/number/URL/phone/PAN/TAN checks, references and scope, all-or-nothing GST groups, duplicate statutory types, primary-record uniqueness, task hierarchy cycles, dependency duplicates/cycles, and atomic application-level import.
