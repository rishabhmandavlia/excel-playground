import type { IncomingMessage, ServerResponse } from "node:http";

let appPromise: Promise<unknown> | undefined;

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  try {
    const protocol = String(req.headers["x-forwarded-proto"] ?? "https").split(",")[0];
    const host = req.headers.host ?? "localhost";
    const requestUrl = new URL(req.url ?? "/api", `${protocol}://${host}`);
    const rewrittenPath = requestUrl.searchParams.get("path");
    if (requestUrl.pathname === "/api" && rewrittenPath) {
      requestUrl.pathname = `/api/${rewrittenPath.replace(/^\/+/, "")}`;
      requestUrl.search = "";
    }
    const headers = new Headers();
    Object.entries(req.headers).forEach(([key, value]) => {
      if (value) headers.set(key, Array.isArray(value) ? value.join(", ") : value);
    });
    const body = req.method === "GET" || req.method === "HEAD" ? undefined : await readBody(req);
    const app = (await getApp()) as { handle(request: Request): Promise<Response> };
    const response = await app.handle(new Request(requestUrl, { method: req.method, headers, body }));
    res.statusCode = response.status;
    response.headers.forEach((value, key) => res.setHeader(key, value));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch (error) {
    console.error("Excel API invocation failed", error);
    res.statusCode = 500;
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "EXCEL_API_INVOCATION_FAILED", message: error instanceof Error ? error.message : "Unknown server error" }));
  }
}

async function getApp(): Promise<unknown> {
  appPromise ??= (async () => {
    const { Elysia } = await import("elysia");
    const { excelMasterModule } = await import("../src/modules/excel-master/index");
    return new Elysia({ prefix: "/api" }).use(excelMasterModule);
  })();
  return appPromise;
}

function readBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer | string) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}
