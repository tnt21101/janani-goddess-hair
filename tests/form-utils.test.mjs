import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const { createSubmissionGate, isValidEmail, normalizeEmail } = require("../form-utils.js");

test("normalizes and validates email addresses", () => {
  assert.equal(normalizeEmail("  Founder@Example.COM "), "founder@example.com");
  assert.equal(isValidEmail("founder@example.com"), true);
  assert.equal(isValidEmail("not-an-email"), false);
});

test("prevents simultaneous submissions", () => {
  const gate = createSubmissionGate();
  assert.equal(gate.start("one@example.com").accepted, true);
  assert.deepEqual(gate.start("two@example.com"), { accepted: false, reason: "in-flight" });
  gate.finish("one@example.com", true);
  assert.equal(gate.isInFlight(), false);
});

test("prevents a completed email from being submitted twice", () => {
  const gate = createSubmissionGate();
  gate.start("Founder@Example.com");
  gate.finish("founder@example.com", true);
  assert.deepEqual(gate.start(" FOUNDER@example.com "), { accepted: false, reason: "duplicate" });
});

test("allows retry after provider failure", () => {
  const gate = createSubmissionGate();
  gate.start("retry@example.com");
  gate.finish("retry@example.com", false);
  assert.equal(gate.start("retry@example.com").accepted, true);
});
