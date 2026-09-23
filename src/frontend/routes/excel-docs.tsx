const sectionClass = "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm";

export function Component() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <a className="flex items-center gap-3" href="/">
            <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white">
              L
            </div>
            <div>
              <div className="font-bold text-slate-950">Ledgerline</div>
              <div className="text-xs text-slate-500">Excel operations guide</div>
            </div>
          </a>
          <a
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            href="/"
          >
            Back to workbooks
          </a>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 max-w-3xl">
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-indigo-700">
            Quick documentation
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950">
            Excel import and export, explained.
          </h1>
          <p className="mt-3 text-lg leading-8 text-slate-600">
            A short guide to what the workbook does, what the system checks, and what you need to
            do.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <section className={sectionClass}>
            <h2 className="text-xl font-bold text-slate-950">How the workflow works</h2>
            <p className="mt-1 text-sm text-slate-500">
              The system validates the workbook before it changes any data.
            </p>
            <Flow />
          </section>
          <section className={sectionClass}>
            <h2 className="text-xl font-bold text-slate-950">What you use</h2>
            <div className="mt-5 space-y-4">
              <Tech label="Frontend" value="React + Tailwind CSS" />
              <Tech label="Backend" value="Bun + Elysia" />
              <Tech label="Workbook engine" value="ExcelJS" />
              <Tech label="Storage" value="Isolated repository interface" />
            </div>
          </section>
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <section className={sectionClass}>
            <h2 className="text-xl font-bold text-slate-950">What you do in Excel</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <li>
                <Dot text="Download the client or service workbook you need." />
              </li>
              <li>
                <Dot text="Enter or edit data from row 6 onward." />
              </li>
              <li>
                <Dot text="Keep the technical keys unchanged when they identify relationships." />
              </li>
              <li>
                <Dot text="Use dropdowns where they are provided." />
              </li>
              <li>
                <Dot text="Save the workbook and upload it for validation." />
              </li>
              <li>
                <Dot text="Fix red cells or validation errors, then upload again." />
              </li>
            </ul>
          </section>
          <section className={sectionClass}>
            <h2 className="text-xl font-bold text-slate-950">What you do not need to do</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <li>
                <Dot text="You do not enter database IDs or MongoDB identifiers." />
              </li>
              <li>
                <Dot text="You do not manually re-enter the same client on every related sheet." />
              </li>
              <li>
                <Dot text="You do not calculate relationship validity yourself." />
              </li>
              <li>
                <Dot text="You do not import a workbook with blocking errors." />
              </li>
              <li>
                <Dot text="You do not maintain the ValidationReport sheet." />
              </li>
            </ul>
          </section>
        </div>
        <section className={`${sectionClass} mt-6`}>
          <h2 className="text-xl font-bold text-slate-950">What the workbook validates</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Rule
              title="Required data"
              text="Required fields cannot be blank. Optional blanks stay blank."
            />
            <Rule
              title="Formats"
              text="Dates, numbers, booleans, email, phone, PAN, GST, and URL formats are checked."
            />
            <Rule
              title="Keys"
              text="Business keys must be stable, correctly formatted, and unique in their scope."
            />
            <Rule
              title="Relationships"
              text="Client, service, task, parent, and dependency references must exist and match scope."
            />
            <Rule
              title="Business groups"
              text="GST settings, contact points, and related records must be complete together."
            />
            <Rule
              title="Duplicates"
              text="Duplicate keys, primary records, statutory types, and dependency edges are blocked."
            />
            <Rule
              title="Task graphs"
              text="Parent task and dependency cycles are detected before import."
            />
            <Rule
              title="Safety"
              text="Formula cells and formula-injection text are rejected or safely handled."
            />
          </div>
        </section>
        <section className={`${sectionClass} mt-6`}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-950">ValidationReport</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
                This is a generated troubleshooting sheet. It tells you exactly where a problem is
                and what to fix. It is not an input sheet and it never becomes part of the business
                data.
              </p>
            </div>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
              Generated by the system
            </span>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <ReportField label="Severity" text="ERROR blocks import. WARNING does not." />
            <ReportField label="Location" text="Sheet, row, column, and header." />
            <ReportField label="Code" text="A stable reason such as REFERENCE_NOT_FOUND." />
            <ReportField label="Message" text="A plain-language correction." />
          </div>
        </section>
        <section className={`${sectionClass} mt-6`}>
          <h2 className="text-xl font-bold text-slate-950">Simple operating principle</h2>
          <div className="mt-4 rounded-xl bg-slate-950 px-5 py-4 text-sm leading-6 text-white">
            <span className="font-bold text-indigo-300">Excel is the editing surface.</span> The
            application is the authority. The workbook helps you prepare and understand changes,
            while the application performs the final validation and imports everything atomically.
          </div>
        </section>
      </main>
    </div>
  );
}

function Flow() {
  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
      <Step number="1" title="Choose" text="Client or service workbook" />
      <Arrow />
      <Step number="2" title="Edit" text="Enter or update Excel data" />
      <Arrow />
      <Step number="3" title="Validate" text="System checks every sheet" />
      <Arrow />
      <Step number="4" title="Import" text="Only clean data is saved" />
    </div>
  );
}
function Step({ number, title, text }: { number: string; title: string; text: string }) {
  return (
    <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2">
        <span className="flex size-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
          {number}
        </span>
        <span className="font-bold text-slate-950">{title}</span>
      </div>
      <p className="mt-2 text-xs leading-5 text-slate-500">{text}</p>
    </div>
  );
}
function Arrow() {
  return <span className="hidden text-xl text-slate-300 sm:block">→</span>;
}
function Tech({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-950">{value}</span>
    </div>
  );
}
function Rule({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <h3 className="font-semibold text-slate-950">{title}</h3>
      <p className="mt-1 text-xs leading-5 text-slate-500">{text}</p>
    </div>
  );
}
function ReportField({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <div className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</div>
      <p className="mt-2 text-sm leading-5 text-slate-700">{text}</p>
    </div>
  );
}
function Dot({ text }: { text: string }) {
  return (
    <span className="flex gap-3">
      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-indigo-600" />
      {text}
    </span>
  );
}
