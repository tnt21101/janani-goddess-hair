import { readFile } from "node:fs/promises";
import vm from "node:vm";

function createReactRuntime() {
  let currentInstance = null;
  let rootNode = null;
  let renderedTree = null;
  let rendering = false;
  let renderQueued = false;
  const instances = new Map();

  const React = {
    Fragment: Symbol("Fragment"),
    createElement(type, inputProps, ...children) {
      const props = { ...(inputProps || {}) };
      if (children.length === 1) props.children = children[0];
      else if (children.length > 1) props.children = children;
      return { type, props };
    },
    createContext(defaultValue) {
      const context = { defaultValue };
      context.Provider = { contextProvider: context };
      return context;
    },
    useState(initialValue) {
      const instance = currentInstance;
      const slot = instance.hookIndex++;
      if (!(slot in instance.hooks)) {
        instance.hooks[slot] = typeof initialValue === "function" ? initialValue() : initialValue;
      }
      const setValue = (nextValue) => {
        const previous = instance.hooks[slot];
        const next = typeof nextValue === "function" ? nextValue(previous) : nextValue;
        if (Object.is(previous, next)) return;
        instance.hooks[slot] = next;
        if (rendering) {
          renderQueued = true;
          return;
        }
        renderWithContext();
      };
      return [instance.hooks[slot], setValue];
    },
    useRef(initialValue) {
      const instance = currentInstance;
      const slot = instance.hookIndex++;
      if (!(slot in instance.hooks)) instance.hooks[slot] = { current: initialValue };
      return instance.hooks[slot];
    },
    useEffect(effect, dependencies) {
      const instance = currentInstance;
      const slot = instance.hookIndex++;
      const previous = instance.hooks[slot];
      const changed = !previous || !dependencies || !sameDependencies(previous.dependencies, dependencies);
      if (changed) {
        instance.hooks[slot] = { dependencies, effect, cleanup: previous && previous.cleanup };
        instance.pendingEffects.push(slot);
      }
    },
  };

  function sameDependencies(previous, next) {
    return previous && next && previous.length === next.length && previous.every((value, index) => Object.is(value, next[index]));
  }

  function getInstance(path) {
    if (!instances.has(path)) instances.set(path, { hooks: [], hookIndex: 0, pendingEffects: [] });
    const instance = instances.get(path);
    instance.hookIndex = 0;
    instance.pendingEffects = [];
    return instance;
  }

  React.useContext = (context) => {
    const contextValue = contextValues.get(context);
    return contextValue === undefined ? context.defaultValue : contextValue;
  };

  // Context values are scoped to each render tree; read from the active component frame.
  const contextValues = new Map();
  function resolveWithContext(node, path, contexts) {
    if (Array.isArray(node)) return node.map((child, index) => resolveWithContext(child, `${path}.${index}`, contexts)).filter((child) => child !== null);
    if (!node || typeof node !== "object") return node === null || node === undefined || typeof node === "boolean" ? null : node;
    const { type, props } = node;
    if (type === React.Fragment) return resolveWithContext(props.children, `${path}.fragment`, contexts);
    if (type && type.contextProvider) {
      const nextContexts = new Map(contexts);
      nextContexts.set(type.contextProvider, props.value);
      return resolveWithContext(props.children, `${path}.provider`, nextContexts);
    }
    if (typeof type === "function") {
      const instance = getInstance(path);
      const previousInstance = currentInstance;
      const previousContexts = new Map(contextValues);
      contextValues.clear();
      for (const [key, value] of contexts) contextValues.set(key, value);
      currentInstance = instance;
      let output;
      try {
        output = type(props || {});
      } finally {
        currentInstance = previousInstance;
        contextValues.clear();
        for (const [key, value] of previousContexts) contextValues.set(key, value);
      }
      for (const slot of instance.pendingEffects) {
        const effectState = instance.hooks[slot];
        if (typeof effectState.cleanup === "function") effectState.cleanup();
        effectState.cleanup = effectState.effect();
      }
      return resolveWithContext(output, `${path}.render`, contexts);
    }
    if (typeof type === "string") {
      return { type, props: { ...props }, children: resolveWithContext(props.children, `${path}.children`, contexts) };
    }
    return null;
  }

  function renderWithContext() {
    if (rendering) {
      renderQueued = true;
      return;
    }
    do {
      renderQueued = false;
      rendering = true;
      renderedTree = resolveWithContext(rootNode, "root", new Map());
      rendering = false;
    } while (renderQueued);
  }

  return {
    React,
    ReactDOM: {
      createRoot() {
        return {
          render(element) {
            rootNode = element;
            renderWithContext();
          },
        };
      },
    },
    getTree: () => renderedTree,
  };
}

