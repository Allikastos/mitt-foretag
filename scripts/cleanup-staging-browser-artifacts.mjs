import { createClient } from "@supabase/supabase-js";
import {
  assertStagingLink,
  getStagingApiKeys,
  requireConfirmation,
  STAGING_URL,
} from "./staging-supabase.mjs";

const organizationId = "10000000-0000-4000-8000-000000000001";
const customerName = "Nattest Kund 20260814";
const taskTitle = "Nattest återkoppling 20260814";
const options = { auth: { persistSession: false, autoRefreshToken: false } };

function stop(message) {
  console.error(`Webbläsarstädningen avbrots: ${message}`);
  process.exit(1);
}

async function requireData(promise, label) {
  const { data, error } = await promise;
  if (error) throw new Error(`${label}: ${error.message}`);
  return data;
}

try {
  requireConfirmation(
    "ALTURA_STAGING_BROWSER_CLEANUP_CONFIRMATION",
    "SYNTHETIC_BROWSER_DATA_ONLY",
  );
  assertStagingLink();
  const { secret } = getStagingApiKeys();
  const service = createClient(STAGING_URL, secret, options);
  const customers = await requireData(
    service
      .from("customers")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("company_name", customerName),
    "hamta nattestkund",
  );
  const customerIds = customers.map(({ id }) => id);
  const invoices = customerIds.length
    ? await requireData(
        service
          .from("invoices")
          .select("id")
          .eq("organization_id", organizationId)
          .in("customer_id", customerIds),
        "hamta nattestfakturor",
      )
    : [];
  const invoiceIds = invoices.map(({ id }) => id);
  const tasks = await requireData(
    service
      .from("tasks")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("title", taskTitle),
    "hamta nattestuppgifter",
  );
  const taskIds = tasks.map(({ id }) => id);
  const invoiceLines = invoiceIds.length
    ? await requireData(
        service.from("invoice_lines").select("id").in("invoice_id", invoiceIds),
        "hamta nattestfakturarader",
      )
    : [];
  const allDocuments = await requireData(
    service
      .from("documents")
      .select("id, file_path, customer_id, invoice_id")
      .eq("organization_id", organizationId),
    "hamta stagingdokument",
  );
  const documents = allDocuments.filter(
    ({ customer_id: customerId, invoice_id: invoiceId }) =>
      customerIds.includes(customerId) || invoiceIds.includes(invoiceId),
  );
  const storagePaths = documents
    .map(({ file_path: storagePath }) => storagePath)
    .filter(Boolean);
  if (storagePaths.length > 0) {
    assertStagingLink();
    await requireData(
      service.storage.from("hub-documents").remove(storagePaths),
      "radera nattestfiler",
    );
  }

  const entityIds = new Set([
    ...customerIds,
    ...taskIds,
    ...invoiceIds,
    ...invoiceLines.map(({ id }) => id),
    ...documents.map(({ id }) => id),
  ]);
  const activities = await requireData(
    service
      .from("activity_log")
      .select("id, entity_id, action")
      .eq("organization_id", organizationId),
    "hamta nattestaktivitet",
  );
  const activityIds = activities
    .filter(
      ({ action, entity_id: entityId }) =>
        entityIds.has(entityId) || action === "organization_settings_updated",
    )
    .map(({ id }) => id);
  if (activityIds.length > 0) {
    assertStagingLink();
    await requireData(
      service.from("activity_log").delete().in("id", activityIds),
      "radera nattestaktivitet",
    );
  }

  assertStagingLink();
  if (documents.length > 0) {
    await requireData(
      service.from("documents").delete().in("id", documents.map(({ id }) => id)),
      "radera nattestdokument",
    );
  }
  if (invoiceLines.length > 0) {
    await requireData(
      service
        .from("invoice_lines")
        .delete()
        .in("id", invoiceLines.map(({ id }) => id)),
      "radera nattestfakturarader",
    );
  }
  if (invoiceIds.length > 0) {
    await requireData(
      service.from("invoices").delete().in("id", invoiceIds),
      "radera nattestfakturor",
    );
  }
  if (taskIds.length > 0) {
    await requireData(
      service.from("tasks").delete().in("id", taskIds),
      "radera nattestuppgifter",
    );
  }
  if (customerIds.length > 0) {
    await requireData(
      service.from("customers").delete().in("id", customerIds),
      "radera nattestkunder",
    );
  }
  console.log("Endast markerade syntetiska webbläsarartefakter raderades.");
} catch (error) {
  stop(error instanceof Error ? error.message : "okant fel");
}
