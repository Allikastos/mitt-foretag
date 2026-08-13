import assert from "node:assert/strict";
import test from "node:test";
import {
  evaluateIntegrationReadiness,
  integrationCatalog,
  integrationIds,
} from "./catalog.ts";

test("integrationskatalogen har en unik definition för varje integration", () => {
  const ids = integrationCatalog.map((integration) => integration.id);

  assert.deepEqual(new Set(ids), new Set(integrationIds));
  assert.equal(ids.length, new Set(ids).size);
});

test("en ovald leverantör visas som kodmässigt förberedd", () => {
  assert.equal(
    evaluateIntegrationReadiness({
      providerSelected: false,
      configurationReady: false,
      featureEnabled: false,
      connectionStatus: "not_connected",
    }),
    "code_ready",
  );
});

test("status kräver konfiguration, godkännande och test i säker ordning", () => {
  assert.equal(
    evaluateIntegrationReadiness({
      providerSelected: true,
      configurationReady: false,
      featureEnabled: false,
      connectionStatus: "not_connected",
    }),
    "configuration_required",
  );
  assert.equal(
    evaluateIntegrationReadiness({
      providerSelected: true,
      configurationReady: true,
      featureEnabled: false,
      connectionStatus: "not_connected",
    }),
    "approval_required",
  );
  assert.equal(
    evaluateIntegrationReadiness({
      providerSelected: true,
      configurationReady: true,
      featureEnabled: true,
      connectionStatus: "not_connected",
    }),
    "ready_for_test",
  );
});

test("endast en frisk, konfigurerad och aktiverad anslutning är aktiv", () => {
  assert.equal(
    evaluateIntegrationReadiness({
      providerSelected: true,
      configurationReady: true,
      featureEnabled: true,
      connectionStatus: "connected",
    }),
    "active",
  );
  assert.equal(
    evaluateIntegrationReadiness({
      providerSelected: true,
      configurationReady: true,
      featureEnabled: true,
      connectionStatus: "error",
    }),
    "attention_required",
  );
});
