(function renderJananiLandingPage() {
  "use strict";

  var h = React.createElement;
  var useState = React.useState;
  var useEffect = React.useEffect;
  var useRef = React.useRef;
  var createContext = React.createContext;
  var useContext = React.useContext;
  var content = window.JANANI;
  var formUtils = window.JANANI_FORM;
  var FormContext = createContext(null);

  function getAttribution() {
    var params = new URLSearchParams(window.location.search);
    var trafficSource = params.get("utm_source") || "";
    if (!trafficSource && document.referrer) {
      try { trafficSource = new URL(document.referrer).hostname; } catch (error) { trafficSource = ""; }
    }
    if (!trafficSource) trafficSource = "direct";

    var width = window.innerWidth || document.documentElement.clientWidth;
    var deviceType = width < 768 ? "mobile" : width < 1024 ? "tablet" : "desktop";
    return {
      source: trafficSource.slice(0, 200),
      utm_source: (params.get("utm_source") || "").slice(0, 200),
      utm_medium: (params.get("utm_medium") || "").slice(0, 200),
      utm_campaign: (params.get("utm_campaign") || "").slice(0, 200),
      utm_term: (params.get("utm_term") || "").slice(0, 200),
      utm_content: (params.get("utm_content") || "").slice(0, 200),
      landing_page: window.location.pathname.slice(0, 500),
      device_type: deviceType,
    };
  }

  function getNetlifyAttributionFields(formSource) {
    var attribution = getAttribution();
    return Object.assign({}, attribution, { source: formSource, traffic_source: attribution.source });
  }

  function trackEvent(name, details) {
    var payload = Object.assign({}, getAttribution(), details || {});
    if (typeof window.gtag === "function") {
      window.gtag("event", name, payload);
      return;
    }
    if (typeof window.plausible === "function") {
      window.plausible(name, { props: payload });
      return;
    }
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push(Object.assign({ event: name }, payload));
    }
  }

  function StarIcon(props) {
    return h(
      "svg",
      { className: props.className || "", viewBox: "0 0 24 24", "aria-hidden": "true" },
      h("path", { fill: "currentColor", d: "M12 0c.6 7.4 4.6 11.4 12 12-7.4.6-11.4 4.6-12 12-.6-7.4-4.6-11.4-12-12 7.4-.6 11.4-4.6 12-12z" })
    );
  }

  function Icon(props) {
    var common = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" };
    var paths = {
      mail: h(React.Fragment, null, h("rect", Object.assign({ x: 3, y: 5, width: 18, height: 14, rx: 2 }, common)), h("path", Object.assign({ d: "M3.5 7 12 13l8.5-6" }, common))),
      lock: h(React.Fragment, null, h("rect", Object.assign({ x: 5, y: 11, width: 14, height: 10, rx: 2 }, common)), h("path", Object.assign({ d: "M8 11V8a4 4 0 0 1 8 0v3" }, common))),
      moon: h("path", Object.assign({ d: "M20 14.5A8.5 8.5 0 1 1 9.5 4 6.8 6.8 0 0 0 20 14.5Z" }, common)),
      sun: h(React.Fragment, null, h("circle", Object.assign({ cx: 12, cy: 12, r: 4 }, common)), h("path", Object.assign({ d: "M12 2.5v2m0 15v2M2.5 12h2m15 0h2M5.3 5.3l1.4 1.4m10.6 10.6 1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" }, common))),
      arrowUp: h("path", Object.assign({ d: "M12 19V5m-6 6 6-6 6 6" }, common)),
      check: h("path", Object.assign({ d: "m5 12 4 4L19 6" }, common)),
    };
    return h("svg", { className: props.className || "", viewBox: "0 0 24 24", "aria-hidden": "true" }, paths[props.name]);
  }

  function BenefitIcon(props) {
    var common = { fill: "none", stroke: "currentColor", strokeWidth: 1.3, strokeLinecap: "round", strokeLinejoin: "round" };
    var path;
    if (props.name === "strength") {
      path = h(React.Fragment, null, h("path", Object.assign({ d: "M18 5c12 7 0 13 12 20s0 13 6 18" }, common)), h("path", Object.assign({ d: "M30 5c-12 7 0 13-12 20s0 13-6 18" }, common)), h("path", Object.assign({ d: "M20 43h8" }, common)));
    } else if (props.name === "length") {
      path = h(React.Fragment, null, h("path", Object.assign({ d: "M20 4c10 7-6 13 4 20s-6 13 2 20" }, common)), h("path", Object.assign({ d: "M36 6v36M33 6h6M33 42h6" }, common)));
    } else {
      path = h(React.Fragment, null, h("path", Object.assign({ d: "M20 12c.8 9 5 13.2 14 14-9 .8-13.2 5-14 14-.8-9-5-13.2-14-14 9-.8 13.2-5 14-14z" }, common)), h("path", Object.assign({ d: "M37 4c.3 3.6 2 5.3 5.5 5.5-3.6.3-5.3 2-5.5 5.5-.3-3.6-2-5.3-5.5-5.5 3.6-.3 5.3-2 5.5-5.5z" }, common)));
    }
    return h("svg", { viewBox: "0 0 48 48", "aria-hidden": "true" }, path);
  }

  function SmartImage(props) {
    var slot = props.slot;
    var failedState = useState(false);
    var failed = failedState[0];
    var setFailed = failedState[1];
    var focus = slot.focus || { x: 0.5, y: 0.5 };
    var className = ["smart-img", props.className || "", failed ? "is-missing" : ""].filter(Boolean).join(" ");

    if (failed) {
      return h("div", { className: className, role: "img", "aria-label": slot.alt }, h("span", { className: "placeholder-label" }, slot.placeholder));
    }

    return h("img", {
      className: className,
      src: slot.src,
      alt: slot.alt,
      loading: props.priority ? "eager" : "lazy",
      fetchPriority: props.priority ? "high" : "auto",
      style: { objectPosition: `${focus.x * 100}% ${focus.y * 100}%` },
      onError: function handleImageError() { setFailed(true); },
    });
  }

  function ThemeToggle(props) {
    var label = props.theme === "dark" ? content.ui.theme.toLight : content.ui.theme.toDark;
    return h(
      "button",
      { type: "button", className: "theme-toggle", onClick: props.onToggle, "aria-label": label, title: label },
      h(Icon, { name: "moon", className: "icon-moon" }),
      h(Icon, { name: "sun", className: "icon-sun" })
    );
  }

  function focusFoundingList(location) {
    trackEvent("founding_list_cta_click", { location: location });
    var input = document.getElementById("hero-email");
    if (!input) return;
    input.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
    window.setTimeout(function focusInput() { input.focus({ preventScroll: true }); }, 450);
  }

  function Header(props) {
    return h(
      "header",
      { className: "site-header wrap" },
      h(
        "a",
        { className: "wordmark", href: "#top", "aria-label": `${content.brand.name} home` },
        h(StarIcon, { className: "star" }),
        h("span", { className: "wordmark-name gold-text" }, content.brand.name),
        h("span", { className: "wordmark-sub" }, content.brand.tagline)
      ),
      h(
        "nav",
        { className: "header-actions", "aria-label": "Primary navigation" },
        h("a", { className: "header-cta", href: "#founding-list-form", onClick: function handleHeaderCta(event) { event.preventDefault(); focusFoundingList("header"); } }, "JOIN THE FOUNDING LIST"),
        h(
          "p",
          { className: "header-note", "aria-hidden": "true" },
          h("span", null, content.brand.headerNote.map(function renderLine(line) { return h(React.Fragment, { key: line }, line, h("br")); }))
        ),
        h(ThemeToggle, { theme: props.theme, onToggle: props.onToggleTheme })
      )
    );
  }

  function ScentBadge() {
    return h(
      "svg",
      { className: "scent-badge", viewBox: "0 0 120 120", "aria-hidden": "true" },
      h("defs", null, h("path", { id: "scent-ring", d: "M60,60 m-43,0 a43,43 0 1,1 86,0 a43,43 0 1,1 -86,0" })),
      h("text", { className: "ring" }, h("textPath", { href: "#scent-ring", startOffset: "0%" }, content.hero.scentBadge)),
      h(StarIcon, { className: "scent-star" })
    );
  }

  async function sendSignup(payload) {
    if (typeof window.__JANANI_TEST_SUBMIT__ === "function") {
      await window.__JANANI_TEST_SUBMIT__(payload);
      return;
    }

    var kitFormId = content.signup.kitFormId;
    if (kitFormId) {
      var kitBody = new FormData();
      kitBody.append("email_address", payload.email);
      await fetch(`https://app.kit.com/forms/${kitFormId}/subscriptions`, { method: "POST", body: kitBody, mode: "no-cors" });
      return;
    }

    if (["localhost", "127.0.0.1", ""].includes(window.location.hostname)) {
      await new Promise(function resolvePreview(resolve) { window.setTimeout(resolve, 750); });
      return;
    }

    var body = new URLSearchParams(Object.assign(
      { "form-name": "waitlist", email: payload.email, "bot-field": "" },
      getNetlifyAttributionFields(payload.source)
    ));
    var response = await fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
    if (!response.ok) throw new Error(`Signup failed with status ${response.status}`);
  }

  async function sendFeedback(answer, signupLocation) {
    if (["localhost", "127.0.0.1", ""].includes(window.location.hostname)) {
      await new Promise(function resolvePreview(resolve) { window.setTimeout(resolve, 300); });
      return;
    }

    var body = new URLSearchParams(Object.assign(
      { "form-name": "founding-feedback", frustration: answer, signup_location: signupLocation, "bot-field": "" },
      getNetlifyAttributionFields("post-signup-survey")
    ));
    var response = await fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
    if (!response.ok) throw new Error(`Survey response failed with status ${response.status}`);
  }

  function FormProvider(props) {
    var stateTuple = useState({ status: "idle", message: "", submittedEmail: "", submittedFrom: "" });
    var state = stateTuple[0];
    var setState = stateTuple[1];
    var gateRef = useRef(formUtils.createSubmissionGate());

    async function submit(payload) {
      var result = gateRef.current.start(payload.email);
      if (!result.accepted) {
        if (result.reason === "duplicate") setState({ status: "error", message: content.form.duplicateMessage, submittedEmail: payload.email, submittedFrom: payload.source });
        return false;
      }

      setState({ status: "sending", message: "", submittedEmail: result.email, submittedFrom: payload.source });
      trackEvent("founding_list_submit", { location: payload.source });
      try {
        await sendSignup({ email: result.email, source: payload.source });
        gateRef.current.finish(result.email, true);
        setState({ status: "done", message: "", submittedEmail: result.email, submittedFrom: payload.source });
        trackEvent("founding_list_success", { location: payload.source });
        return true;
      } catch (error) {
        gateRef.current.finish(result.email, false);
        setState({ status: "error", message: content.form.errorMessage, submittedEmail: result.email, submittedFrom: payload.source });
        trackEvent("founding_list_error", { location: payload.source });
        return false;
      }
    }

    function clearError() {
      if (state.status === "error") setState({ status: "idle", message: "", submittedEmail: "", submittedFrom: "" });
    }

    return h(FormContext.Provider, { value: { state: state, submit: submit, clearError: clearError } }, props.children);
  }

  function FoundingSurvey(props) {
    var answerTuple = useState("");
    var answer = answerTuple[0];
    var setAnswer = answerTuple[1];
    var statusTuple = useState({ state: "idle", message: "" });
    var status = statusTuple[0];
    var setStatus = statusTuple[1];
    var isSending = status.state === "sending";
    var surveyId = `${props.signupLocation}-hair-survey`;
    var errorId = `${surveyId}-error`;

    async function handleSubmit(event) {
      event.preventDefault();
      if (!answer || isSending) return;
      setStatus({ state: "sending", message: "" });
      try {
        await sendFeedback(answer, props.signupLocation);
        setStatus({ state: "done", message: content.postSignup.surveySuccess });
        trackEvent("founding_list_survey_response", { location: props.signupLocation, answer: answer });
      } catch (error) {
        setStatus({ state: "error", message: content.postSignup.surveyError });
      }
    }

    function skipSurvey() {
      setStatus({ state: "skipped", message: content.postSignup.surveySkipMessage });
    }

    return h(
      "form",
      { className: "founding-survey", name: "founding-feedback", method: "POST", action: "/", onSubmit: handleSubmit, "aria-busy": isSending },
      status.state === "done" || status.state === "skipped"
        ? h("p", { role: "status", "aria-live": "polite" }, status.message)
        : h(
            React.Fragment,
            null,
            h(
              "fieldset",
              { disabled: isSending, "aria-describedby": status.state === "error" ? errorId : undefined },
              h("legend", null, content.postSignup.surveyQuestion),
              h("div", { className: "founding-survey__options" }, content.postSignup.surveyOptions.map(function renderOption(option, index) {
                var optionId = `${surveyId}-option-${index}`;
                return h(
                  "label",
                  { htmlFor: optionId, key: option },
                  h("input", {
                    id: optionId,
                    name: surveyId,
                    type: "radio",
                    value: option,
                    required: true,
                    checked: answer === option,
                    onChange: function chooseAnswer() { setAnswer(option); },
                  }),
                  h("span", null, option)
                );
              }))
            ),
            status.state === "error" ? h("p", { id: errorId, className: "form-error", role: "alert" }, status.message) : null,
            h(
              "div",
              { className: "founding-survey__actions" },
              h("button", { type: "submit", disabled: isSending }, isSending ? content.postSignup.surveySending : content.postSignup.surveySubmit),
              h("button", { type: "button", onClick: skipSurvey, disabled: isSending }, content.postSignup.surveySkip)
            )
          )
    );
  }

  function getReferralUrl() {
    var url = new URL(window.location.pathname, window.location.origin);
    url.searchParams.set("utm_source", "member");
    url.searchParams.set("utm_medium", "referral");
    url.searchParams.set("utm_campaign", "founding-list");
    return url.toString();
  }

  async function copyText(value) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      try {
        await navigator.clipboard.writeText(value);
        return;
      } catch (error) {
        // Fall back to the selection API for browsers that deny clipboard access.
      }
    }

    var activeElement = document.activeElement;
    var input = document.createElement("textarea");
    input.value = value;
    input.setAttribute("readonly", "");
    input.setAttribute("aria-hidden", "true");
    input.tabIndex = -1;
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.appendChild(input);
    input.select();
    var copied = false;
    try {
      copied = document.execCommand("copy");
    } finally {
      input.remove();
      if (activeElement && typeof activeElement.focus === "function") activeElement.focus();
    }
    if (!copied) throw new Error("Clipboard copy is unavailable");
  }

  function ReferralActions() {
    var statusTuple = useState("");
    var referralStatus = statusTuple[0];
    var setReferralStatus = statusTuple[1];
    var supportsShare = typeof navigator.share === "function";

    async function shareInvite() {
      trackEvent("founding_list_referral_click", { action: "share" });
      try {
        await navigator.share({ title: "JANANI Founding List", text: content.postSignup.referralBody, url: getReferralUrl() });
        setReferralStatus(content.postSignup.referralShared);
      } catch (error) {
        if (!error || error.name !== "AbortError") setReferralStatus(content.postSignup.referralError);
      }
    }

    async function copyInvite() {
      trackEvent("founding_list_referral_click", { action: "copy" });
      try {
        await copyText(getReferralUrl());
        setReferralStatus(content.postSignup.referralCopied);
      } catch (error) {
        setReferralStatus(content.postSignup.referralError);
      }
    }

    return h(
      "div",
      null,
      h("h4", null, content.postSignup.referralHeading),
      h("p", null, content.postSignup.referralBody),
      h(
        "div",
        { className: "referral-actions" },
        supportsShare ? h("button", { type: "button", onClick: shareInvite }, content.postSignup.referralShare) : null,
        h("button", { type: "button", onClick: copyInvite }, content.postSignup.referralCopy)
      ),
      h("p", { className: "referral-status", role: "status", "aria-live": "polite", "aria-atomic": "true" }, referralStatus)
    );
  }

  function PostSignup(props) {
    return h(
      "section",
      { className: "post-signup", "aria-label": "Optional next steps" },
      h("div", null, h("h4", null, content.postSignup.surveyHeading), h(FoundingSurvey, { signupLocation: props.signupLocation })),
      h(ReferralActions)
    );
  }

  function SignupForm(props) {
    var context = useContext(FormContext);
    var emailTuple = useState("");
    var email = emailTuple[0];
    var setEmail = emailTuple[1];
    var validationTuple = useState("");
    var validationError = validationTuple[0];
    var setValidationError = validationTuple[1];
    var containerRef = useRef(null);
    var viewedRef = useRef(false);
    var isSending = context.state.status === "sending";
    var errorMessage = validationError || (context.state.status === "error" ? context.state.message : "");
    var errorId = `${props.id}-error`;
    var trustId = `${props.id}-trust`;

    useEffect(function observeForm() {
      var node = containerRef.current;
      if (!node || viewedRef.current) return undefined;
      if (!("IntersectionObserver" in window)) {
        viewedRef.current = true;
        trackEvent("founding_list_form_view", { location: props.id });
        return undefined;
      }
      var observer = new IntersectionObserver(function handleEntries(entries) {
        if (entries.some(function isVisible(entry) { return entry.isIntersecting; })) {
          viewedRef.current = true;
          trackEvent("founding_list_form_view", { location: props.id });
          observer.disconnect();
        }
      }, { threshold: 0.35 });
      observer.observe(node);
      return function disconnectObserver() { observer.disconnect(); };
    }, [props.id]);

    if (context.state.status === "done") {
      return h(
        "div",
        { ref: containerRef, className: `success ${props.dark ? "success--dark" : ""}` },
        h(
          "div",
          { role: "status", "aria-live": "polite" },
          h(StarIcon, { className: "divider-star" }),
          h("h3", null, content.form.successTitle),
          h("p", null, content.form.successBody)
        ),
        h("a", { className: "guide-link", href: content.form.guideUrl }, content.form.guideLabel),
        context.state.submittedFrom === props.id ? h(PostSignup, { signupLocation: props.id }) : null
      );
    }

    async function handleSubmit(event) {
      event.preventDefault();
      trackEvent("founding_list_cta_click", { location: props.id, action: "submit" });
      if (!formUtils.isValidEmail(email)) {
        setValidationError(content.form.invalidEmail);
        return;
      }
      setValidationError("");
      await context.submit({ email: email, source: props.id });
    }

    function handleEmailChange(event) {
      setEmail(event.target.value);
      if (validationError) setValidationError("");
      context.clearError();
    }

    var formClass = ["signup", props.inline ? "signup--inline" : "", props.dark ? "signup--dark" : ""].filter(Boolean).join(" ");
    var attributionFields = getNetlifyAttributionFields(props.id);
    return h(
      "form",
      { ref: containerRef, id: props.id === "hero" ? "founding-list-form" : undefined, className: formClass, name: "waitlist", method: "POST", onSubmit: handleSubmit, noValidate: true, "aria-busy": isSending },
      h("input", { type: "hidden", name: "form-name", value: "waitlist" }),
      h("input", { type: "hidden", name: "source", value: props.id }),
      Object.keys(attributionFields).filter(function skipFormSource(name) { return name !== "source"; }).map(function renderAttributionField(name) {
        return h("input", { key: name, type: "hidden", name: name, value: attributionFields[name] });
      }),
      h("input", { type: "hidden", name: "bot-field", value: "" }),
      h(
        "div",
        { className: "field" },
        h("label", { className: "sr-only", htmlFor: `${props.id}-email` }, content.form.emailPlaceholder),
        h(Icon, { name: "mail" }),
        h("input", {
          id: `${props.id}-email`,
          name: "email",
          type: "email",
          inputMode: "email",
          autoComplete: "email",
          required: true,
          placeholder: content.form.emailPlaceholder,
          value: email,
          disabled: isSending,
          onChange: handleEmailChange,
          "aria-invalid": Boolean(errorMessage),
          "aria-describedby": errorMessage ? `${errorId} ${trustId}` : trustId,
        })
      ),
      h("button", { className: "cta", type: "submit", disabled: isSending }, h("span", null, isSending ? content.form.sending : content.form.button), h(StarIcon)),
      errorMessage ? h("p", { id: errorId, className: "form-error", role: "alert" }, errorMessage) : null,
      h("p", { id: trustId, className: "micro" }, h(Icon, { name: "lock" }), h("span", null, content.form.trust))
    );
  }

  function Hero() {
    return h(
      "section",
      { id: "top", className: "hero wrap", "aria-labelledby": "hero-heading" },
      h(
        "div",
        { className: "hero-visual", "aria-label": content.brand.productName },
        h("div", { className: "silk", "aria-hidden": "true" }),
        h("div", { className: "arch" }, h(SmartImage, { slot: content.images.heroProduct, className: "arch-img", priority: true })),
        h(ScentBadge)
      ),
      h(
        "div",
        { className: "hero-copy" },
        h("p", { className: "eyebrow hero-eyebrow" }, content.hero.eyebrow),
        h("h1", { id: "hero-heading", className: "headline" }, content.hero.headline),
        h("p", { className: "product-category" }, content.hero.category),
        h("p", { className: "pillars", "aria-label": content.brand.pillars.join(", ") }, content.brand.pillars.map(function renderPillar(pillar, index) { return h(React.Fragment, { key: pillar }, index > 0 ? h("b", { "aria-hidden": "true" }, " · ") : null, pillar); })),
        h("p", { className: "lede" }, content.hero.body),
        h("p", { className: "incentive" }, content.hero.incentive),
        h(SignupForm, { id: "hero" })
      )
    );
  }

  function FoundingListBenefits() {
    return h(
      "section",
      { className: "founding-list", "aria-labelledby": "founding-list-heading" },
      h(
        "div",
        { className: "wrap founding-list-layout" },
        h("div", { className: "founding-list-intro" }, h("p", { className: "section-kicker" }, content.foundingList.eyebrow), h("h2", { id: "founding-list-heading" }, content.foundingList.heading), h("p", null, content.foundingList.intro)),
        h("ul", { className: "offer-grid" }, content.foundingList.benefits.map(function renderBenefit(benefit) { return h("li", { key: benefit }, h(Icon, { name: "check" }), h("span", null, benefit)); }))
      )
    );
  }

  function WhatToExpect() {
    return h(
      "section",
      { className: "benefits", "aria-labelledby": "benefits-heading" },
      h("div", { className: "wrap" }, h("h2", { id: "benefits-heading", className: "section-label" }, content.benefits.heading), h("div", { className: "benefit-grid" }, content.benefits.items.map(function renderBenefit(item) { return h("article", { className: "benefit", key: item.title }, h(BenefitIcon, { name: item.icon }), h("h3", null, item.title), h("p", null, item.text)); })))
    );
  }

  function Ingredients() {
    return h(
      "section",
      { className: "ingredients wrap", "aria-labelledby": "ingredients-heading" },
      h(
        "div",
        null,
        h("p", { className: "section-kicker" }, content.ingredients.eyebrow),
        h("h2", { id: "ingredients-heading", className: "section-title" }, h("span", null, content.ingredients.headline[0]), h("em", null, content.ingredients.headline[1])),
        h("p", { className: "ingredients-body" }, content.ingredients.differentiation),
        h("ul", { className: "notes", "aria-label": "Product attributes" }, content.ingredients.notes.map(function renderNote(note) { return h("li", { key: note }, note); })),
        h("p", { className: "usage-note" }, content.ingredients.usage),
        h("div", { className: "ingredient-grid" }, content.ingredients.cards.map(function renderIngredient(card) { return h("figure", { className: "ingredient", key: card.label }, h(SmartImage, { slot: content.images[card.image], className: "ingredient-img" }), h("figcaption", null, h("span", null, card.kicker), h("strong", null, card.label))); }))
      )
    );
  }

  function FounderPreview() {
    return h(
      "section",
      { className: "founder-preview", "aria-labelledby": "founder-preview-heading" },
      h("div", { className: "wrap founder-preview-inner" }, h(StarIcon, { className: "preview-star" }), h("p", { id: "founder-preview-heading", className: "section-kicker" }, content.founderPreview.eyebrow), h("blockquote", null, content.founderPreview.quote))
    );
  }

  function FounderStory() {
    return h(
      "section",
      { id: "founder-story", className: "founder", "aria-labelledby": "founder-heading" },
      h(
        "div",
        { className: "founder-grid wrap" },
        h("div", { className: "founder-photo" }, h(SmartImage, { slot: content.images.founder, className: "founder-img" })),
        h("div", { className: "founder-copy" }, h("p", { className: "eyebrow" }, content.founder.eyebrow), h("h2", { id: "founder-heading" }, content.founder.heading), content.founder.paragraphs.map(function renderParagraph(paragraph, index) { return h("p", { key: index }, paragraph); }), h("p", { className: "founder-close" }, content.founder.closing.map(function renderClosing(line) { return h("span", { key: line }, line); })), h("p", { className: "signoff" }, content.founder.signoff, h("span", { className: "signature" }, content.founder.signature)))
      )
    );
  }

  function FinalSignup() {
    return h(
      "section",
      { className: "final", "aria-labelledby": "final-heading" },
      h(
        "div",
        { className: "final-grid wrap" },
        h("div", { className: "polaroid" }, h(SmartImage, { slot: content.images.finalPolaroid, className: "polaroid-img" })),
        h("div", { className: "final-copy" }, h("p", { className: "final-eyebrow" }, content.final.eyebrow), h("h2", { id: "final-heading", className: "final-title" }, h("span", null, content.final.headline[0]), h("span", { className: "gold-text" }, content.final.headline[1])), h("p", { className: "final-sub" }, content.final.sub), h("p", { className: "final-incentive" }, content.hero.incentive), h(SignupForm, { id: "final", dark: true, inline: true }))
      )
    );
  }

  function Footer() {
    return h(
      "footer",
      { className: "site-footer" },
      h("div", { className: "wrap" }, h("p", { className: "footer-mark" }, content.brand.name), h("p", { className: "footer-pillars" }, content.brand.pillars.join(" · ")), h("ul", { className: "footer-links" }, content.footer.links.map(function renderLink(link) { return h("li", { key: link.label }, link.href === "#" ? h("span", { className: "footer-link--pending" }, link.label) : h("a", { href: link.href }, link.label)); })), h("p", { className: "footer-legal" }, content.footer.legal), h("p", { className: "footer-disclaimer" }, content.footer.disclaimer))
    );
  }

  function StickySignup() {
    var context = useContext(FormContext);
    var visibleTuple = useState(false);
    var visible = visibleTuple[0];
    var setVisible = visibleTuple[1];

    useEffect(function watchSignupVisibility() {
      var media = window.matchMedia("(max-width: 767px)");
      var forms = Array.prototype.slice.call(document.querySelectorAll(".signup"));
      var observer = null;

      function updateVisibility() {
        var hasFullyVisibleSubmit = forms.some(function hasSubmitInViewport(form) {
          var button = form.querySelector('button[type="submit"]');
          if (!button) return false;
          var bounds = button.getBoundingClientRect();
          return bounds.width > 0 && bounds.height > 0 && bounds.top >= 0 && bounds.bottom <= window.innerHeight;
        });
        setVisible(Boolean(media.matches && !hasFullyVisibleSubmit && context.state.status !== "done"));
      }

      if ("IntersectionObserver" in window) {
        observer = new IntersectionObserver(updateVisibility, { threshold: 0.01 });
        forms.forEach(function observeForm(form) { observer.observe(form); });
      }
      window.addEventListener("scroll", updateVisibility, { passive: true });
      window.addEventListener("resize", updateVisibility);
      if (typeof media.addEventListener === "function") media.addEventListener("change", updateVisibility);
      else if (typeof media.addListener === "function") media.addListener(updateVisibility);
      updateVisibility();

      return function stopWatchingVisibility() {
        if (observer) observer.disconnect();
        window.removeEventListener("scroll", updateVisibility);
        window.removeEventListener("resize", updateVisibility);
        if (typeof media.removeEventListener === "function") media.removeEventListener("change", updateVisibility);
        else if (typeof media.removeListener === "function") media.removeListener(updateVisibility);
      };
    }, [context.state.status]);

    return h(
      "aside",
      { className: `sticky-signup ${visible ? "is-visible" : ""}`, "aria-label": content.stickySignup.label, "aria-hidden": !visible },
      h(
        "div",
        { className: "wrap" },
        h("p", null, content.stickySignup.message),
        h("button", {
          className: "cta",
          type: "button",
          onClick: function handleStickySignup() { focusFoundingList("sticky"); },
          tabIndex: visible ? 0 : -1,
        }, content.stickySignup.button)
      )
    );
  }

  function ScrollTop() {
    var visibleTuple = useState(false);
    var visible = visibleTuple[0];
    var setVisible = visibleTuple[1];
    useEffect(function watchScroll() {
      function handleScroll() { setVisible(window.scrollY > content.ui.scrollTop.showAfter); }
      handleScroll();
      window.addEventListener("scroll", handleScroll, { passive: true });
      return function removeScrollListener() { window.removeEventListener("scroll", handleScroll); };
    }, []);
    return h("button", { type: "button", className: `scroll-top ${visible ? "is-visible" : ""}`, onClick: function scrollToTop() { window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); }, "aria-label": content.ui.scrollTop.label, tabIndex: visible ? 0 : -1, "aria-hidden": !visible }, h(Icon, { name: "arrowUp" }));
  }

  function App() {
    var themeTuple = useState(document.documentElement.getAttribute("data-theme") || "light");
    var theme = themeTuple[0];
    var setTheme = themeTuple[1];

    useEffect(function applyBrandColors() {
      Object.keys(content.colors).forEach(function applyColor(key) {
        var cssName = key.replace(/[A-Z]/g, function kebabCase(letter) { return `-${letter.toLowerCase()}`; });
        document.documentElement.style.setProperty(`--${cssName}`, content.colors[key]);
      });
    }, []);

    useEffect(function trackPageView() {
      trackEvent("founding_list_page_view", { page: window.location.pathname });
    }, []);

    function toggleTheme() {
      var nextTheme = theme === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", nextTheme);
      try { localStorage.setItem("janani-theme", nextTheme); } catch (error) {}
      setTheme(nextTheme);
    }

    return h(FormProvider, null, h(Header, { theme: theme, onToggleTheme: toggleTheme }), h("main", { id: "main-content" }, h(Hero), h(FoundingListBenefits), h(WhatToExpect), h(Ingredients), h(FounderPreview), h(FounderStory), h(FinalSignup)), h(Footer), h(StickySignup), h(ScrollTop));
  }

  ReactDOM.createRoot(document.getElementById("root")).render(h(App));
})();