export async function mountLandingPage({
  href = "https://janani.example/?utm_source=test",
  userAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile",
  viewportWidth = 390,
  submitButtonBounds = { width: 120, height: 44, top: 100, bottom: 144 },
  submitSignup = async () => undefined,
  useTestSubmit = true,
  fetch = async () => ({ ok: true, status: 200 }),
} = {}) {
  const [contentSource, formUtilsSource, appSource] = await Promise.all([
    readFile("content.js", "utf8"),
    readFile("form-utils.js", "utf8"),
    readFile("app.js", "utf8"),
  ]);
  const events = [];
  const calls = { signup: [], fetch: [], copiedText: [], shared: [], querySelectors: [], submitButtonSelectors: [] };
  const pageUrl = new URL(href);
  const rootElement = {};
  const documentElement = {
    attributes: { "data-theme": "light" },
    style: { setProperty() {} },
    getAttribute(name) { return this.attributes[name] || null; },
    setAttribute(name, value) { this.attributes[name] = value; },
  };
  const navigator = {
    userAgent,
    clipboard: { async writeText(text) { calls.copiedText.push(text); } },
  };
  const window = {
    location: pageUrl,
    innerWidth: viewportWidth,
    innerHeight: 800,
    scrollY: 0,
    navigator,
    dataLayer: [],
    gtag(command, name, payload) {
      if (command === "event") events.push({ name, payload: payload || {} });
    },
    matchMedia(query) { return { matches: query === "(max-width: 767px)" && viewportWidth <= 767 }; },
    setTimeout(callback) { callback(); return 0; },
    addEventListener() {},
    removeEventListener() {},
    __JANANI_TEST_SUBMIT__: useTestSubmit ? async (payload) => {
      calls.signup.push(payload);
      await submitSignup(payload);
    } : undefined,
  };
  const document = {
    documentElement,
    getElementById(id) { return id === "root" ? rootElement : null; },
    querySelectorAll(selector) {
      calls.querySelectors.push(selector);
      if (selector !== ".signup") return [];
      return [{
        querySelector(buttonSelector) {
          calls.submitButtonSelectors.push(buttonSelector);
          if (buttonSelector !== 'button[type="submit"]') return null;
          return { getBoundingClientRect() { return submitButtonBounds; } };
        },
      }];
    },
  };
  class TestIntersectionObserver {
    constructor(callback) { this.callback = callback; }
    observe() { this.callback([{ isIntersecting: true }]); }
    disconnect() {}
  }
  const runtime = createReactRuntime();
  const sandbox = {
    window,
    document,
    navigator,
    React: runtime.React,
    ReactDOM: runtime.ReactDOM,
    IntersectionObserver: TestIntersectionObserver,
    URL,
    URLSearchParams,
    FormData,
    fetch: async (...args) => {
      calls.fetch.push(args);
      return fetch(...args);
    },
    console,
    setTimeout: window.setTimeout,
    clearTimeout() {},
    localStorage: { getItem() { return null; }, setItem() {} },
  };
  vm.runInNewContext(contentSource, sandbox, { filename: "content.js" });
  vm.runInNewContext(formUtilsSource, sandbox, { filename: "form-utils.js" });
  vm.runInNewContext(appSource, sandbox, { filename: "app.js" });

  return { getTree: runtime.getTree, events, calls, window, document, content: window.JANANI };
}

export function elements(tree, predicate = () => true) {
  const found = [];
  function visit(node) {
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (!node || typeof node !== "object") return;
    if (typeof node.type === "string" && predicate(node)) found.push(node);
    visit(node.children);
  }
  visit(tree);
  return found;
}

export function textContent(tree) {
  if (Array.isArray(tree)) return tree.map(textContent).join("");
  if (tree === null || tree === undefined || typeof tree === "boolean") return "";
  if (typeof tree !== "object") return String(tree);
  return textContent(tree.children);
}
