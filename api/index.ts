import type { IncomingMessage, ServerResponse } from "node:http";

import { Elysia } from "elysia";

import { excelMasterModule } from "../src/modules/excel-master/index";

const app = new Elysia({ prefix: "/api" }).use(excelMasterModule);

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const protocol = String(req.headers["x-forwarded-proto"] ?? "https").split(",")[0];
  const host = req.headers.host ?? "localhost";
  const requestUrl = new URL(req.url ?? "/api", `${protocol}://${host}`);
  const headers = new Headers();
  Object.entries(req.headers).forEach(([key, value]) => {
    if (value) headers.set(key, Array.isArray(value) ? value.join(", ") : value);
  });
  const body = req.method === "GET" || req.method === "HEAD" ? undefined : await readBody(req);
  const response = await app.handle(new Request(requestUrl, { method: req.method, headers, body }));
  res.statusCode = response.status;
  response.headers.forEach((value, key) => res.setHeader(key, value));
  res.end(Buffer.from(await response.arrayBuffer()));
}

function readBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer | string) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}
