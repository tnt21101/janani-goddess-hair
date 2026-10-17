import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { elements, mountLandingPage, textContent } from "./render-app.mjs";

function heroForm(tree) {
  return elements(tree, (element) => element.type === "form" && element.props.id === "founding-list-form")[0];
}

function setHeroEmail(getTree, value) {
  let form = heroForm(getTree());
  let emailInput = elements(form, (element) => element.type === "input" && element.props.type === "email")[0];
  emailInput.props.onChange({ target: { value } });
  form = heroForm(getTree());
  return form;
}

function eventNamed(events, name) {
  return events.find((event) => event.name === name);
}

function paramsForFetch(calls, fetchIndex = 0) {
  const request = calls.fetch[fetchIndex];
  assert.ok(request, "expected the form request to reach the configured provider");
  return new URLSearchParams(request[1].body);
}

function attributes(tag) {
  const parsed = {};
  const expression = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  for (const match of tag.matchAll(expression)) {
    parsed[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? true;
  }
  return parsed;
}

test("Netlify declares the optional survey as a separate anonymous form", async () => {
  const html = await readFile("index.html", "utf8");
  const forms = [...html.matchAll(/<form\b([^>]*)>([\s\S]*?)<\/form\s*>/gi)];
  const feedback = forms.find((match) => attributes(match[1]).name === "founding-feedback");

  assert.ok(feedback, "Netlify should discover the feedback form at build time");
  const formAttributes = attributes(feedback[1]);
  assert.equal(formAttributes["data-netlify"], "true");
  const fields = [...feedback[2].matchAll(/<input\b[^>]*>/gi)].map((match) => attributes(match[0]));
  assert.ok(fields.some((field) => field.name === "form-name" && field.value === "founding-feedback"));
  assert.ok(fields.some((field) => field.name === "frustration"));
  assert.ok(fields.some((field) => field.name === "signup_location"));
  assert.ok(fields.some((field) => field.name === "bot-field"));
  assert.equal(fields.some((field) => field.name === "email" || field.name === "name"), false);
});

test("visible signup stays email-only and shows the approved Founding List offer", async () => {
  const page = await mountLandingPage();
  const tree = page.getTree();
  const signupForms = elements(tree, (element) => element.type === "form" && element.props.name === "waitlist");
  const copy = textContent(tree);

  assert.ok(signupForms.length > 0, "the page should expose at least one visible signup form");
  for (const form of signupForms) {
    const visibleInputs = elements(form, (element) => element.type === "input" && element.props.type !== "hidden");
    assert.equal(visibleInputs.length, 1, "each signup form should ask for one visible input");
    assert.equal(visibleInputs[0].props.type, "email");
    assert.equal(visibleInputs[0].props.name, "email");
    assert.equal(visibleInputs[0].props.required, true);
  }

  for (const offerItem of [
    "48-hour access before the public launch",
    "20% off your first order",
    "Opportunities to apply for beta product testing",
    "Immediate Goddess Hair Ritual Guide",
    "Private formulation and launch updates",
    "No payment required",
  ]) {
    assert.ok(copy.includes(offerItem), `visible offer should include: ${offerItem}`);
  }
});

test("sticky signup appears at 767px when no submit button is fully visible, then hides on success", async () => {
  const partiallyVisibleSubmit = { width: 120, height: 44, top: 780, bottom: 824 };
  const mobile = await mountLandingPage({ viewportWidth: 767, submitButtonBounds: partiallyVisibleSubmit });
  const mobileSticky = elements(mobile.getTree(), (element) => element.type === "aside" && String(element.props.className).includes("sticky-signup"))[0];

  assert.ok(mobile.calls.querySelectors.includes(".signup"));
  assert.ok(mobile.calls.submitButtonSelectors.includes('button[type="submit"]'));
  assert.equal(mobile.window.scrollY, 0, "the sticky signup should not need a scroll threshold");
  assert.equal(mobileSticky.props["aria-hidden"], false, "mobile should show the sticky action when the submit button is only partly visible");
  assert.match(mobileSticky.props.className, /is-visible/);

  const signupForm = setHeroEmail(mobile.getTree, "founder@example.com");
  await signupForm.props.onSubmit({ preventDefault() {} });
  const completedSticky = elements(mobile.getTree(), (element) => element.type === "aside" && String(element.props.className).includes("sticky-signup"))[0];
  assert.equal(completedSticky.props["aria-hidden"], true, "the sticky action should hide after signup completes");
  assert.doesNotMatch(completedSticky.props.className, /is-visible/);

  const aboveBreakpoint = await mountLandingPage({ viewportWidth: 768, submitButtonBounds: partiallyVisibleSubmit });
  const desktopSticky = elements(aboveBreakpoint.getTree(), (element) => element.type === "aside" && String(element.props.className).includes("sticky-signup"))[0];
  assert.equal(desktopSticky.props["aria-hidden"], true, "the sticky action should stay hidden above the 767px breakpoint");
});

test("page and signup preserve UTM and device attribution", async () => {
  const page = await mountLandingPage({
    href: "https://janani.example/?utm_source=instagram&utm_medium=paid-social&utm_campaign=founding-list&utm_term=ritual&utm_content=story",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile",
    useTestSubmit: false,
    viewportWidth: 390,
  });
  const viewEvent = eventNamed(page.events, "founding_list_page_view");

  assert.ok(viewEvent, "the page-view event should be emitted on page load");
  assert.equal(viewEvent.payload.source, "instagram");
  assert.equal(viewEvent.payload.utm_source, "instagram");
  assert.equal(viewEvent.payload.utm_medium, "paid-social");
  assert.equal(viewEvent.payload.utm_campaign, "founding-list");
  assert.equal(viewEvent.payload.utm_term, "ritual");
  assert.equal(viewEvent.payload.utm_content, "story");
  assert.equal(viewEvent.payload.device_type, "mobile");

  const form = setHeroEmail(page.getTree, "founder@example.com");
  await form.props.onSubmit({ preventDefault() {} });
  const submitted = paramsForFetch(page.calls);

  assert.equal(submitted.get("email"), "founder@example.com");
  assert.equal(submitted.get("source"), "hero");
  assert.equal(submitted.get("traffic_source"), "instagram");
  assert.equal(submitted.get("utm_source"), "instagram");
  assert.equal(submitted.get("utm_medium"), "paid-social");
  assert.equal(submitted.get("utm_campaign"), "founding-list");
  assert.equal(submitted.get("utm_term"), "ritual");
  assert.equal(submitted.get("utm_content"), "story");
  assert.equal(submitted.get("landing_page"), "/");
  assert.equal(submitted.get("device_type"), "mobile");
});

test("survey and referral appear after signup and emit events after their actions succeed", async () => {
  let acceptSignup;
  let acceptSurvey;
  const signupAcceptance = new Promise((resolve) => { acceptSignup = resolve; });
  const surveyAcceptance = new Promise((resolve) => { acceptSurvey = resolve; });
  const page = await mountLandingPage({
    href: "https://janani.example/?utm_source=newsletter&utm_campaign=launch",
    submitSignup: () => signupAcceptance,
    fetch: () => surveyAcceptance,
  });

  assert.doesNotMatch(textContent(page.getTree()), /What’s your biggest frustration with your hair right now\?/);
  assert.equal(eventNamed(page.events, "founding_list_survey_response"), undefined);
  assert.equal(eventNamed(page.events, "founding_list_referral_click"), undefined);

  const signupForm = setHeroEmail(page.getTree, "founder@example.com");
  const pendingSignup = signupForm.props.onSubmit({ preventDefault() {} });
  assert.equal(eventNamed(page.events, "founding_list_success"), undefined, "signup success waits for provider acceptance");
  assert.doesNotMatch(textContent(page.getTree()), /What’s your biggest frustration with your hair right now\?/);
  acceptSignup();
  await pendingSignup;

  const successfulTree = page.getTree();
  assert.match(textContent(successfulTree), /What’s your biggest frustration with your hair right now\?/);
  assert.match(textContent(successfulTree), /Know someone who would love JANANI\?/);
  assert.ok(elements(successfulTree, (element) => element.type === "button").some((button) => textContent(button).includes("SKIP THIS QUESTION")));
  assert.ok(eventNamed(page.events, "founding_list_success"));
  assert.equal(eventNamed(page.events, "founding_list_survey_response"), undefined);
  assert.equal(eventNamed(page.events, "founding_list_referral_click"), undefined);

  const survey = elements(successfulTree, (element) => element.type === "form" && String(element.props.className || "").includes("founding-survey"))[0];
  assert.ok(survey, "successful signup should expose the optional survey");
  const answer = elements(survey, (element) => element.type === "input" && element.props.type === "radio")[0];
  assert.ok(answer, "survey should present one selectable answer at a time");
  answer.props.onChange();

  const updatedSurvey = elements(page.getTree(), (element) => element.type === "form" && String(element.props.className || "").includes("founding-survey"))[0];
  const pendingSurvey = updatedSurvey.props.onSubmit({ preventDefault() {} });
  assert.equal(eventNamed(page.events, "founding_list_survey_response"), undefined, "survey response waits for provider acceptance");
  acceptSurvey({ ok: true, status: 200 });
  await pendingSurvey;
  assert.ok(eventNamed(page.events, "founding_list_survey_response"));
  const response = paramsForFetch(page.calls);
  assert.equal(response.get("form-name"), "founding-feedback");
  assert.equal(response.get("frustration"), "Dryness or damage");
  assert.equal(response.get("signup_location"), "hero");
  assert.equal(response.get("utm_source"), "newsletter");
  assert.equal(response.get("utm_campaign"), "launch");
  assert.equal(response.has("email"), false, "the optional response should not collect an email address");
  assert.equal(response.has("name"), false, "the optional response should not collect a name");

  const copyButton = elements(page.getTree(), (element) => element.type === "button").find((button) => textContent(button).includes("COPY INVITE LINK"));
  assert.ok(copyButton, "successful signup should offer a referral link");
  assert.equal(eventNamed(page.events, "founding_list_referral_click"), undefined);
  await copyButton.props.onClick();
  assert.ok(eventNamed(page.events, "founding_list_referral_click"));
  assert.equal(page.calls.copiedText.length, 1);
  const referralUrl = new URL(page.calls.copiedText[0]);
  assert.equal(referralUrl.searchParams.get("utm_source"), "member");
  assert.equal(referralUrl.searchParams.get("utm_medium"), "referral");
});

test("the optional survey can be skipped without recording a response", async () => {
  const page = await mountLandingPage();
  const signupForm = setHeroEmail(page.getTree, "founder@example.com");
  await signupForm.props.onSubmit({ preventDefault() {} });

  const skipButton = elements(page.getTree(), (element) => element.type === "button").find((button) => textContent(button).includes("SKIP THIS QUESTION"));
  assert.ok(skipButton);
  await skipButton.props.onClick();

  assert.equal(eventNamed(page.events, "founding_list_survey_response"), undefined);
  assert.doesNotMatch(textContent(page.getTree()), /What’s your biggest frustration with your hair right now\?/);
});

test("product copy avoids unsupported efficacy claims and manufactured scarcity", async () => {
  const page = await mountLandingPage();
  const productCopy = [
    page.content.hero.headline,
    page.content.hero.body,
    ...page.content.benefits.items.map((item) => item.text),
    page.content.ingredients.differentiation,
    page.content.ingredients.usage,
  ].join(" ");
  const visibleCopy = textContent(page.getTree());

  assert.doesNotMatch(productCopy, /\b(?:regrow|regrowth|hair growth|grow hair|cure|treat|clinically proven|guaranteed?)\b/i);
  assert.doesNotMatch(visibleCopy, /\b(?:only\s+\d+\s+(?:spots|places|members)|last chance|ends? (?:tonight|today)|countdown|limited-time offer)\b/i);
});
