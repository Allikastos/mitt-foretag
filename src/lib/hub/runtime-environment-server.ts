import "server-only";

import {
  assertSafeHubEnvironment,
  assertSafeHubFeatureConfiguration,
} from "./runtime-environment.ts";

export function assertSafeHubServerEnvironment() {
  const assessment = assertSafeHubEnvironment(process.env);
  assertSafeHubFeatureConfiguration(process.env);
  return assessment;
}
