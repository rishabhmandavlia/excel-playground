import { useRef, useState } from "react";

type Issue = { severity: string; code: string; sheet: string; row: number; message: string };
type Summary = { errorCount: number; warningCount: number; rows: number; issues: Issue[] };
const button =
  "rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";

export function Component() {
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [busy, setBusy] = useState(false);
  const encode = async (value: File) =>
    btoa(
      Array.from(new Uint8Array(await value.arrayBuffer()), (byte) =>
        String.fromCharCode(byte),
      ).join(""),
    );
  const download = (path: string) => window.location.assign(`/api/excel-master/${path}`);
  const validate = async (value: File) => {
    setFile(value);
    setBusy(true);
    const response = await fetch("/api/excel-master/validate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ workbookBase64: await encode(value) }),
    });
    setSummary((await response.json()).data);
    setBusy(false);
  };
  const importFile = async () => {
    if (!file) return;
    setBusy(true);
    const response = await fetch("/api/excel-master/import", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ workbookBase64: await encode(file) }),
    });
    if (response.ok) setSummary((current) => (current ? { ...current, errorCount: 0 } : current));
    setBusy(false);
  };
  const report = async () => {
    if (!file) return;
    const response = await fetch("/api/excel-master/report", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ workbookBase64: await encode(file) }),
    });
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement("a");
    link.href = url;
    link.download = "validation-report.xlsx";
    link.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-7">
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-indigo-700">
            Excel master data
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Import and export with confidence.
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-slate-600">
            Work with client and service data in focused Excel workbooks. Validate relationships
            before anything is imported.
          </p>
        </div>
        <a
          className="mb-4 flex items-center justify-between gap-5 rounded-2xl border border-indigo-100 bg-indigo-50 p-5 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-100"
          href="/docs"
        >
          <div className="flex items-center gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-xl font-bold text-white">
              ?
            </div>
            <div>
              <h2 className="font-bold text-slate-950">How it works</h2>
              <p className="mt-1 text-sm text-slate-600">
                Learn which workbook to choose, what each field means, and how validation protects your import.
              </p>
            </div>
          </div>
          <span className="shrink-0 text-sm font-bold text-indigo-700">Open guide →</span>
        </a>
        <div className="grid items-stretch gap-4 md:grid-cols-3">
          <DownloadCard
            title="Client workbook"
            text="Clients, locations, contacts, and registrations."
            action="Download client template"
            onClick={() => download("client-template")}
          />
          <DownloadCard
            title="Service workbook"
            text="Services, tasks, and dependencies."
            action="Download service template"
            onClick={() => download("service-template")}
          />
          <DownloadCard
            title="Demo workbooks"
            text="Prefilled client and service examples."
            action="Download client demo"
            onClick={() => download("client-demo")}
          />
        </div>
        <div className="mt-4 grid items-stretch gap-4 md:grid-cols-3">
          <DownloadCard
            title="Service demo"
            text="A prefilled service workbook with GST, tasks, and dependencies."
            action="Download service demo"
            onClick={() => download("service-demo")}
          />
          <DownloadCard
            title="Blank combined workbook"
            text="A blank workbook with separate client and service sheets."
            action="Download blank workbook"
            onClick={() => download("blank-template")}
          />
        </div>
        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="font-bold text-slate-950">Upload and validate</h2>
            <p className="mt-1 text-sm text-slate-500">
              Choose a client or service workbook. The preview reports exactly what will block
              import.
            </p>
          </div>
          <div className="p-6">
            <button
              className="w-full rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center transition hover:border-indigo-400 hover:bg-indigo-50"
              onClick={() => input.current?.click()}
              type="button"
            >
              <div className="text-3xl text-indigo-600">↥</div>
              <div className="mt-3 font-bold text-slate-950">
                {file ? file.name : "Choose an Excel workbook"}
              </div>
              <div className="mt-1 text-sm text-slate-500">
                .xlsx files only · validation runs automatically
              </div>
              <input
                accept=".xlsx"
                className="hidden"
                onChange={(event) => {
                  const value = event.target.files?.[0];
                  if (value) void validate(value);
                }}
                ref={input}
                type="file"
              />
            </button>
            {busy && (
              <p className="mt-4 rounded-lg bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
                Reading and validating workbook…
              </p>
            )}
          </div>
        </section>
        {summary && (
          <Validation
            summary={summary}
            file={file}
            busy={busy}
            onImport={() => void importFile()}
            onReport={() => void report()}
          />
        )}
        <QuickGuide />
      </main>
    </div>
  );
}

