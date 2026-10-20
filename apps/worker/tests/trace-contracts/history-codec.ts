import assert from "node:assert/strict";
import { createRequire } from "node:module";
import type { History } from "@temporalio/worker";

// The lockfile installs separate protobufjs copies beside common and proto.
// protobufjs' proto-JSON helpers require a Type from their own module instance.
// Resolve both from the proto package, rather than changing production deps or
// passing a Type across copies through common/lib/proto-utils.
const require = createRequire(import.meta.url);
const protoRequire = createRequire(require.resolve("@temporalio/proto"));
const { temporal } = protoRequire("@temporalio/proto");
const { fromJson, toJson } = protoRequire("protobufjs/ext/protojson");
const historyType = temporal.api.history.v1.History;

export function decodeHistory(json: unknown): History {
  return fromJson(historyType, json, { ignoreUnknownFields: true });
}

export function encodeHistory(history: History): string {
  const message = historyType.fromObject(history);
  const json = toJson(historyType, message);
  // Prove recording does not drop or reinterpret known protobuf fields.
  assert.deepEqual(historyType.encode(decodeHistory(json)).finish(), historyType.encode(message).finish());
  return JSON.stringify(json, null, 2) + "\n";
}
