(function attachJananiFormUtils(globalScope) {
  "use strict";

  function normalizeEmail(value) {
    return String(value || "").trim().toLowerCase();
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalizeEmail(value));
  }

  function createSubmissionGate() {
    var inFlight = false;
    var completed = new Set();

    return {
      start: function start(value) {
        var email = normalizeEmail(value);
        if (inFlight) return { accepted: false, reason: "in-flight" };
        if (completed.has(email)) return { accepted: false, reason: "duplicate" };
        inFlight = true;
        return { accepted: true, email: email };
      },
      finish: function finish(value, succeeded) {
        var email = normalizeEmail(value);
        if (succeeded) completed.add(email);
        inFlight = false;
      },
      isCompleted: function isCompleted(value) {
        return completed.has(normalizeEmail(value));
      },
      isInFlight: function isInFlight() {
        return inFlight;
      },
    };
  }

  var api = { normalizeEmail: normalizeEmail, isValidEmail: isValidEmail, createSubmissionGate: createSubmissionGate };
  globalScope.JANANI_FORM = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
