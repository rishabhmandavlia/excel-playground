import { describe, expect, test } from "bun:test";

import { demoData } from "./demo";
import { validateBundle } from "./validation";
import { createDemoWorkbook, parseWorkbook } from "./workbook";

describe("excel master contract", () => {
  test("demo workbook round-trips without blocking errors", async () => {
    const result = await parseWorkbook(await createDemoWorkbook());
    expect(result.issues.filter((issue) => issue.severity === "ERROR")).toHaveLength(0);
    expect(result.data.clients).toHaveLength(demoData.clients.length);
  });
  test("invalid GST configuration is blocking", () => {
    const result = validateBundle({
      ...demoData,
      services: [{ ...demoData.services[0], is_non_gst: true, hsn_sac_code: "998231" }],
    });
    expect(result.issues.some((issue) => issue.code === "INVALID_GST_CONFIGURATION")).toBe(true);
  });
  test("duplicate keys are blocking", () => {
    const result = validateBundle({
      ...demoData,
      clients: [demoData.clients[0], demoData.clients[0]],
    });
    expect(result.issues.some((issue) => issue.code === "DUPLICATE_KEY")).toBe(true);
  });

  test("expanded client and service supporting sheets validate their service/client keys", () => {
    const result = validateBundle({
      ...demoData,
      clientBillToParties: [
        {
          client_key: "missing_client",
          bill_to_party_key: "billing",
          display_name: "Billing party",
          gst_registration_mode: "NON_GST",
          line1: "1 Main Street",
          city: "Mumbai",
          state: "Maharashtra",
          postal_code: "400001",
          country_code: "IN",
          effective_from: "2026-04-01",
          is_active: true,
        },
      ],
      serviceFrequencyRates: [
        { service_key: "missing_service", frequency_key: "annual", hourly_rate: 1000 },
      ],
    });
    expect(result.issues.filter((issue) => issue.code === "REFERENCE_NOT_FOUND")).toHaveLength(2);
  });
});