function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white">
            L
          </div>
          <div>
            <div className="font-bold text-slate-950">Ledgerline</div>
            <div className="text-xs text-slate-500">Data operations</div>
          </div>
        </div>
        <nav className="flex items-center gap-4 text-sm">
          <a className="text-slate-500 hover:text-indigo-600" href="/docs">
            How it works
          </a>
          <span className="hidden text-slate-500 sm:block">Excel tools online</span>
        </nav>
      </div>
    </header>
  );
}
function DownloadCard({
  title,
  text,
  action,
  onClick,
}: {
  title: string;
  text: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex size-10 items-center justify-center rounded-xl bg-indigo-50 text-xl text-indigo-600">
        ✦
      </div>
      <h2 className="font-bold text-slate-950">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-slate-500">{text}</p>
      <button
        className={`${button} mt-auto self-start bg-slate-950 text-white hover:bg-slate-800`}
        onClick={onClick}
      >
        {action} →
      </button>
    </div>
  );
}
function Validation({
  summary,
  file,
  busy,
  onImport,
  onReport,
}: {
  summary: Summary;
  file: File | null;
  busy: boolean;
  onImport: () => void;
  onReport: () => void;
}) {
  const ready = summary.errorCount === 0;
  return (
    <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-6 py-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-slate-950">Validation preview</h2>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-bold ${ready ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}
            >
              {ready ? "Ready to import" : "Needs attention"}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Errors are blocking. Warnings are informational.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            className={`${button} border border-slate-200 bg-white text-slate-700`}
            disabled={!file || busy}
            onClick={onReport}
          >
            Download report
          </button>
          <button
            className={`${button} bg-indigo-600 text-white`}
            disabled={!ready || !file || busy}
            onClick={onImport}
          >
            Import workbook
          </button>
        </div>
      </div>
      <div className="grid border-b border-slate-100 sm:grid-cols-3">
        {[
          ["Rows parsed", summary.rows],
          ["Blocking errors", summary.errorCount],
          ["Warnings", summary.warningCount],
        ].map(([label, value]) => (
          <div className="px-6 py-5" key={String(label)}>
            <div className="text-sm text-slate-500">{label}</div>
            <div className="mt-1 text-3xl font-bold text-slate-950">{value}</div>
          </div>
        ))}
      </div>
      {summary.issues.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-3">Severity</th>
                <th className="px-6 py-3">Code</th>
                <th className="px-6 py-3">Location</th>
                <th className="px-6 py-3">Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summary.issues.map((issue, index) => (
                <tr key={`${issue.code}-${index}`}>
                  <td className="px-6 py-4">{issue.severity}</td>
                  <td className="px-6 py-4 font-mono text-xs">{issue.code}</td>
                  <td className="px-6 py-4">
                    {issue.sheet}, row {issue.row}
                  </td>
                  <td className="px-6 py-4">{issue.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
function QuickGuide() {
  return (
    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="font-bold text-slate-950">Quick guide</h2>
        <p className="mt-1 text-sm text-slate-500">
          Everything you need to know before working in Excel.
        </p>
      </div>
      <div className="grid gap-5 text-sm md:grid-cols-3">
        <Guide
          title="Client workbook"
          text="Clients are the master records. Locations, contacts, and registrations must reference an existing client_key."
        />
        <Guide
          title="Service workbook"
          text="Services hold GST configuration. Tasks use task_key and dependencies connect tasks in the same service."
        />
        <Guide
          title="Validation report"
          text="Each row identifies severity, code, sheet, row, column, value, and a plain-language fix. Errors prevent import."
        />
      </div>
      <div className="mt-6 border-t border-slate-100 pt-5 text-sm text-slate-600">
        <span className="font-semibold text-slate-950">Rules at a glance:</span> required values
        cannot be blank · keys must be stable and unique · relationships use keys, never names ·
        dates use YYYY-MM-DD · optional cells stay blank · imports are atomic.
      </div>
    </section>
  );
}
function Guide({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h3 className="font-semibold text-slate-950">{title}</h3>
      <p className="mt-1 leading-6 text-slate-500">{text}</p>
    </div>
  );
}
