import { Elysia, t } from "elysia";

import { createMemoryRepository } from "./repository";
import {
  createClientWorkbook,
  createDemoWorkbook,
  createServiceWorkbook,
  createWorkbook,
  emptyData,
  parseWorkbook,
  validationReportRows,
} from "./workbook";

const repository = createMemoryRepository();
const jsonBody = t.Object({ workbookBase64: t.String() });

export const excelMasterModule = new Elysia({ prefix: "/excel-master" })
  .get("/template", async () =>
    fileResponse(await createWorkbook(), "client-service-template.xlsx"),
  )
  .get("/blank-template", async () => fileResponse(await createWorkbook(emptyData()), "blank-client-service-template.xlsx"))
  .get("/demo", async () =>
    fileResponse(await createDemoWorkbook(), "client-service-demo.xlsx"),
  )
  .get("/client-template", async () => fileResponse(await createClientWorkbook(), "client-template.xlsx"))
  .get("/service-template", async () => fileResponse(await createServiceWorkbook(), "service-template.xlsx"))
  .get("/client-demo", async () => fileResponse(await createClientWorkbook(), "client-demo.xlsx"))
  .get("/service-demo", async () => fileResponse(await createServiceWorkbook(), "service-demo.xlsx"))
  .get("/export", async () =>
    fileResponse(await createWorkbook(await repository.read()), "client-service-export.xlsx"),
  )
  .post(
    "/validate",
    async ({ body }) => {
      const result = await parseWorkbook(decode(body.workbookBase64));
      return {
        data: {
          issues: result.issues,
          errorCount: result.issues.filter((i) => i.severity === "ERROR").length,
          warningCount: result.issues.filter((i) => i.severity === "WARNING").length,
          rows: Object.values(result.data).reduce((total, rows) => total + rows.length, 0),
        },
      };
    },
    { body: jsonBody },
  )
  .post(
    "/import",
    async ({ body, status }) => {
      const result = await parseWorkbook(decode(body.workbookBase64));
      if (result.issues.some((issue) => issue.severity === "ERROR"))
        return status(422, { data: { imported: false, issues: result.issues } });
      await repository.replace(result.data);
      return { data: { imported: true, issues: result.issues } };
    },
    { body: jsonBody },
  )
  .post(
    "/report",
    async ({ body }) => {
      const result = await parseWorkbook(decode(body.workbookBase64));
      return fileResponse(await reportWorkbook(result.issues), "validation-report.xlsx");
    },
    { body: jsonBody },
  );

function decode(base64: string): Uint8Array {
  return Uint8Array.from(Buffer.from(base64, "base64"));
}
function fileResponse(bytes: Uint8Array, name: string) {
  return new Response(bytes as BodyInit, {
    headers: {
      "content-disposition": `attachment; filename="${name}"`,
      "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
  });
}
async function reportWorkbook(
  issues: Parameters<typeof validationReportRows>[0],
): Promise<Uint8Array> {
  const ExcelJS = (await import("exceljs")).default;
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("ValidationReport");
  sheet.addRow(["severity", "code", "sheet", "row", "column", "header", "value", "message"]);
  validationReportRows(issues).forEach((row) => sheet.addRow(row));
  sheet.getRow(1).font = { bold: true };
  sheet.columns = [18, 28, 24, 10, 10, 34, 40, 100].map((width) => ({ width }));
  return new Uint8Array((await workbook.xlsx.writeBuffer()) as unknown as ArrayBuffer);
}
