window.__ModuleLoader__.load({
	id: "dsh-doc-review",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/index.ts
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(index_exports);
var import_react5 = require("react");

// src/client/model.ts
var KINDS = {
  comment: { label: "\u8BC4\u8BBA", needsNote: true, placeholder: "\u5199\u4E0B\u4F60\u7684\u60F3\u6CD5\u3001\u95EE\u9898\uFF0C\u6216\u60F3\u600E\u4E48\u6539\u2026", noteLabel: "\u610F\u89C1", hint: "\u8BC4\u8BBA" },
  agree: { label: "\u8BA4\u53EF", needsNote: false, placeholder: "\u4E3A\u4EC0\u4E48\u8BA4\u53EF\uFF08\u53EF\u9009\uFF09", noteLabel: "\u7406\u7531", hint: "\u8BA4\u53EF\uFF1A\u8FD9\u91CC\u8BB2\u5F97\u5BF9" },
  disagree: { label: "\u53CD\u5BF9", needsNote: false, placeholder: "\u54EA\u91CC\u4E0D\u8BA4\u540C\uFF08\u53EF\u9009\uFF09", noteLabel: "\u7406\u7531", hint: "\u53CD\u5BF9\uFF1A\u8FD9\u91CC\u6211\u4E0D\u8BA4\u540C" }
};
var QUICK_KINDS = ["agree", "disagree"];
var EMPTY = Object.freeze({ items: Object.freeze([]), overall: "" });
var storageKey = (sessionId) => "dsh-review:v3:" + sessionId;
var ReviewStore = class {
  constructor(sessionId) {
    this.sessionId = sessionId;
    try {
      const raw = window.localStorage.getItem(storageKey(sessionId));
      if (raw) {
        const parsed = JSON.parse(raw);
        const items = Array.isArray(parsed.items) ? parsed.items.filter((i) => i && typeof i.quote === "string" && i.kind in KINDS) : [];
        this.view = Object.freeze({ items: Object.freeze(items), overall: typeof parsed.overall === "string" ? parsed.overall : "" });
        this.nextId = items.reduce((m, i) => Math.max(m, i.id), 0) + 1;
      }
    } catch {
    }
  }
  view = EMPTY;
  nextId = 1;
  listeners = /* @__PURE__ */ new Set();
  getSnapshot = () => this.view;
  subscribe = (fn) => {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  };
  add = (kind, quote, note, rowKey) => {
    const id = this.nextId++;
    this.commit({ items: [...this.view.items, { id, kind, quote, note, rowKey, createdAt: Date.now() }] });
    return id;
  };
  update = (id, patch) => {
    this.commit({ items: this.view.items.map((i) => i.id === id ? { ...i, ...patch } : i) });
  };
  remove = (id) => {
    this.commit({ items: this.view.items.filter((i) => i.id !== id) });
  };
  setOverall = (overall) => this.commit({ overall });
  clear = () => this.commit({ items: [], overall: "" });
  commit(patch) {
    const next = { ...this.view, ...patch };
    this.view = Object.freeze({ ...next, items: Object.freeze([...next.items]) });
    try {
      window.localStorage.setItem(storageKey(this.sessionId), JSON.stringify(this.view));
    } catch {
    }
    for (const fn of this.listeners) fn();
  }
};
function incompleteItems(view) {
  return view.items.filter((i) => KINDS[i.kind].needsNote && i.note.trim().length === 0);
}
function isSendable(view) {
  if (view.items.length === 0 && view.overall.trim().length === 0) return false;
  return incompleteItems(view).length === 0;
}
var quoteBlock = (text) => text.trim().split(/\r?\n/).filter((l) => l.trim().length > 0).map((l) => "> " + l).join("\n");
var REVIEW_CLOSE = "\u3010/\u5BA1\u9605\u610F\u89C1\u3011";
var DISCUSS_HEAD = (n) => "\u3010\u5BA1\u9605\u610F\u89C1\u3011\u6211\u628A\u4F60\u4E0A\u4E00\u6761\u56DE\u590D\u5F53\u4F5C\u4E00\u4EFD\u7A3F\u5B50\u5BA1\u9605\u4E86\u4E00\u904D" + (n > 0 ? "\uFF0C\u5171 " + n + " \u6761\u6279\u6CE8" : "") + "\u3002" + (n > 0 ? "\u8BF7\u6309\u7F16\u53F7\u9010\u6761\u56DE\u5E94\uFF0C\u6BCF\u6761\u4EE5\u300C\u6279\u6CE8 N\uFF1A\u300D\u5F00\u5934\uFF0C\u4E0D\u8981\u5408\u5E76\uFF0C\u4E5F\u4E0D\u8981\u9057\u6F0F\u3002" : "\u8BF7\u6839\u636E\u6211\u7684\u6574\u4F53\u610F\u89C1\u56DE\u5E94\u3002");
var REVISE_HEAD = (n) => "\u3010\u5BA1\u9605\u610F\u89C1\xB7\u8BF7\u51FA\u4FEE\u8BA2\u7248\u3011\u6211\u628A\u4F60\u4E0A\u4E00\u6761\u56DE\u590D\u5F53\u4F5C\u4E00\u4EFD\u7A3F\u5B50\u5BA1\u9605\u4E86\u4E00\u904D" + (n > 0 ? "\uFF0C\u5171 " + n + " \u6761\u6279\u6CE8" : "") + "\u3002\u8BF7\u636E\u6B64\u8F93\u51FA\u4FEE\u8BA2\u540E\u7684\u5B8C\u6574\u7248\u672C\u3002\n\u5904\u7406\u89C4\u5219\uFF1A\u8BA4\u53EF\uFF1D\u4FDD\u7559\uFF0C\u53EF\u4EE5\u6CBF\u8FD9\u4E2A\u65B9\u5411\u5F3A\u5316\uFF1B\u53CD\u5BF9\uFF1D\u91CD\u65B0\u601D\u8003\u5E76\u91CD\u5199\u8FD9\u90E8\u5206\uFF1B\u8BC4\u8BBA\uFF1D\u6309\u610F\u89C1\u8C03\u6574\u3002\n\u4FEE\u8BA2\u7248\u4E4B\u540E\uFF0C\u7528\u4E00\u4E2A\u7B80\u77ED\u5217\u8868\u8BF4\u660E\u6BCF\u6761\u6279\u6CE8\u7684\u5904\u7406\u60C5\u51B5\uFF08\u6279\u6CE8 N\uFF1A\u5DF2\u5904\u7406 / \u672A\u5904\u7406\u53CA\u539F\u56E0\uFF09\u3002";
function composeReview(view, draft, mode) {
  const n = view.items.length;
  const head = mode === "revise" ? REVISE_HEAD(n) : DISCUSS_HEAD(n);
  const blocks = view.items.map((item, index) => {
    const meta = KINDS[item.kind];
    const lines = ["\u6279\u6CE8 " + (index + 1) + "\uFF5C" + meta.label, quoteBlock(item.quote)];
    if (item.note.trim()) lines.push(meta.noteLabel + "\uFF1A" + item.note.trim());
    return lines.join("\n");
  });
  const parts = [head, ...blocks];
  if (view.overall.trim()) parts.push("\u6574\u4F53\u610F\u89C1\uFF1A" + view.overall.trim());
  const body = parts.join("\n\n") + "\n" + REVIEW_CLOSE;
  const own = draft.trim();
  return own ? own + "\n\n" + body : body;
}

// src/client/highlights.ts
var ROW_ATTR = "data-chat-flow-key";
var registry = () => {
  const css = globalThis.CSS;
  return css?.highlights && typeof Highlight !== "undefined" ? css.highlights : null;
};
var highlightName = (kind) => "dsr-" + kind;
function rowElement(rowKey) {
  if (!rowKey) return null;
  try {
    return document.querySelector("[" + ROW_ATTR + '="' + CSS.escape(rowKey) + '"]');
  } catch {
    return null;
  }
}
function rowKeyOf(node) {
  const el = node ? node.nodeType === 1 ? node : node.parentElement : null;
  return el?.closest("[" + ROW_ATTR + "]")?.getAttribute(ROW_ATTR) ?? null;
}
function proseElement(node) {
  const el = node ? node.nodeType === 1 ? node : node.parentElement : null;
  return el?.closest('[class*="markdown"]') ?? null;
}
function scrollParent(el) {
  for (let e = el?.parentElement ?? null; e; e = e.parentElement) {
    const oy = getComputedStyle(e).overflowY;
    if ((oy === "auto" || oy === "scroll") && e.scrollHeight > e.clientHeight) return e;
  }
  return null;
}
function findTextRange(root, quote) {
  const target = quote.replace(/\s+/g, "");
  if (!target) return null;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let flat = "";
  const map = [];
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const parent = n.parentElement;
    if (parent && parent.closest("script,style,[data-dsr-ui]")) continue;
    const text = n.data;
    for (let i = 0; i < text.length; i++) {
      if (/\s/.test(text[i])) continue;
      flat += text[i];
      map.push({ node: n, offset: i });
    }
  }
  const at = flat.indexOf(target);
  if (at < 0) return null;
  const start = map[at];
  const end = map[at + target.length - 1];
  const range = document.createRange();
  range.setStart(start.node, start.offset);
  range.setEnd(end.node, end.offset + 1);
  return range;
}
var HighlightPainter = class {
  ranges = /* @__PURE__ */ new Map();
  items = [];
  active = null;
  pending = 0;
  observer;
  listeners = /* @__PURE__ */ new Set();
  constructor() {
    this.observer = new MutationObserver((records) => {
      if (records.every((r) => r.target.closest?.("[data-dsr-ui],[data-dsr-doc]"))) return;
      this.schedule();
    });
    this.observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  /** Notified after every repaint (layout may have moved). */
  onPaint(fn) {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }
  seed(id, range) {
    this.ranges.set(id, range);
  }
  show(items) {
    this.items = items;
    const live = new Set(items.map((i) => i.id));
    for (const id of [...this.ranges.keys()]) if (!live.has(id)) this.ranges.delete(id);
    if (this.active !== null && !live.has(this.active)) this.active = null;
    this.paint();
  }
  setActive(id) {
    if (this.active === id) return;
    this.active = id;
    this.paint();
  }
  /** Range for an item, re-anchored if the DOM moved under it. */
  rangeFor(item) {
    const cached = this.ranges.get(item.id);
    if (cached && !cached.collapsed && cached.startContainer.isConnected && cached.endContainer.isConnected) {
      if (cached.toString().replace(/\s+/g, "") === item.quote.replace(/\s+/g, "")) return cached;
    }
    const root = rowElement(item.rowKey) ?? document.querySelector("[" + ROW_ATTR + "]")?.parentElement ?? null;
    const found = root ? findTextRange(root, item.quote) : null;
    if (found) this.ranges.set(item.id, found);
    else this.ranges.delete(item.id);
    return found;
  }
  /** The item whose marked text lies under a viewport point. */
  hitTest(x, y) {
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      const range = this.ranges.get(item.id);
      if (!range) continue;
      for (const r of range.getClientRects()) {
        if (x >= r.left - 1 && x <= r.right + 1 && y >= r.top - 1 && y <= r.bottom + 1) return item.id;
      }
    }
    return null;
  }
  /** Scroll the passage to the middle of the viewport. */
  reveal(item) {
    const range = this.rangeFor(item);
    if (!range) return false;
    range.startContainer.parentElement?.scrollIntoView({ block: "center", behavior: "smooth" });
    return true;
  }
  schedule() {
    if (this.pending) return;
    this.pending = window.requestAnimationFrame(() => {
      this.pending = 0;
      this.paint();
    });
  }
  paint() {
    const reg = registry();
    if (reg) {
      const byKind = /* @__PURE__ */ new Map();
      let activeRange = null;
      for (const item of this.items) {
        const range = this.rangeFor(item);
        if (!range) continue;
        if (item.id === this.active) activeRange = range;
        const list = byKind.get(item.kind) ?? [];
        list.push(range);
        byKind.set(item.kind, list);
      }
      for (const kind of Object.keys(KINDS)) {
        const list = byKind.get(kind);
        if (list && list.length) reg.set(highlightName(kind), new Highlight(...list));
        else reg.delete(highlightName(kind));
      }
      if (activeRange) reg.set("dsr-active", new Highlight(activeRange));
      else reg.delete("dsr-active");
    }
    for (const fn of this.listeners) fn();
  }
  dispose() {
    this.observer.disconnect();
    if (this.pending) window.cancelAnimationFrame(this.pending);
    const reg = registry();
    if (reg) {
      for (const kind of Object.keys(KINDS)) reg.delete(highlightName(kind));
      reg.delete("dsr-active");
    }
    this.listeners.clear();
  }
};

// src/client/icons.ts
var ICON_PATHS = {
  comment: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  agree: "M7 10v12M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z",
  disagree: "M17 14V2M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z",
  trash: "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
  note: "M4 6h16M4 12h16M4 18h10",
  check: "M20 6 9 17l-5-5",
  doc: "M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6M8 13h8M8 17h5",
  highlight: "m9 11-6 6v3h9l3-3M22 12l-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4",
  x: "M18 6 6 18M6 6l12 12",
  back: "M15 18l-6-6 6-6",
  send: "M12 19V5M5 12l7-7 7 7",
  down: "m6 9 6 6 6-6",
  up: "m18 15-6-6-6 6"
};
function iconSvg(name, size = 16) {
  return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + ICON_PATHS[name] + '"/></svg>';
}

// src/client/toolbar.ts
function createToolbar(opts) {
  const root = document.createElement("div");
  root.className = "dsr-float-root";
  root.dataset.dsrUi = "true";
  document.body.appendChild(root);
  let bar = null;
  let tip = null;
  let captured = null;
  const close = () => {
    bar?.remove();
    tip?.remove();
    bar = null;
    tip = null;
    captured = null;
  };
  const capture = () => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) return null;
    const range = sel.getRangeAt(0);
    if (!proseElement(range.startContainer) || !proseElement(range.endContainer)) return null;
    const rowKey = rowKeyOf(range.startContainer);
    if (rowKey === null) return null;
    const quote = sel.toString().trim();
    if (quote.length === 0) return null;
    return { quote, rowKey, range: range.cloneRange() };
  };
  const place = () => {
    if (!bar || !captured) return;
    const rects = captured.range.getClientRects();
    const first = rects[0] ?? captured.range.getBoundingClientRect();
    const w = bar.offsetWidth;
    const h = bar.offsetHeight;
    const x = Math.min(Math.max(8, first.left), Math.max(8, window.innerWidth - w - 8));
    let y = first.top - h - 8;
    if (y < 8) y = captured.range.getBoundingClientRect().bottom + 8;
    bar.style.left = x + "px";
    bar.style.top = y + "px";
  };
  const showTip = (btn, text) => {
    tip?.remove();
    const t = document.createElement("div");
    t.className = "dsr-tip";
    t.textContent = text;
    root.appendChild(t);
    const r = btn.getBoundingClientRect();
    t.style.left = Math.max(8, r.left + r.width / 2 - t.offsetWidth / 2) + "px";
    t.style.top = r.top - t.offsetHeight - 6 + "px";
    tip = t;
  };
  const act = (kind) => {
    if (!captured) return;
    const id = opts.stage(kind, captured.quote, captured.rowKey, captured.range);
    if (id !== null) window.getSelection()?.removeAllRanges();
    close();
  };
  const button = (kind, withLabel) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = withLabel ? "dsr-tb-btn dsr-tb-primary" : "dsr-tb-btn";
    btn.dataset.kind = kind;
    btn.setAttribute("aria-label", KINDS[kind].hint);
    btn.innerHTML = iconSvg(kind, withLabel ? 15 : 16) + (withLabel ? "<span>" + KINDS[kind].label + "</span>" : "");
    btn.addEventListener("mousedown", (e) => e.preventDefault());
    btn.addEventListener("click", () => act(kind));
    if (!withLabel) {
      btn.addEventListener("mouseenter", () => showTip(btn, KINDS[kind].hint));
      btn.addEventListener("mouseleave", () => {
        tip?.remove();
        tip = null;
      });
    }
    return btn;
  };
  const open = (c) => {
    bar?.remove();
    captured = c;
    const b = document.createElement("div");
    b.className = "dsr-toolbar";
    b.setAttribute("role", "toolbar");
    b.appendChild(button("comment", true));
    const sep = document.createElement("span");
    sep.className = "dsr-tb-sep";
    b.appendChild(sep);
    for (const kind of QUICK_KINDS) b.appendChild(button(kind, false));
    root.appendChild(b);
    bar = b;
    place();
  };
  const onMouseUp = (e) => {
    if (e.button !== 0) return;
    if (e.target instanceof Node && root.contains(e.target)) return;
    window.setTimeout(() => {
      const c = capture();
      if (c) open(c);
      else close();
    }, 0);
  };
  const onSelectionChange = () => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) close();
  };
  const onKeyDown = (e) => {
    if (e.key === "Escape" && bar) close();
  };
  const onScroll = () => place();
  document.addEventListener("mouseup", onMouseUp);
  document.addEventListener("selectionchange", onSelectionChange);
  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("scroll", onScroll, true);
  window.addEventListener("resize", onScroll);
  return () => {
    document.removeEventListener("mouseup", onMouseUp);
    document.removeEventListener("selectionchange", onSelectionChange);
    document.removeEventListener("keydown", onKeyDown);
    document.removeEventListener("scroll", onScroll, true);
    window.removeEventListener("resize", onScroll);
    root.remove();
  };
}

// src/client/ReviewLayer.tsx
var import_react3 = require("react");
var import_react_dom2 = require("react-dom");

// src/client/doc/attach.ts
var KEY = "dsh-review:attach:v1";
var AttachStore = class {
  pendingBySession = /* @__PURE__ */ new Map();
  byId = /* @__PURE__ */ new Map();
  listeners = /* @__PURE__ */ new Set();
  version = 0;
  constructor() {
    try {
      const raw = window.localStorage.getItem(KEY);
      const list = raw ? JSON.parse(raw) : [];
      for (const a of list) if (a && a.id) this.byId.set(a.id, a);
    } catch {
    }
  }
  getVersion = () => this.version;
  subscribe = (fn) => {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  };
  /** Queue a summary for a session's composer (the dock inserts the chip). */
  stage(a) {
    this.pendingBySession.set(a.sessionId, a);
    this.emit();
  }
  pending(sessionId) {
    return this.pendingBySession.get(sessionId);
  }
  /** The chip landed in the draft. */
  settle(a) {
    this.pendingBySession.delete(a.sessionId);
    this.byId.set(a.id, a);
    this.persist();
    this.emit();
  }
  drop(id) {
    this.byId.delete(id);
    this.persist();
    this.emit();
  }
  get(id) {
    return this.byId.get(id);
  }
  forSession(sessionId) {
    return [...this.byId.values()].filter((a) => a.sessionId === sessionId);
  }
  persist() {
    try {
      window.localStorage.setItem(KEY, JSON.stringify([...this.byId.values()]));
    } catch {
    }
  }
  emit() {
    this.version += 1;
    for (const fn of this.listeners) fn();
  }
};
var attachments = new AttachStore();

// src/client/doc/entry.tsx
var import_react2 = require("react");

// src/client/ui.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var MarkdownImpl = null;
try {
  MarkdownImpl = require("@deepseek-ai/dsh-client-ui-primitives").MarkdownText ?? null;
} catch {
  MarkdownImpl = null;
}
function Markdown({ text, streaming }) {
  if (MarkdownImpl) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarkdownImpl, { text, streaming });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { whiteSpace: "pre-wrap" }, children: text });
}
var Icon = ({ name, size = 14, width = 1.75 }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: width, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: ICON_PATHS[name] }) });

// src/client/doc/anchor.ts
function flatten(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  const starts = [];
  let text = "";
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    nodes.push(n);
    starts.push(text.length);
    text += n.data;
  }
  return { text, nodes, starts };
}
function offsetOf(root, node, offset) {
  if (!root.contains(node)) return null;
  const flat = flatten(root);
  if (node.nodeType === Node.TEXT_NODE) {
    const i = flat.nodes.indexOf(node);
    return i < 0 ? null : flat.starts[i] + offset;
  }
  const r = document.createRange();
  r.setStart(root, 0);
  r.setEnd(node, offset);
  return r.toString().length;
}
function rangeOf(root, start, end) {
  const flat = flatten(root);
  if (flat.nodes.length === 0 || end <= start) return null;
  const locate = (pos, preferNext) => {
    for (let i = 0; i < flat.nodes.length; i++) {
      const s = flat.starts[i];
      const e = s + flat.nodes[i].data.length;
      if (pos < e || pos === e && !preferNext || i === flat.nodes.length - 1) {
        if (pos >= s) return [flat.nodes[i], Math.min(pos - s, flat.nodes[i].data.length)];
      }
    }
    return null;
  };
  const a = locate(start, true);
  const b = locate(end, false);
  if (!a || !b) return null;
  const range = document.createRange();
  range.setStart(a[0], a[1]);
  range.setEnd(b[0], b[1]);
  return range;
}
var squash = (s) => s.replace(/\s+/g, "");
function resolve(root, anchor) {
  const flat = flatten(root);
  const target = squash(anchor.quote);
  if (!target) return null;
  if (squash(flat.text.slice(anchor.start, anchor.end)) === target) return anchor;
  let squashed = "";
  const map = [];
  for (let i = 0; i < flat.text.length; i++) {
    if (/\s/.test(flat.text[i])) continue;
    squashed += flat.text[i];
    map.push(i);
  }
  let best = null;
  let bestDist = Infinity;
  for (let at = squashed.indexOf(target); at >= 0; at = squashed.indexOf(target, at + 1)) {
    const start = map[at];
    const end = map[at + target.length - 1] + 1;
    const dist = Math.abs(start - anchor.start);
    if (dist < bestDist) {
      best = { start, end, quote: anchor.quote };
      bestDist = dist;
    }
  }
  return best;
}
var overlaps = (a, b) => a.start < b.end && b.start < a.end;
var covers = (a, pos) => pos >= a.start && pos < a.end;
function shorten(s, n) {
  const t = String(s || "").replace(/\s+/g, " ").trim();
  return t.length > n ? t.slice(0, n) + "\u2026" : t;
}
function plainOf(md) {
  return md.replace(/```[\s\S]*?```/g, "").replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+\.)\s+/gm, "").replace(/[*_`~]/g, "").trim();
}

// src/client/doc/store.ts
var KEY2 = (messageId) => "dsh-review:doc:v1:" + messageId;
var AGENT_DEFAULT_KEY = "dsh-review:agent-default";
function agentDefault() {
  try {
    return window.localStorage.getItem(AGENT_DEFAULT_KEY) !== "off";
  } catch {
    return true;
  }
}
function setAgentDefault(on) {
  try {
    window.localStorage.setItem(AGENT_DEFAULT_KEY, on ? "on" : "off");
  } catch {
  }
}
var DocStore = class {
  state;
  listeners = /* @__PURE__ */ new Set();
  constructor(init) {
    let state = {
      sessionId: init.sessionId,
      messageId: init.messageId,
      title: init.title,
      original: init.markdown,
      markdown: init.markdown,
      version: 0,
      highlights: [],
      threads: [],
      nextId: 1
    };
    try {
      const raw = window.localStorage.getItem(KEY2(init.messageId));
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && saved.original === init.markdown && Array.isArray(saved.threads)) {
          state = {
            ...saved,
            sessionId: init.sessionId,
            title: init.title,
            /* An agent turn cut off by a reload never resumes. */
            threads: saved.threads.map((t) => ({
              ...t,
              messages: t.messages.map(
                (m) => m.status === "pending" || m.status === "streaming" ? { ...m, status: "error", text: m.text || "\uFF08\u56DE\u590D\u5DF2\u4E2D\u65AD\uFF09" } : m
              )
            }))
          };
        }
      }
    } catch {
    }
    this.state = state;
  }
  getSnapshot = () => this.state;
  subscribe = (fn) => {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  };
  update(fn) {
    this.state = fn(this.state);
    try {
      const persisted = { ...this.state, threads: this.state.threads.filter((t) => !t.draft) };
      window.localStorage.setItem(KEY2(this.state.messageId), JSON.stringify(persisted));
    } catch {
    }
    for (const fn2 of this.listeners) fn2();
  }
  thread(id) {
    return this.state.threads.find((t) => t.id === id);
  }
  patchThread(id, fn) {
    this.update((s) => ({ ...s, threads: s.threads.map((t) => t.id === id ? fn(t) : t) }));
  }
  /** Reserve an id. */
  allocate() {
    const id = this.state.nextId;
    this.update((s) => ({ ...s, nextId: s.nextId + 1 }));
    return id;
  }
  addHighlight(anchor) {
    const id = this.allocate();
    this.update((s) => ({ ...s, highlights: [...s.highlights, { id, anchor }] }));
  }
  removeHighlights(ids) {
    this.update((s) => ({ ...s, highlights: s.highlights.filter((h) => !ids.includes(h.id)) }));
  }
  createThread(anchor) {
    const id = this.allocate();
    const thread = { id, anchor, quote: anchor.quote, draft: true, askOn: agentDefault(), messages: [], input: "", resolved: false, edit: null };
    this.update((s) => ({ ...s, threads: [...s.threads, thread] }));
    return id;
  }
  dropDrafts() {
    if (this.state.threads.some((t) => t.draft)) this.update((s) => ({ ...s, threads: s.threads.filter((t) => !t.draft) }));
  }
  setMarkdown(markdown) {
    this.update((s) => ({ ...s, markdown, version: s.version + 1 }));
  }
};
var escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function applyEdit(md, find, replace) {
  if (!find) return null;
  let at = md.indexOf(find);
  let matched = find;
  if (at < 0) {
    const re = new RegExp(escapeRe(find.trim()).replace(/\s+/g, "\\s+"));
    const m = re.exec(md);
    if (!m) return null;
    at = m.index;
    matched = m[0];
  }
  return { md: md.slice(0, at) + replace + md.slice(at + matched.length), at, find: matched };
}
function undoEdit(md, edit) {
  const { at, find, replace } = edit;
  if (replace && md.slice(at, at + replace.length) === replace) return md.slice(0, at) + find + md.slice(at + replace.length);
  if (replace) {
    let best = -1;
    for (let i = md.indexOf(replace); i >= 0; i = md.indexOf(replace, i + 1)) {
      if (best < 0 || Math.abs(i - at) < Math.abs(best - at)) best = i;
    }
    if (best < 0) return null;
    return md.slice(0, best) + find + md.slice(best + replace.length);
  }
  const pos = Math.min(at, md.length);
  return md.slice(0, pos) + find + md.slice(pos);
}
function counts(s) {
  const real = s.threads.filter((t) => !t.draft);
  return {
    hl: s.highlights.length,
    cmt: real.length,
    edits: real.filter((t) => t.edit?.status === "applied").length,
    open: real.filter((t) => !t.resolved).length,
    done: real.filter((t) => t.resolved).length
  };
}
function activityParts(s) {
  const c = counts(s);
  const parts = [];
  if (c.hl) parts.push(c.hl + " \u5904\u9AD8\u4EAE");
  if (c.cmt) parts.push(c.cmt + " \u6761\u8BC4\u8BBA");
  if (c.edits) parts.push("\u5DF2\u4FEE\u8BA2 " + c.edits + " \u5904");
  return parts;
}
var lastAgent = (t) => t.messages.filter((m) => m.role === "agent" && m.text && m.status !== "error").slice(-1)[0];
function summaryLines(s, full = false) {
  const cut = (text, n) => full ? text.trim() : shorten(text, n);
  const lines = [];
  for (const h of s.highlights) lines.push({ tag: "\u9AD8\u4EAE", quote: cut(h.anchor.quote, 24), body: "\u4F60\u6807\u8BB0\u4E86\u8FD9\u6BB5\u8BB2\u5F97\u597D", order: h.anchor.start });
  for (const t of s.threads) {
    if (t.draft) continue;
    const agent = lastAgent(t);
    const users = t.messages.filter((m) => m.role === "user").map((m) => m.text);
    let tag = agent ? "\u8BA8\u8BBA" : "\u8BC4\u8BBA";
    let body = full ? users.join(" / ") + (agent ? "\nAgent\uFF1A" + agent.text : "") : agent ? agent.text : users[0] ?? "";
    if (t.edit?.status === "undone") {
      tag = "\u5DF2\u64A4\u9500";
      body = (full ? users.join(" / ") + "\n" : "") + "Agent \u66FE\u6309\u8981\u6C42\u4FEE\u6539\u6B63\u6587\uFF0C\u5DF2\u64A4\u9500\uFF0C\u6B63\u6587\u4FDD\u6301\u539F\u6837";
    }
    if (t.edit?.status === "applied") {
      tag = "\u5DF2\u4FEE\u6539";
      body = (full ? users.join(" / ") + "\n" : "") + (t.edit.replace ? "\u6539\u4E3A\uFF1A" + (full ? t.edit.replace : plainOf(t.edit.replace)) : "\u5DF2\u5220\u9664\u8FD9\u6BB5");
    }
    lines.push({ tag, quote: cut(t.quote, 24), body: cut(body, 56), order: t.anchor?.start ?? Number.MAX_SAFE_INTEGER });
  }
  return lines.sort((a, b) => a.order - b.order);
}
var REF_OPEN = "\u3010\u53C2\u8003\u6750\u6599\uFF1A\u6587\u6863\u6A21\u5F0F\u9605\u8BFB\u8BB0\u5F55\u3011";
var REF_CLOSE = "\u3010/\u53C2\u8003\u6750\u6599\u3011";
function serializeSummary(s) {
  const lines = summaryLines(s, true);
  const out = [
    REF_OPEN + "\u6211\u628A\u4F60\u7684\u56DE\u590D\u300C" + s.title + "\u300D\u5F53\u4F5C\u6587\u6863\u8BFB\u4E86\u4E00\u904D\uFF0C\u4E0B\u9762\u662F\u6211\u7559\u4E0B\u7684\u9AD8\u4EAE\u3001\u8BC4\u8BBA\u548C\u8BA8\u8BBA\uFF08\u9AD8\u4EAE\uFF1D\u6211\u8BA4\u53EF\u3001\u8BB2\u5F97\u597D\u7684\u5730\u65B9\uFF09\u3002",
    ""
  ];
  lines.forEach((l, i) => {
    out.push(i + 1 + ". [" + l.tag + "] \u300C" + l.quote + "\u300D");
    for (const b of l.body.split("\n")) out.push("   " + b);
  });
  if (s.markdown !== s.original) {
    out.push("", "\u9605\u8BFB\u4E2D\u6B63\u6587\u5DF2\u88AB\u4FEE\u8BA2\uFF0C\u4FEE\u8BA2\u540E\u7684\u5168\u6587\u5982\u4E0B\uFF1A", "<document>", s.markdown, "</document>");
  }
  out.push("", "\u8BF7\u628A\u8FD9\u4E9B\u4F5C\u4E3A\u80CC\u666F\uFF0C\u56DE\u5E94\u6211\u63A5\u4E0B\u6765\u7684\u6D88\u606F\u3002", REF_CLOSE, "");
  return out.join("\n");
}

// src/client/doc/view.ts
var docs = /* @__PURE__ */ new Map();
function replyMarkdown(uiConversation, sessionId, messageId) {
  try {
    const snap = uiConversation.binding(sessionId).target("chat").getSnapshot();
    const parts = [];
    for (const k of snap?.order ?? []) {
      const n = snap.nodes.get(k);
      if (n?.kind !== "assistant-step" || n.data?.finalNode?.messageId !== messageId) continue;
      const blocks = Array.isArray(n.data?.blocks) ? n.data.blocks : [];
      const t = blocks.filter((b) => b && b.kind === "text" && typeof b.text === "string").map((b) => b.text).join("\n");
      if (t.trim()) parts.push(t);
    }
    return parts.length ? parts.join("\n\n") : null;
  } catch {
    return null;
  }
}
function sessionTitle(sessions, sessionId) {
  try {
    const row = sessions.list.getSnapshot().byId[sessionId];
    return String(row?.displayTitle ?? row?.projectionValues?.title ?? "") || "\u5BF9\u8BDD";
  } catch {
    return "\u5BF9\u8BDD";
  }
}
var ViewStore = class {
  current = null;
  listeners = /* @__PURE__ */ new Set();
  getSnapshot = () => this.current;
  subscribe = (fn) => {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  };
  open(deps, sessionId, messageId) {
    const markdown = replyMarkdown(deps.uiConversation, sessionId, messageId);
    if (markdown === null) return false;
    let store = docs.get(messageId);
    if (!store || store.getSnapshot().original !== markdown) {
      store = new DocStore({ sessionId, messageId, title: sessionTitle(deps.sessions, sessionId), markdown });
      docs.set(messageId, store);
    }
    this.current = { sessionId, messageId, store };
    this.emit();
    return true;
  }
  close() {
    this.current = null;
    this.emit();
  }
  emit() {
    for (const fn of this.listeners) fn();
  }
};
var docView = new ViewStore();
function docFor(deps, sessionId, messageId) {
  const cached = docs.get(messageId);
  if (cached) return cached;
  try {
    if (!window.localStorage.getItem("dsh-review:doc:v1:" + messageId)) return void 0;
  } catch {
    return void 0;
  }
  const markdown = replyMarkdown(deps.uiConversation, sessionId, messageId);
  if (markdown === null) return void 0;
  const store = new DocStore({ sessionId, messageId, title: sessionTitle(deps.sessions, sessionId), markdown });
  docs.set(messageId, store);
  return store;
}

// src/client/doc/DocOverlay.tsx
var import_react = require("react");
var import_react_dom = require("react-dom");

// src/client/doc/agent.ts
var textOf = (content) => (Array.isArray(content) ? content : []).filter((b) => b && b.type === "text" && typeof b.text === "string").map((b) => b.text).join("\n");
var tokenTag = (token) => "\u3010\u8BC4\u8BBA " + token + "\u3011";
var AgentChannel = class {
  constructor(deps, parentId, title) {
    this.deps = deps;
    this.parentId = parentId;
    this.title = title;
  }
  child = null;
  creating = null;
  handle = null;
  target = null;
  unsubscribe = null;
  counter = 0;
  disposed = false;
  listeners = /* @__PURE__ */ new Set();
  /** True once the child exists (its first prompt carries the preamble). */
  get started() {
    return this.child !== null;
  }
  nextToken() {
    this.counter += 1;
    return "r" + this.counter;
  }
  onChange(fn) {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }
  async ensure() {
    if (this.child) return this.child;
    if (!this.creating) {
      this.creating = (async () => {
        const { sessions, uiConversation } = this.deps;
        const child = await sessions.fork({ sessionId: this.parentId });
        if (!child) throw new Error("\u65E0\u6CD5\u521B\u5EFA\u6587\u6863\u6A21\u5F0F\u4F1A\u8BDD");
        rememberChild(child);
        this.handle = sessions.retain(child, { source: "dsh-doc-review" });
        try {
          await this.handle?.ready;
        } catch {
        }
        const actx = sessions.scope(child);
        const session = actx ? sessions.sessionOf(actx) : void 0;
        if (session && typeof session.open === "function") await session.open();
        const binding = sessions.binding(child);
        Promise.resolve(binding?.session?.rename?.("\u6587\u6863\u6A21\u5F0F \xB7 " + this.title)).catch(() => {
        });
        this.target = uiConversation.binding(child).target("chat");
        this.unsubscribe = this.target.subscribe(() => this.emit());
        this.child = child;
        if (this.disposed) this.dispose();
        return child;
      })();
      this.creating.catch(() => {
        this.creating = null;
      });
    }
    return this.creating;
  }
  emit() {
    for (const fn of this.listeners) fn();
  }
  /** Prompt the child; the text must contain tokenTag(token). */
  async send(text) {
    const child = await this.ensure();
    const binding = this.deps.sessions.binding(child);
    if (!binding?.session?.prompt) throw new Error("\u6587\u6863\u6A21\u5F0F\u4F1A\u8BDD\u4E0D\u53EF\u7528");
    const result = await binding.session.prompt([{ type: "text", text }], "queue");
    if (result && result.ok === false) throw new Error("\u53D1\u9001\u5931\u8D25\uFF1A" + (result.error?.code ?? "unknown"));
    this.emit();
  }
  read(token) {
    const none = { seen: false, text: "", done: false, error: null };
    if (!this.target) return none;
    const snap = this.target.getSnapshot();
    const order = Array.isArray(snap?.order) ? snap.order : [];
    const nodes = order.map((k) => snap.nodes.get(k)).filter(Boolean);
    const tag = tokenTag(token);
    let i = nodes.findIndex((n) => n.kind === "user" && textOf(n.data?.content).includes(tag));
    if (i < 0) return none;
    const parts = [];
    let done = false;
    let interrupted = false;
    for (i = i + 1; i < nodes.length; i++) {
      const n = nodes[i];
      if (n.kind === "user") {
        done = true;
        break;
      }
      if (n.kind === "assistant-step") {
        const blocks = Array.isArray(n.data?.blocks) ? n.data.blocks : [];
        const t = blocks.filter((b) => b && b.kind === "text" && typeof b.text === "string").map((b) => b.text).join("\n");
        if (t) parts.push(t);
        if (n.data?.status === "interrupted") interrupted = true;
      }
      if (n.kind === "turn-tail") {
        done = true;
        break;
      }
    }
    const text = parts.join("\n\n");
    let error = null;
    if (done && interrupted && !text) error = "\u56DE\u590D\u88AB\u4E2D\u65AD\u4E86";
    else if (done && !text) {
      const s = this.deps.sessions.binding(this.child)?.session?.getSnapshot?.();
      error = s?.lastAgentError ? "\u56DE\u590D\u5931\u8D25\uFF1A" + String(s.lastAgentError.message ?? s.lastAgentError.code ?? s.lastAgentError) : "\u6CA1\u6709\u6536\u5230\u56DE\u590D";
    }
    return { seen: true, text, done, error };
  }
  /** Stop and archive the child; the reading's threads stay in the document. */
  dispose() {
    this.disposed = true;
    this.unsubscribe?.();
    this.unsubscribe = null;
    const child = this.child;
    if (!child) return;
    this.child = null;
    this.listeners.clear();
    const handle = this.handle;
    void retireChild(this.deps, child).finally(() => {
      try {
        handle?.releaseReference?.();
      } catch {
      }
    });
  }
};
var CHILDREN_KEY = "dsh-review:children";
function readChildren() {
  try {
    const v = JSON.parse(window.localStorage.getItem(CHILDREN_KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}
function writeChildren(ids) {
  try {
    window.localStorage.setItem(CHILDREN_KEY, JSON.stringify([...new Set(ids)]));
  } catch {
  }
}
var liveChildren = /* @__PURE__ */ new Set();
function rememberChild(id) {
  liveChildren.add(id);
  writeChildren([...readChildren(), id]);
}
var sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function retireChild(deps, child) {
  liveChildren.delete(child);
  const { sessions, workspaces } = deps;
  try {
    const s = sessions.binding(child)?.session;
    if (s?.getSnapshot?.()?.running) {
      await Promise.race([Promise.resolve(s.cancel()), sleep(3e3)]).catch(() => {
      });
      for (let i = 0; i < 20 && s.getSnapshot?.()?.running; i++) await sleep(150);
    }
  } catch {
  }
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const r = await workspaces?.archiveSession?.(child);
      if (!(r && r.ok === false)) {
        writeChildren(readChildren().filter((x) => x !== child));
        return true;
      }
    } catch (err) {
      if (attempt === 3) console.error("[dsh-doc-review] could not archive side session", child, err);
    }
    await sleep(800 * (attempt + 1));
  }
  return false;
}
async function sweepChildren(deps) {
  for (const id of readChildren()) if (!liveChildren.has(id)) await retireChild(deps, id);
}

// src/client/doc/controller.ts
var EDIT_FENCE = /```dsh-edit[^\n]*\n([\s\S]*?)```/;
function visibleReply(text) {
  const i = text.indexOf("```dsh-edit");
  return (i >= 0 ? text.slice(0, i) : text).trim();
}
function parseEdit(text) {
  const m = EDIT_FENCE.exec(text);
  if (!m) return null;
  try {
    const obj = JSON.parse(m[1].trim());
    if (typeof obj.find !== "string" || !obj.find) return null;
    return { find: obj.find, replace: typeof obj.replace === "string" ? obj.replace : "" };
  } catch {
    return null;
  }
}
var PREAMBLE = [
  "\u3010\u6587\u6863\u6A21\u5F0F\u3011\u6211\u6B63\u5728\u628A\u4F60\u5728\u8FD9\u4E2A\u5BF9\u8BDD\u91CC\u7684\u4E00\u6761\u56DE\u590D\uFF08\u5168\u6587\u9644\u5728\u4E0B\u9762\uFF09\u5F53\u4F5C\u4E00\u4EFD\u6587\u6863\u9605\u8BFB\uFF0C\u5E76\u5728\u6587\u6863\u91CC\u7684\u5177\u4F53\u6BB5\u843D\u65C1\u7559\u8BC4\u8BBA\u3002\u63A5\u4E0B\u6765\u6211\u53D1\u7684\u6BCF\u6761\u6D88\u606F\u90FD\u662F\u4E00\u6761\u8FD9\u6837\u7684\u8BC4\u8BBA\uFF0C\u8BF7\u9075\u5B88\uFF1A",
  "1. \u50CF\u6587\u6863\u8BC4\u8BBA\u533A\u91CC\u7684\u56DE\u590D\u4E00\u6837\u7B80\u77ED\u76F4\u63A5\uFF08\u901A\u5E38 1\uFF5E4 \u53E5\uFF09\uFF0C\u4E0D\u8981\u590D\u8FF0\u6211\u7684\u8BC4\u8BBA\uFF0C\u4E0D\u8981\u5BD2\u6684\uFF0C\u4E0D\u8981\u8F93\u51FA\u6574\u7BC7\u6587\u6863\u3002",
  "2. \u53EA\u6709\u5F53\u6211\u660E\u786E\u8981\u6C42\u4FEE\u6539\u6B63\u6587\uFF08\u6539\u5199\u3001\u5220\u6389\u3001\u8865\u5145\u3001\u7CBE\u7B80\u3001\u6362\u4E2A\u8BF4\u6CD5\u7B49\uFF09\u65F6\u624D\u4FEE\u6539\u3002\u4FEE\u6539\u65F6\u5148\u7528\u4E00\u53E5\u8BDD\u8BF4\u660E\u6539\u4E86\u4EC0\u4E48\uFF0C\u518D\u5728\u56DE\u590D\u672B\u5C3E\u9644\u4E0A\u4E00\u4E2A\u4EE3\u7801\u5757\uFF1A",
  "```dsh-edit",
  '{"find": "\u8981\u88AB\u66FF\u6362\u7684\u539F\u6587\u7247\u6BB5\uFF0C\u5FC5\u987B\u4E0E\u4E0B\u65B9\u5F53\u524D\u6587\u6863\u9010\u5B57\u4E00\u81F4", "replace": "\u66FF\u6362\u540E\u7684\u6587\u672C\uFF0C\u5220\u9664\u5C31\u5199\u7A7A\u5B57\u7B26\u4E32"}',
  "```",
  "   find \u8981\u77ED\u800C\u552F\u4E00\uFF0C\u901A\u5E38\u662F\u6211\u9009\u4E2D\u7684\u6587\u5B57\u6216\u5B83\u6240\u5728\u7684\u6574\u53E5\uFF1Breplace \u4FDD\u6301\u539F\u6709\u7684 Markdown \u683C\u5F0F\u3002\u4E00\u6B21\u56DE\u590D\u6700\u591A\u4E00\u4E2A dsh-edit \u5757\u3002",
  "3. \u6240\u6709\u8BC4\u8BBA\u5171\u4EAB\u8FD9\u4E00\u4E2A\u4E0A\u4E0B\u6587\uFF0C\u53EF\u4EE5\u5F15\u7528\u4E4B\u524D\u7684\u8BA8\u8BBA\u3002"
].join("\n");
var quoteBlock2 = (s) => s.trim().split(/\r?\n/).filter((l) => l.trim()).map((l) => "> " + l).join("\n");
var DocController = class {
  constructor(store, deps) {
    this.store = store;
    const s = store.getSnapshot();
    this.channel = new AgentChannel(deps, s.sessionId, s.title);
    this.off = this.channel.onChange(() => this.sync());
  }
  channel;
  sentVersion = -1;
  pending = [];
  /** Comments left without asking the agent, delivered as context with the next ask. */
  silent = [];
  off;
  dispose() {
    this.off();
    this.channel.dispose();
    for (const p of this.pending) {
      this.store.patchThread(p.threadId, (t) => ({
        ...t,
        messages: t.messages.map((m) => m.id === p.msgId && m.status !== "done" ? { ...m, status: "error", text: m.text || "\uFF08\u5DF2\u9000\u51FA\u6587\u6863\u6A21\u5F0F\uFF0C\u56DE\u590D\u4E2D\u6B62\uFF09" } : m)
      }));
    }
    this.pending.length = 0;
  }
  get busy() {
    return this.pending.length > 0;
  }
  /** Post the thread's composer text; ask the agent when the toggle (or @Agent) says so. */
  send(threadId) {
    const t = this.store.thread(threadId);
    if (!t) return;
    const text = t.input.trim();
    if (!text) return;
    const ask = t.askOn || /@agent/i.test(text);
    const userId = this.store.allocate();
    const agentId = ask ? this.store.allocate() : -1;
    this.store.patchThread(threadId, (x) => ({
      ...x,
      draft: false,
      input: "",
      messages: [...x.messages, { id: userId, role: "user", text }, ...ask ? [{ id: agentId, role: "agent", text: "", status: "pending" }] : []]
    }));
    if (!ask) {
      this.silent.push({ quote: t.quote, text });
      return;
    }
    const token = this.channel.nextToken();
    const prompt = this.compose(this.store.thread(threadId), text, token);
    this.pending.push({ threadId, msgId: agentId, token });
    this.channel.send(prompt).catch((err) => {
      this.finish(threadId, agentId, token, "", String(err?.message ?? err));
    });
  }
  compose(t, text, token) {
    const s = this.store.getSnapshot();
    const parts = [];
    if (!this.channel.started && this.sentVersion < 0) {
      parts.push(PREAMBLE);
      const earlier = s.threads.filter((x) => !x.draft && x.messages.length > 0).map((x) => {
        const msgs = x.id === t.id ? x.messages.slice(0, -2) : x.messages;
        const said = msgs.filter((m) => m.text && m.status !== "error").map((m) => (m.role === "user" ? "\u6211\uFF1A" : "Agent\uFF1A") + visibleReply(m.text).replace(/\s+/g, " ").slice(0, 300));
        if (!said.length) return "";
        const state = x.resolved ? "\uFF08\u5DF2\u89E3\u51B3\uFF09" : x.edit?.status === "applied" ? "\uFF08\u5DF2\u6539\u6B63\u6587\uFF09" : x.edit?.status === "undone" ? "\uFF08\u6539\u52A8\u5DF2\u64A4\u9500\uFF09" : "";
        return "- \u300C" + x.quote.replace(/\s+/g, " ").slice(0, 60) + "\u300D" + state + "\n  " + said.join("\n  ");
      }).filter(Boolean);
      if (earlier.length) parts.push("\u4E4B\u524D\u5728\u8FD9\u4EFD\u6587\u6863\u91CC\u5DF2\u6709\u7684\u8BC4\u8BBA\u8BA8\u8BBA\uFF08\u4F9B\u53C2\u8003\uFF09\uFF1A\n" + earlier.join("\n"));
      this.silent = [];
    }
    if (s.version !== this.sentVersion) {
      parts.push((this.sentVersion < 0 ? "\u5F53\u524D\u6587\u6863\uFF08Markdown\uFF09\uFF1A" : "\uFF08\u6587\u6863\u5DF2\u66F4\u65B0\uFF0C\u5F53\u524D\u5168\u6587\u5982\u4E0B\uFF09") + "\n<document>\n" + s.markdown + "\n</document>");
      this.sentVersion = s.version;
    }
    if (this.silent.length) {
      parts.push("\u6B64\u524D\u6211\u8FD8\u7559\u4E0B\u4E86\u8FD9\u4E9B\u8BC4\u8BBA\uFF08\u4E0D\u9700\u8981\u5355\u72EC\u56DE\u590D\uFF09\uFF1A\n" + this.silent.map((x) => "- \u300C" + x.quote + "\u300D\uFF1A" + x.text).join("\n"));
      this.silent = [];
    }
    const asked = t.messages.filter((m) => m.role === "user").length > 1;
    parts.push(
      tokenTag(token) + (asked ? "\uFF08\u540C\u4E00\u6761\u8BC4\u8BBA\u4E0B\u7684\u8FFD\u95EE\uFF09" : "") + "\n\u9009\u4E2D\u7684\u6587\u5B57\uFF1A\n" + quoteBlock2(t.quote) + "\n\u6211\u7684\u8BC4\u8BBA\uFF1A" + text.replace(/@agent/gi, "").trim()
    );
    return parts.join("\n\n");
  }
  sync() {
    for (const p of [...this.pending]) {
      const r = this.channel.read(p.token);
      if (!r.seen) continue;
      if (r.done) this.finish(p.threadId, p.msgId, p.token, r.text, r.error);
      else
        this.store.patchThread(p.threadId, (t) => ({
          ...t,
          messages: t.messages.map((m) => m.id === p.msgId ? { ...m, text: r.text, status: r.text ? "streaming" : "pending" } : m)
        }));
    }
  }
  finish(threadId, msgId, token, text, error) {
    const i = this.pending.findIndex((p) => p.token === token);
    if (i < 0) return;
    this.pending.splice(i, 1);
    this.store.patchThread(threadId, (t) => ({
      ...t,
      messages: t.messages.map((m) => m.id === msgId ? { ...m, text: error && !text ? error : text, status: error && !text ? "error" : "done" } : m)
    }));
    const edit = text ? parseEdit(text) : null;
    if (edit) this.apply(threadId, edit.find, edit.replace);
  }
  apply(threadId, find, replace) {
    const s = this.store.getSnapshot();
    const res = applyEdit(s.markdown, find, replace);
    if (!res) {
      this.store.patchThread(threadId, (t) => ({ ...t, edit: { find, replace, at: -1, status: "failed" } }));
      return;
    }
    this.store.update((st) => ({
      ...st,
      markdown: res.md,
      version: st.version + 1,
      threads: st.threads.map(
        (t) => t.id === threadId ? {
          ...t,
          edit: { find: res.find, replace, at: res.at, status: "applied" },
          /* Re-anchor the thread on the rewritten passage (deletions leave it unanchored). */
          anchor: replace && t.anchor ? { ...t.anchor, quote: plainOf(replace) } : null
        } : t
      )
    }));
  }
  undo(threadId) {
    const t = this.store.thread(threadId);
    if (!t?.edit || t.edit.status !== "applied") return;
    const md = undoEdit(this.store.getSnapshot().markdown, t.edit);
    if (md === null) return;
    const edit = t.edit;
    this.store.update((st) => ({
      ...st,
      markdown: md,
      version: st.version + 1,
      threads: st.threads.map(
        (x) => x.id === threadId ? { ...x, edit: { ...edit, status: "undone" }, anchor: { start: x.anchor?.start ?? edit.at, end: (x.anchor?.start ?? edit.at) + 1, quote: x.quote } } : x
      )
    }));
  }
  redo(threadId) {
    const t = this.store.thread(threadId);
    if (!t?.edit || t.edit.status !== "undone") return;
    this.apply(threadId, t.edit.find, t.edit.replace);
  }
};

// src/client/doc/DocOverlay.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
var registry2 = () => {
  const css = globalThis.CSS;
  return css?.highlights && typeof Highlight !== "undefined" ? css.highlights : null;
};
var HL_NAMES = ["dsd-hl", "dsd-cmt", "dsd-active", "dsd-flash"];
function columnRect() {
  const col = document.querySelector('[class*="centerCol"]');
  if (col) return col.getBoundingClientRect();
  const row = document.querySelector("[data-chat-flow-key]");
  for (let e = row?.parentElement ?? null; e; e = e.parentElement) {
    const r = e.getBoundingClientRect();
    if (r.height >= window.innerHeight - 4 && r.width > 0) return r;
  }
  return new DOMRect(0, 0, window.innerWidth, window.innerHeight);
}
function useColumnRect() {
  const [rect, setRect] = (0, import_react.useState)(columnRect);
  (0, import_react.useEffect)(() => {
    const update = () => setRect(columnRect());
    const ro = new ResizeObserver(update);
    const col = document.querySelector('[class*="centerCol"]');
    if (col) ro.observe(col);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);
  return rect;
}
var DocOverlay = (0, import_react.memo)(function DocOverlay2({ deps }) {
  const open = (0, import_react.useSyncExternalStore)(docView.subscribe, docView.getSnapshot);
  const [host, setHost] = (0, import_react.useState)(null);
  (0, import_react.useEffect)(() => {
    const el = document.createElement("div");
    el.dataset.dsrDoc = "true";
    el.className = "dsd-host";
    document.body.appendChild(el);
    setHost(el);
    return () => el.remove();
  }, []);
  if (!open || !host) return null;
  return (0, import_react_dom.createPortal)(/* @__PURE__ */ (0, import_jsx_runtime2.jsx)(DocView, { open, deps }, open.messageId), host);
});
function DocView({ open, deps }) {
  const store = open.store;
  const s = (0, import_react.useSyncExternalStore)(store.subscribe, store.getSnapshot);
  const controller = (0, import_react.useMemo)(() => new DocController(store, deps), [store, deps]);
  (0, import_react.useEffect)(() => () => controller.dispose(), [controller]);
  const rect = useColumnRect();
  const docRef = (0, import_react.useRef)(null);
  const bodyRef = (0, import_react.useRef)(null);
  const railRef = (0, import_react.useRef)(null);
  const scrollRef = (0, import_react.useRef)(null);
  const [sel, setSel] = (0, import_react.useState)(null);
  const [active, setActive] = (0, import_react.useState)(null);
  const [focusId, setFocusId] = (0, import_react.useState)(null);
  const [flash, setFlash] = (0, import_react.useState)(null);
  const [panel, setPanel] = (0, import_react.useState)(null);
  const [modal, setModal] = (0, import_react.useState)(false);
  const [hint, setHint] = (0, import_react.useState)(() => !s.threads.length && !s.highlights.length);
  const [tops, setTops] = (0, import_react.useState)({});
  const lastTops = (0, import_react.useRef)({});
  (0, import_react.useLayoutEffect)(() => {
    const root = bodyRef.current;
    if (!root || !root.textContent?.trim()) return;
    let changed = false;
    const threads = s.threads.map((t) => {
      const r = t.anchor ? resolve(root, t.anchor) : null;
      if (!r || r === t.anchor) return t;
      changed = true;
      return { ...t, anchor: r };
    });
    const highlights = s.highlights.map((h) => {
      const r = resolve(root, h.anchor);
      if (!r || r === h.anchor) return h;
      changed = true;
      return { ...h, anchor: r };
    });
    if (changed) store.update((st) => ({ ...st, threads, highlights }));
  }, [s.markdown]);
  const liveRange = (a) => {
    const root = bodyRef.current;
    const r = root && a ? resolve(root, a) : null;
    return r && root ? rangeOf(root, r.start, r.end) : null;
  };
  const editSig = s.threads.map((t) => t.id + ":" + (t.edit?.status ?? "")).join(",");
  const prevEdits = (0, import_react.useRef)(editSig);
  (0, import_react.useEffect)(() => {
    const before = new Map(prevEdits.current.split(",").map((x) => x.split(":")));
    prevEdits.current = editSig;
    const hit = s.threads.find((t) => t.edit?.status === "applied" && before.get(String(t.id)) !== "applied");
    if (!hit) return;
    setFlash(hit.id);
    const tm = window.setTimeout(() => setFlash((f) => f === hit.id ? null : f), 1800);
    return () => window.clearTimeout(tm);
  }, [editSig, s.threads]);
  (0, import_react.useLayoutEffect)(() => {
    const reg = registry2();
    const root = bodyRef.current;
    if (!reg || !root) return;
    const ranges = (anchors) => anchors.flatMap((a) => [liveRange(a)].filter((r) => r !== null));
    const live = s.threads.filter((t) => !t.resolved);
    const sets = {
      "dsd-hl": ranges(s.highlights.map((h) => h.anchor)),
      "dsd-cmt": ranges(live.filter((t) => !t.draft).map((t) => t.anchor)),
      "dsd-active": ranges([live.find((t) => t.id === active)?.anchor]),
      "dsd-flash": ranges([s.threads.find((t) => t.id === flash)?.anchor])
    };
    for (const name of HL_NAMES) {
      const list = sets[name];
      if (list.length) reg.set(name, new Highlight(...list));
      else reg.delete(name);
    }
  });
  (0, import_react.useEffect)(
    () => () => {
      const reg = registry2();
      if (reg) for (const name of HL_NAMES) reg.delete(name);
    },
    []
  );
  (0, import_react.useLayoutEffect)(() => {
    const rail = railRef.current;
    const root = bodyRef.current;
    if (!rail || !root) return;
    const rr = rail.getBoundingClientRect();
    const items = s.threads.filter((t) => !t.resolved).map((t) => {
      const range = liveRange(t.anchor);
      const r = range?.getClientRects()[0];
      const card = rail.querySelector('[data-thread="' + t.id + '"]');
      const anchorTop = r ? r.top - rr.top - 6 : lastTops.current[t.id] ?? 0;
      return { id: t.id, anchor: anchorTop, h: card ? card.offsetHeight : 90, top: 0 };
    }).sort((a, b) => a.anchor - b.anchor || a.id - b.id);
    if (!items.length) return;
    const gap = 10;
    let pivot = items.findIndex((x) => x.id === active);
    if (pivot < 0) pivot = 0;
    items[pivot].top = Math.max(0, items[pivot].anchor);
    for (let i = pivot + 1; i < items.length; i++) items[i].top = Math.max(items[i].anchor, items[i - 1].top + items[i - 1].h + gap);
    for (let i = pivot - 1; i >= 0; i--) items[i].top = Math.min(items[i].anchor, items[i + 1].top - items[i].h - gap);
    if (items[0].top < 0) {
      items[0].top = 0;
      for (let i = 1; i < items.length; i++) items[i].top = Math.max(items[i].top, items[i - 1].top + items[i - 1].h + gap);
    }
    const next = {};
    let changed = false;
    for (const x of items) {
      next[x.id] = Math.round(x.top);
      if (tops[x.id] !== next[x.id]) changed = true;
    }
    if (changed) {
      lastTops.current = { ...lastTops.current, ...next };
      setTops(next);
    }
  });
  const [, bump] = (0, import_react.useState)(0);
  (0, import_react.useEffect)(() => {
    const on = () => bump((n) => n + 1);
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  const close = (0, import_react.useCallback)(() => {
    store.dropDrafts();
    docView.close();
  }, [store]);
  const requestExit = (0, import_react.useCallback)(() => {
    const c2 = counts(store.getSnapshot());
    setSel(null);
    setPanel(null);
    if (!c2.cmt && !c2.hl) close();
    else setModal(true);
  }, [store, close]);
  const bringBack = () => {
    const st = store.getSnapshot();
    attachments.stage({
      id: "doc-" + st.messageId + "-" + Date.now().toString(36),
      sessionId: st.sessionId,
      title: "\u6587\u6863\u6A21\u5F0F\u9605\u8BFB\u6458\u8981",
      sub: activityParts(st).join(" \xB7 "),
      lines: summaryLines(st),
      text: serializeSummary(st)
    });
    close();
  };
  const onEscape = () => {
    if (modal) setModal(false);
    else if (sel) setSel(null);
    else if (panel) setPanel(null);
    else if (active !== null) setActive(null);
    else requestExit();
  };
  const escRef = (0, import_react.useRef)(onEscape);
  escRef.current = onEscape;
  (0, import_react.useEffect)(() => {
    const onKey = (e) => {
      if (e.key === "Escape") escRef.current();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  const isolate = (e) => e.stopPropagation();
  const onRootKey = (e) => {
    e.stopPropagation();
    if (e.key === "Escape") onEscape();
  };
  const toolbarAt = (range) => {
    const doc = docRef.current.getBoundingClientRect();
    const first = range.getClientRects()[0] ?? range.getBoundingClientRect();
    const x = Math.min(Math.max(first.left - doc.left + 60, 110), doc.width - 110);
    return { x: Math.round(x), y: Math.round(first.top - doc.top) };
  };
  const onMouseUp = () => {
    window.setTimeout(() => {
      const root = bodyRef.current;
      const w = window.getSelection();
      if (!root || !w || w.isCollapsed || w.rangeCount === 0) return;
      const range = w.getRangeAt(0);
      const a = offsetOf(root, range.startContainer, range.startOffset);
      const b = offsetOf(root, range.endContainer, range.endOffset);
      if (a === null || b === null || b <= a) return;
      const quote = flatten(root).text.slice(a, b);
      if (!quote.trim()) return;
      const anchor = { start: a, end: b, quote };
      const hlIds = store.getSnapshot().highlights.filter((h) => overlaps(h.anchor, anchor)).map((h) => h.id);
      setSel({ anchor, hlIds, ...toolbarAt(range), fromHighlight: false });
    }, 0);
  };
  const onMouseDown = (e) => {
    if (e.target.closest?.(".dsd-tb")) return;
    if (sel) setSel(null);
  };
  const onClick = (e) => {
    if (e.target.closest?.(".dsd-tb")) return;
    const root = bodyRef.current;
    const w = window.getSelection();
    if (!root || w && !w.isCollapsed) return;
    const doc = document;
    const caret = doc.caretRangeFromPoint?.(e.clientX, e.clientY);
    const pos = caret ? offsetOf(root, caret.startContainer, caret.startOffset) : null;
    if (pos === null) {
      setActive(null);
      return;
    }
    const st = store.getSnapshot();
    const t = st.threads.find((x) => !x.resolved && !x.draft && x.anchor && covers(x.anchor, pos));
    if (t) {
      setActive(t.id);
      setSel(null);
      return;
    }
    const h = st.highlights.find((x) => covers(x.anchor, pos));
    if (h) {
      const range = liveRange(h.anchor);
      if (range) setSel({ anchor: h.anchor, hlIds: [h.id], ...toolbarAt(range), fromHighlight: true });
      return;
    }
    setActive(null);
  };
  const tbDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const addHighlight = () => {
    if (!sel) return;
    window.getSelection()?.removeAllRanges();
    store.addHighlight(sel.anchor);
    setSel(null);
    setHint(false);
  };
  const removeHighlights = () => {
    if (!sel) return;
    window.getSelection()?.removeAllRanges();
    store.removeHighlights(sel.hlIds);
    setSel(null);
  };
  const addComment = () => {
    if (!sel) return;
    window.getSelection()?.removeAllRanges();
    store.dropDrafts();
    const id = store.createThread(sel.anchor);
    setActive(id);
    setFocusId(id);
    setSel(null);
    setHint(false);
  };
  const revealThread = (t) => {
    const root = bodyRef.current;
    const range = liveRange(t.anchor);
    const el = range?.startContainer.parentElement;
    if (el) el.scrollIntoView({ block: "center", behavior: "smooth" });
  };
  const c = counts(s);
  const parts = activityParts(s);
  const panelThreads = s.threads.filter((t) => !t.draft && (panel === "done" ? t.resolved : !t.resolved));
  const lines = modal ? summaryLines(s) : [];
  const firstHeading = /^\s*#\s+/.test(s.markdown);
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
    "div",
    {
      className: "dsd-root",
      style: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
      onKeyDown: onRootKey,
      onKeyUp: isolate,
      onKeyPress: isolate,
      onMouseDown: isolate,
      onMouseUp: isolate,
      onClick: isolate,
      onPointerDown: isolate,
      onPointerUp: isolate,
      onFocus: isolate,
      onBlur: isolate,
      onInput: isolate,
      onPaste: isolate,
      onCopy: isolate,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("header", { className: "dsd-bar", "data-window-drag": true, children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("button", { type: "button", className: "dsd-back", onClick: requestExit, children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Icon, { name: "back", size: 16, width: 2 }),
            "\u8FD4\u56DE\u5BF9\u8BDD"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dsd-divider" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dsd-pill", children: "\u6587\u6863\u6A21\u5F0F" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dsd-title", children: s.title }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dsd-spacer" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("button", { type: "button", className: "dsd-panelbtn" + (panel ? " on" : ""), "aria-pressed": panel !== null, onClick: () => setPanel(panel ? null : "open"), children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Icon, { name: "comment", size: 15, width: 1.8 }),
            c.open ? "\u8BC4\u8BBA " + c.open : "\u8BC4\u8BBA"
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "dsd-scroll", ref: scrollRef, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dsd-wrap", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dsd-doc", ref: docRef, onMouseUp, onMouseDown, onClick, children: [
            firstHeading ? null : /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h1", { className: "dsd-h1", children: s.title }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dsd-meta", children: [
              "\u6765\u81EA\u5BF9\u8BDD\u300C",
              s.title,
              "\u300D\u4E2D\u7684 Agent \u56DE\u590D",
              s.markdown !== s.original ? " \xB7 \u5DF2\u4FEE\u8BA2" : ""
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "dsd-body", ref: bodyRef, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Markdown, { text: s.markdown }) }),
            sel ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dsd-tb", style: { left: sel.x, top: sel.y }, role: "toolbar", "aria-label": "\u9009\u4E2D\u6587\u5B57", children: [
              sel.hlIds.length ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("button", { type: "button", onMouseDown: tbDown, onClick: removeHighlights, children: [
                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Icon, { name: "x", size: 15, width: 1.8 }),
                "\u53D6\u6D88\u9AD8\u4EAE"
              ] }) : /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("button", { type: "button", title: "\u6807\u8BB0\u8BB2\u5F97\u597D\u7684\u5730\u65B9", onMouseDown: tbDown, onClick: addHighlight, children: [
                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Icon, { name: "highlight", size: 15, width: 1.8 }),
                "\u9AD8\u4EAE"
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dsd-tb-sep" }),
              /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("button", { type: "button", onMouseDown: tbDown, onClick: addComment, children: [
                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Icon, { name: "comment", size: 15, width: 1.8 }),
                "\u8BC4\u8BBA"
              ] })
            ] }) : null
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("aside", { className: "dsd-rail", ref: railRef, "aria-label": "\u8BC4\u8BBA", children: s.threads.filter((t) => !t.resolved).map((t) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            ThreadCard,
            {
              thread: t,
              top: tops[t.id] ?? lastTops.current[t.id] ?? 0,
              active: active === t.id,
              focus: focusId === t.id,
              store,
              controller,
              onActivate: () => {
                setActive(t.id);
                setSel(null);
              },
              onCancel: () => {
                store.update((st) => ({ ...st, threads: st.threads.filter((x) => x.id !== t.id) }));
                setActive(null);
              },
              onResolve: () => {
                store.patchThread(t.id, (x) => ({ ...x, resolved: true }));
                setActive(null);
              }
            },
            t.id
          )) })
        ] }) }),
        hint ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dsd-hint", children: [
          "\u9009\u4E2D\u6587\u5B57\u53EF\u4EE5\u9AD8\u4EAE\u6216\u8BC4\u8BBA\u3002\u8BC4\u8BBA\u9ED8\u8BA4\u7531 Agent \u56DE\u590D\uFF0C\u4E5F\u53EF\u4EE5\u8BF7\u5B83\u76F4\u63A5\u4FEE\u6539\u6B63\u6587\u3002",
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", "aria-label": "\u5173\u95ED\u63D0\u793A", onClick: () => setHint(false), children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Icon, { name: "x", size: 12, width: 2.2 }) })
        ] }) : null,
        panel ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("aside", { className: "dsd-panel", "aria-label": "\u5168\u90E8\u8BC4\u8BBA", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dsd-panel-h", children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dsd-panel-title", children: "\u8BC4\u8BBA" }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dsd-spacer" }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", className: "dsd-ib", "aria-label": "\u5173\u95ED\u8BC4\u8BBA\u9762\u677F", onClick: () => setPanel(null), children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Icon, { name: "x", size: 15, width: 2 }) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dsd-tabs", children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("button", { type: "button", className: "dsd-tab" + (panel === "open" ? " on" : ""), onClick: () => setPanel("open"), children: [
              "\u672A\u89E3\u51B3 ",
              c.open
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("button", { type: "button", className: "dsd-tab" + (panel === "done" ? " on" : ""), onClick: () => setPanel("done"), children: [
              "\u5DF2\u89E3\u51B3 ",
              c.done
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dsd-plist", children: [
            panelThreads.map((t) => {
              const first = t.messages.find((m) => m.role === "user");
              const replies = t.messages.length - 1;
              return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
                "button",
                {
                  type: "button",
                  className: "dsd-pitem",
                  onClick: () => {
                    store.patchThread(t.id, (x) => ({ ...x, resolved: false }));
                    setPanel(null);
                    setActive(t.id);
                    revealThread(t);
                  },
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "dsd-pq", children: t.quote }),
                    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "dsd-pb", children: first?.text ?? "" }),
                    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "dsd-pm", children: (replies > 0 ? replies + " \u6761\u56DE\u590D" : "\u6682\u65E0\u56DE\u590D") + (t.edit?.status === "applied" ? " \xB7 \u5DF2\u4FEE\u6539\u6B63\u6587" : "") + (t.anchor ? "" : " \xB7 \u539F\u6587\u5DF2\u6539\u52A8") })
                  ]
                },
                t.id
              );
            }),
            panelThreads.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "dsd-pempty", children: panel === "open" ? "\u8FD8\u6CA1\u6709\u672A\u89E3\u51B3\u7684\u8BC4\u8BBA" : "\u8FD8\u6CA1\u6709\u5DF2\u89E3\u51B3\u7684\u8BC4\u8BBA" }) : null
          ] })
        ] }) : null,
        modal ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "dsd-overlay", onMouseDown: (e) => e.target === e.currentTarget && setModal(false), children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dsd-modal", role: "dialog", "aria-label": "\u5E26\u56DE\u4E3B\u4F1A\u8BDD", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "dsd-mh", children: "\u628A\u8FD9\u6B21\u9605\u8BFB\u5E26\u56DE\u4E3B\u4F1A\u8BDD\uFF1F" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dsd-md", children: [
            "\u8FD9\u6B21\u9605\u8BFB\u91CC\u6709 ",
            parts.join("\u3001"),
            "\u3002\u5E26\u56DE\u540E\uFF0C\u6458\u8981\u4F1A\u4F5C\u4E3A\u53C2\u8003\u6750\u6599\u9644\u5728\u8F93\u5165\u6846\u4E0A\u65B9\uFF0C\u968F\u4F60\u7684\u4E0B\u4E00\u6761\u6D88\u606F\u4E00\u8D77\u53D1\u7ED9 Agent\uFF1B\u4E0D\u5E26\u56DE\uFF0C\u5B83\u4EEC\u4E5F\u90FD\u4F1A\u7559\u5728\u6587\u6863\u91CC\u3002"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "dsd-mlist", children: lines.map((l, i) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(SummaryRow, { tag: l.tag, quote: l.quote, body: l.body }, i)) }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dsd-mrow", children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", className: "dsd-btn ghost", onClick: () => setModal(false), children: "\u7EE7\u7EED\u9605\u8BFB" }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dsd-spacer" }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", className: "dsd-btn", onClick: close, children: "\u4EC5\u8FD4\u56DE" }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", className: "dsd-btn primary", onClick: bringBack, children: "\u5E26\u56DE\u4E3B\u4F1A\u8BDD" })
          ] })
        ] }) }) : null
      ]
    }
  );
}
function SummaryRow({ tag, quote, body }) {
  const cls = tag === "\u9AD8\u4EAE" ? "t-hl" : tag === "\u5DF2\u4FEE\u6539" || tag === "\u5DF2\u64A4\u9500" ? "t-edit" : "t-cmt";
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dsd-sline", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dsd-stag " + cls, children: tag }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dsd-sq", children: [
        "\u300C",
        quote,
        "\u300D"
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "dsd-sb", children: body })
    ] })
  ] });
}
var ThreadCard = (0, import_react.memo)(function ThreadCard2({
  thread: t,
  top,
  active,
  focus,
  store,
  controller,
  onActivate,
  onCancel,
  onResolve
}) {
  const area = (0, import_react.useRef)(null);
  (0, import_react.useEffect)(() => {
    if (!focus) return;
    const raf = requestAnimationFrame(() => area.current?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(raf);
  }, [focus]);
  (0, import_react.useLayoutEffect)(() => {
    const el = area.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = Math.min(160, el.scrollHeight) + "px";
  }, [t.input, active]);
  const busy = t.messages.some((m) => m.status === "pending" || m.status === "streaming");
  const showComposer = t.draft || active;
  const send = () => {
    if (!t.input.trim()) return;
    controller.send(t.id);
  };
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dsd-card" + (active ? " is-active" : ""), "data-thread": t.id, style: { top }, onMouseDown: onActivate, children: [
    !t.draft ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", className: "dsd-resolve", "aria-label": "\u6807\u8BB0\u4E3A\u5DF2\u89E3\u51B3", title: "\u6807\u8BB0\u4E3A\u5DF2\u89E3\u51B3", onClick: onResolve, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Icon, { name: "check", size: 16, width: 2 }) }) : null,
    t.messages.map((m) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dsd-msg" + (m.role === "agent" ? " r-agent" : ""), children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "dsd-who", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dsd-name", children: m.role === "agent" ? "Agent" : "\u4F60" }) }),
      m.role === "agent" && m.status === "pending" ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dsd-thinking", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("i", {}),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("i", {}),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("i", {}),
        "\u6B63\u5728\u601D\u8003"
      ] }) : m.role === "agent" ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "dsd-mt dsd-md-text" + (m.status === "error" ? " is-error" : ""), children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Markdown, { text: visibleReply(m.text) || (m.status === "streaming" ? "\u6B63\u5728\u4FEE\u6539\u6B63\u6587\u2026" : m.text), streaming: m.status === "streaming" }) }) : /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "dsd-mt", children: m.text })
    ] }, m.id)),
    t.edit?.status === "applied" ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dsd-editrow", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dot" }),
      "\u5DF2\u4FEE\u6539\u6B63\u6587",
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", className: "dsd-link", onClick: () => controller.undo(t.id), children: "\u64A4\u9500" })
    ] }) : null,
    t.edit?.status === "undone" ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dsd-editrow", children: [
      "\u5DF2\u64A4\u9500\u4FEE\u6539\uFF0C\u6B63\u6587\u6062\u590D\u539F\u6837",
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", className: "dsd-link", onClick: () => controller.redo(t.id), children: "\u91CD\u65B0\u5E94\u7528" })
    ] }) : null,
    t.edit?.status === "failed" ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "dsd-editrow", children: "\u6CA1\u80FD\u5728\u6B63\u6587\u91CC\u5B9A\u4F4D\u5230\u8981\u6539\u7684\u539F\u6587\uFF0C\u6B63\u6587\u672A\u6539\u52A8" }) : null,
    showComposer ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dsd-cc", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        "textarea",
        {
          ref: area,
          rows: 1,
          value: t.input,
          placeholder: t.draft ? "\u6DFB\u52A0\u8BC4\u8BBA\u2026\uFF08@Agent \u4E5F\u53EF\u4EE5\u8BA9\u5B83\u56DE\u590D\uFF09" : "\u56DE\u590D\u2026",
          "aria-label": "\u8BC4\u8BBA\u5185\u5BB9",
          onChange: (e) => store.patchThread(t.id, (x) => ({ ...x, input: e.target.value })),
          onKeyDown: (e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              send();
            } else if (e.key === "Escape") {
              e.preventDefault();
              e.stopPropagation();
              if (t.draft && !t.input.trim()) onCancel();
              else e.currentTarget.blur();
            }
          }
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dsd-ccrow", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
          "button",
          {
            type: "button",
            className: "dsd-toggle" + (t.askOn ? " on" : ""),
            role: "switch",
            "aria-checked": t.askOn,
            onClick: () => {
              setAgentDefault(!t.askOn);
              store.patchThread(t.id, (x) => ({ ...x, askOn: !x.askOn }));
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dsd-switch" }),
              "Agent \u56DE\u590D"
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dsd-spacer" }),
        t.draft ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", className: "dsd-btn ghost sm", onClick: onCancel, children: "\u53D6\u6D88" }) : null,
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", className: "dsd-send", "aria-label": "\u53D1\u9001", disabled: !t.input.trim() || busy, onClick: send, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Icon, { name: "send", size: 14, width: 2.2 }) })
      ] })
    ] }) : null
  ] });
});

// src/client/doc/entry.tsx
var import_jsx_runtime3 = require("react/jsx-runtime");
var ATTACH_SOURCE = "dsh-doc-review";
var noopSub = () => () => {
};
var nullSnap = () => null;
function makeDocEntry(deps) {
  return (0, import_react2.memo)(function DocEntry({ sessionId, messageId }) {
    const openDoc = (0, import_react2.useSyncExternalStore)(docView.subscribe, docView.getSnapshot);
    const store = (0, import_react2.useMemo)(() => docFor(deps, String(sessionId), String(messageId)), [sessionId, messageId, openDoc]);
    const s = (0, import_react2.useSyncExternalStore)(store ? store.subscribe : noopSub, store ? store.getSnapshot : nullSnap);
    const [failed, setFailed] = (0, import_react2.useState)(false);
    const parts = s ? activityParts(s) : [];
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "dsd-entry", "data-dsr-ui": "true", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
        "button",
        {
          type: "button",
          className: "dsd-docbtn",
          title: failed ? "\u8FD9\u6761\u56DE\u590D\u8FD8\u6CA1\u6709\u53EF\u9605\u8BFB\u7684\u6B63\u6587" : "\u628A\u8FD9\u6761\u56DE\u590D\u5F53\u4F5C\u6587\u6863\u9605\u8BFB\u3001\u9AD8\u4EAE\u548C\u8BC4\u8BBA",
          onClick: () => {
            const ok = docView.open(deps, String(sessionId), String(messageId));
            setFailed(!ok);
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, { name: "doc", size: 14, width: 1.8 }),
            "\u4EE5\u6587\u6863\u6A21\u5F0F\u9605\u8BFB"
          ]
        }
      ),
      parts.length ? /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "dsd-badge", children: [
        "\u6587\u6863\u6A21\u5F0F \xB7 ",
        parts.join(" \xB7 ")
      ] }) : null
    ] });
  });
}
function emit(sessions, sessionId, event, payload) {
  try {
    const actx = sessions.scope(sessionId);
    return actx?.bail?.(actx, event, payload) === true;
  } catch {
    return false;
  }
}
function makeAttachDock(sessions) {
  return (0, import_react2.memo)(function AttachDock({
    sessionId,
    useInput
  }) {
    const sid = String(sessionId);
    (0, import_react2.useSyncExternalStore)(attachments.subscribe, attachments.getVersion);
    const input = useInput((i) => i);
    const occurrences = Array.isArray(input?.occurrences) ? input.occurrences : [];
    const pending = attachments.pending(sid);
    const settled = (0, import_react2.useRef)(/* @__PURE__ */ new Set());
    const [open, setOpen] = (0, import_react2.useState)(null);
    (0, import_react2.useEffect)(() => {
      if (!pending) return;
      const draft = String(input?.draft ?? "");
      const ok = emit(sessions, sid, "slash/input-insert-reference", {
        reference: { source: ATTACH_SOURCE, ref: pending.id, label: "\u200B", clipboardText: pending.text },
        span: { start: draft.length, end: draft.length, draftRev: input?.draftRev ?? -1 }
      });
      if (ok) attachments.settle(pending);
    }, [pending?.id]);
    const inputRef = (0, import_react2.useRef)(input);
    inputRef.current = input;
    (0, import_react2.useEffect)(() => {
      const onUnload = () => {
        const st = inputRef.current;
        for (const o of Array.isArray(st?.occurrences) ? st.occurrences : []) {
          if (o.source === ATTACH_SOURCE) emit(sessions, sid, "slash/input-consume-token", { guard: { kind: "span", span: { start: o.offset, end: o.offset + 1, draftRev: st?.draftRev ?? -1 } } });
        }
      };
      window.addEventListener("beforeunload", onUnload);
      return () => window.removeEventListener("beforeunload", onUnload);
    }, [sid]);
    (0, import_react2.useEffect)(() => {
      const tm = window.setTimeout(() => {
        const st = inputRef.current;
        const occ = Array.isArray(st?.occurrences) ? st.occurrences : [];
        const orphans = attachments.forSession(sid).filter((a) => !occ.some((o) => o.source === ATTACH_SOURCE && o.ref === a.id));
        const latest = orphans[orphans.length - 1];
        for (const a of orphans) if (a !== latest) attachments.drop(a.id);
        if (latest && !attachments.pending(sid)) attachments.stage(latest);
      }, 600);
      return () => window.clearTimeout(tm);
    }, [sid]);
    const live = attachments.forSession(sid).filter((a) => occurrences.some((o) => o.source === ATTACH_SOURCE && o.ref === a.id));
    (0, import_react2.useEffect)(() => {
      const present = /* @__PURE__ */ new Set();
      for (const a of attachments.forSession(sid)) {
        if (occurrences.some((o) => o.source === ATTACH_SOURCE && o.ref === a.id)) present.add(a.id);
        else if (settled.current.has(a.id)) attachments.drop(a.id);
      }
      settled.current = present;
    });
    if (!live.length) return null;
    const remove = (a) => {
      const occ = occurrences.find((o) => o.source === ATTACH_SOURCE && o.ref === a.id);
      if (occ) emit(sessions, sid, "slash/input-consume-token", { guard: { kind: "span", span: { start: occ.offset, end: occ.offset + 1, draftRev: input?.draftRev ?? -1 } } });
      attachments.drop(a.id);
    };
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "dsd-attachdock", "data-dsr-ui": "true", children: live.map((a) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "dsd-attach", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "dsd-attach-h", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, { name: "doc", size: 15, width: 1.8 }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "dsd-attach-title", children: a.title }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "dsd-attach-sub", children: a.sub }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "dsd-spacer" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", className: "dsd-ib sm", title: open === a.id ? "\u6536\u8D77\u6458\u8981" : "\u5C55\u5F00\u6458\u8981", "aria-label": open === a.id ? "\u6536\u8D77\u6458\u8981" : "\u5C55\u5F00\u6458\u8981", onClick: () => setOpen(open === a.id ? null : a.id), children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, { name: open === a.id ? "up" : "down", size: 14, width: 2 }) }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", className: "dsd-ib sm", title: "\u79FB\u9664\u53C2\u8003\u6750\u6599", "aria-label": "\u79FB\u9664\u53C2\u8003\u6750\u6599", onClick: () => remove(a), children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, { name: "x", size: 13, width: 2 }) })
      ] }),
      open === a.id ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "dsd-attach-list", children: a.lines.map((l, i) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(SummaryRow, { tag: l.tag, quote: l.quote, body: l.body }, i)) }) : null
    ] }, a.id)) });
  });
}

// src/client/ReviewLayer.tsx
var import_jsx_runtime4 = require("react/jsx-runtime");
function flattenDraft(draft, occurrences) {
  const byOffset = new Map((occurrences ?? []).map((o) => [o.offset, o]));
  let out = "";
  for (let i = 0; i < draft.length; i++) {
    const ch = draft[i];
    if (ch !== "\uFFFC") {
      out += ch;
      continue;
    }
    const occ = byOffset.get(i);
    if (occ?.source === ATTACH_SOURCE) out += attachments.get(occ.ref)?.text ?? "";
  }
  return out;
}
var KIND_KEYS = Object.keys(KINDS);
var CARD_GAP = 8;
var DEFAULT_H = 84;
var Icon2 = ({ name, size = 14 }) => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.75, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("path", { d: ICON_PATHS[name] }) });
function useLayoutTick(painter) {
  const [tick, setTick] = (0, import_react3.useState)(0);
  (0, import_react3.useEffect)(() => {
    let raf = 0;
    const bump = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        setTick((t) => t + 1);
      });
    };
    const off = painter.onPaint(bump);
    document.addEventListener("scroll", bump, true);
    window.addEventListener("resize", bump);
    return () => {
      off();
      document.removeEventListener("scroll", bump, true);
      window.removeEventListener("resize", bump);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [painter]);
  return tick;
}
function usePortalHost(className) {
  const [host, setHost] = (0, import_react3.useState)(null);
  (0, import_react3.useEffect)(() => {
    const el = document.createElement("div");
    el.className = className;
    el.dataset.dsrUi = "true";
    document.body.appendChild(el);
    setHost(el);
    return () => el.remove();
  }, [className]);
  return host;
}
function computeLayout(items, painter, heights, active) {
  const raw = [];
  let prose = null;
  let viewport = null;
  items.forEach((item, index) => {
    const range = painter.rangeFor(item);
    if (!range) return;
    const rects = range.getClientRects();
    const rect = rects[0];
    const last = rects[rects.length - 1];
    if (!rect || !last) return;
    if (!prose) {
      const body = proseElement(range.startContainer);
      if (body) {
        prose = body.getBoundingClientRect();
        viewport = (scrollParent(body) ?? document.documentElement).getBoundingClientRect();
      }
    }
    raw.push({ item, index, anchorTop: rect.top, anchorBottom: last.bottom, anchorLeft: rect.left, top: rect.top });
  });
  if (!prose || !viewport || raw.length === 0) return null;
  const p = prose;
  const v = viewport;
  const gutter = v.right - p.right - 40;
  const wide = gutter >= 200;
  const width = wide ? Math.min(300, gutter) : Math.min(320, p.width);
  const x = wide ? p.right + 28 : 0;
  const markerX = Math.min(p.right + 6, v.right - 26);
  raw.sort((a, b) => a.anchorTop - b.anchorTop || a.index - b.index);
  const h = (pl) => heights.get(pl.item.id) ?? DEFAULT_H;
  let pivot = raw.findIndex((pl) => pl.item.id === active);
  if (pivot < 0) pivot = 0;
  for (let i = pivot + 1; i < raw.length; i++) {
    const prev = raw[i - 1];
    raw[i].top = Math.max(raw[i].anchorTop, prev.top + h(prev) + CARD_GAP);
  }
  for (let i = pivot - 1; i >= 0; i--) {
    const next = raw[i + 1];
    raw[i].top = Math.min(raw[i].anchorTop, next.top - h(raw[i]) - CARD_GAP);
  }
  return { wide, x, width, markerX, proseLeft: p.left, proseRight: p.right, clip: v, placements: raw };
}
var Card = (0, import_react3.memo)(function Card2({
  item,
  index,
  active,
  focus,
  review,
  onActivate,
  onDeactivate,
  onHeight
}) {
  const meta = KINDS[item.kind];
  const ref = (0, import_react3.useRef)(null);
  const area = (0, import_react3.useRef)(null);
  const [menu, setMenu] = (0, import_react3.useState)(false);
  (0, import_react3.useLayoutEffect)(() => {
    if (ref.current) onHeight(item.id, ref.current.offsetHeight);
  });
  (0, import_react3.useEffect)(() => {
    if (focus && area.current) {
      area.current.focus();
    }
  }, [focus]);
  (0, import_react3.useLayoutEffect)(() => {
    const el = area.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = Math.min(160, el.scrollHeight) + "px";
  }, [item.note, active]);
  const discardIfEmpty = () => {
    if (meta.needsNote && item.note.trim().length === 0) review.remove(item.id);
  };
  const missing = meta.needsNote && item.note.trim().length === 0;
  const showField = active || item.note.length > 0 || missing;
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
    "div",
    {
      ref,
      className: "dsr-card",
      "data-kind": item.kind,
      "data-active": active,
      onMouseDown: () => onActivate(item.id),
      onBlur: (e) => {
        if (ref.current && e.relatedTarget instanceof Node && ref.current.contains(e.relatedTarget)) return;
        setMenu(false);
        discardIfEmpty();
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "dsr-card-head", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("button", { type: "button", className: "dsr-kind-chip", onClick: () => setMenu(!menu), "aria-haspopup": "menu", "aria-expanded": menu, children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Icon2, { name: item.kind, size: 13 }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: meta.label }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("svg", { width: "10", height: "10", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("path", { d: "m6 9 6 6 6-6" }) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "dsr-card-num", children: index + 1 }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { type: "button", className: "dsr-icon-btn dsr-card-del", "aria-label": "\u5220\u9664\u6279\u6CE8", title: "\u5220\u9664\u6279\u6CE8", onClick: () => review.remove(item.id), children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Icon2, { name: "trash", size: 14 }) })
        ] }),
        menu ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "dsr-menu", role: "menu", children: KIND_KEYS.map((k) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
          "button",
          {
            type: "button",
            role: "menuitemradio",
            "aria-checked": k === item.kind,
            "data-kind": k,
            className: "dsr-menu-item",
            onClick: () => {
              review.update(item.id, { kind: k });
              setMenu(false);
              area.current?.focus();
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Icon2, { name: k, size: 14 }),
              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: KINDS[k].label }),
              k === item.kind ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Icon2, { name: "check", size: 13 }) : null
            ]
          },
          k
        )) }) : null,
        showField ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          "textarea",
          {
            ref: area,
            className: "dsr-card-text",
            rows: 1,
            value: item.note,
            placeholder: meta.placeholder,
            onFocus: () => onActivate(item.id),
            onChange: (e) => review.update(item.id, { note: e.target.value }),
            onKeyDown: (e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                discardIfEmpty();
                e.currentTarget.blur();
                onDeactivate();
              } else if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                e.currentTarget.blur();
                onDeactivate();
              }
            }
          }
        ) : null,
        missing && !active ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "dsr-card-warn", children: "\u8FD8\u6CA1\u586B\u5199\u5185\u5BB9" }) : null
      ]
    }
  );
});
var ReviewLayer = (0, import_react3.memo)(function ReviewLayer2({ review, painter, trackDock, onFocusRequest, useInput, inputActions }) {
  const view = (0, import_react3.useSyncExternalStore)(review.subscribe, review.getSnapshot);
  const draft = useInput((s) => s.draft);
  const occurrences = useInput((s) => s.occurrences);
  const phase = useInput((s) => s.phase);
  const tick = useLayoutTick(painter);
  const marginHost = usePortalHost("dsr-margin-host");
  const barHost = usePortalHost("dsr-bar-host");
  const anchor = (0, import_react3.useRef)(null);
  const [active, setActive] = (0, import_react3.useState)(null);
  const [focusId, setFocusId] = (0, import_react3.useState)(null);
  const [overallOpen, setOverallOpen] = (0, import_react3.useState)(false);
  const heights = (0, import_react3.useRef)(/* @__PURE__ */ new Map()).current;
  const [, setMeasured] = (0, import_react3.useState)(0);
  (0, import_react3.useEffect)(() => trackDock(), [trackDock]);
  (0, import_react3.useEffect)(() => painter.show(view.items), [painter, view.items]);
  (0, import_react3.useEffect)(() => () => painter.show([]), [painter]);
  (0, import_react3.useEffect)(() => painter.setActive(active), [painter, active]);
  (0, import_react3.useEffect)(
    () => onFocusRequest(({ id, focus }) => {
      setActive(id);
      setFocusId(focus ? id : null);
    }),
    [onFocusRequest]
  );
  (0, import_react3.useEffect)(() => {
    const onClick = (e) => {
      if (e.target instanceof Node && !e.target.isConnected) return;
      if (e.target instanceof Element && e.target.closest("[data-dsr-ui],[data-dsr-doc]")) return;
      const sel = window.getSelection();
      if (sel && !sel.isCollapsed) return;
      const hit = painter.hitTest(e.clientX, e.clientY);
      setActive(hit);
      setFocusId(null);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [painter]);
  const onHeight = (0, import_react3.useCallback)((id, h) => {
    if (heights.get(id) !== h) {
      heights.set(id, h);
      setMeasured((m) => m + 1);
    }
  }, [heights]);
  const onActivate = (0, import_react3.useCallback)((id) => setActive(id), []);
  const onDeactivate = (0, import_react3.useCallback)(() => {
    setActive(null);
    setFocusId(null);
  }, []);
  const count = view.items.length;
  const visible = count > 0 || view.overall.trim().length > 0;
  const layout = marginHost && count > 0 ? computeLayout(view.items, painter, heights, active) : null;
  void tick;
  const incomplete = incompleteItems(view);
  const canSend = isSendable(view) && phase === "plain";
  const send = (mode) => {
    inputActions.setDraft(composeReview(view, flattenDraft(draft, occurrences), mode));
    inputActions.submit();
    review.clear();
    setActive(null);
    setOverallOpen(false);
  };
  const jumpToIncomplete = () => {
    const first = incomplete[0] ?? view.items[0];
    if (!first) return;
    painter.reveal(first);
    setActive(first.id);
    setFocusId(first.id);
  };
  let margin = null;
  if (layout) {
    const c = layout.clip;
    const top = Math.max(0, c.top);
    const right = Math.min(window.innerWidth, c.right);
    const bottom = Math.min(window.innerHeight, c.bottom);
    const left = Math.max(0, c.left);
    const clip = `polygon(${left}px ${top}px,${right}px ${top}px,${right}px ${bottom}px,${left}px ${bottom}px)`;
    margin = /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "dsr-margin", style: { clipPath: clip }, children: layout.placements.map((pl) => {
      const isActive = pl.item.id === active;
      if (!layout.wide && !isActive) {
        return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          "button",
          {
            type: "button",
            className: "dsr-marker",
            "data-kind": pl.item.kind,
            style: { left: layout.markerX, top: pl.anchorTop },
            onClick: () => setActive(pl.item.id),
            "aria-label": "\u6279\u6CE8 " + (pl.index + 1),
            children: pl.index + 1
          },
          pl.item.id
        );
      }
      return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        "div",
        {
          className: "dsr-slot",
          "data-wide": layout.wide,
          style: layout.wide ? { left: layout.x - (isActive ? 10 : 0), top: pl.top, width: layout.width } : {
            /* No margin: float the card just under its passage, inside the text column. */
            left: Math.min(Math.max(pl.anchorLeft, layout.proseLeft), layout.proseRight - layout.width),
            top: pl.anchorBottom + 8,
            width: layout.width
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
            Card,
            {
              item: pl.item,
              index: pl.index,
              active: isActive,
              focus: focusId === pl.item.id,
              review,
              onActivate,
              onDeactivate,
              onHeight
            }
          )
        },
        pl.item.id
      );
    }) });
  }
  let bar = null;
  if (visible && anchor.current) {
    const r = anchor.current.getBoundingClientRect();
    bar = /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "dsr-sendbar-wrap", style: { left: r.left + r.width / 2, bottom: window.innerHeight - r.top + 10 }, children: [
      overallOpen ? /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "dsr-overall-pop", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "dsr-overall-title", children: "\u6574\u4F53\u610F\u89C1" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          "textarea",
          {
            autoFocus: true,
            className: "dsr-overall-text",
            value: view.overall,
            placeholder: "\u5BF9\u6574\u7BC7\u7684\u770B\u6CD5\uFF0C\u6BD4\u5982\uFF1A\u6574\u4F53\u592A\u957F\u3001\u8BED\u6C14\u592A\u6B63\u5F0F\u2026",
            onChange: (e) => review.setOverall(e.target.value),
            onKeyDown: (e) => {
              if (e.key === "Escape" || e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                setOverallOpen(false);
              }
            }
          }
        )
      ] }) : null,
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "dsr-sendbar", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("button", { type: "button", className: "dsr-sb-count", onClick: jumpToIncomplete, title: "\u5B9A\u4F4D\u6279\u6CE8", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Icon2, { name: "comment", size: 14 }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { children: [
            count,
            " \u6761\u6279\u6CE8"
          ] })
        ] }),
        incomplete.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { className: "dsr-sb-warn", children: [
          incomplete.length,
          " \u6761\u672A\u586B\u5199"
        ] }) : null,
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "dsr-sb-sep" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("button", { type: "button", className: "dsr-sb-ghost", "data-on": overallOpen || view.overall.trim().length > 0, onClick: () => setOverallOpen(!overallOpen), children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Icon2, { name: "note", size: 14 }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: "\u6574\u4F53\u610F\u89C1" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { type: "button", className: "dsr-sb-ghost", onClick: () => {
          review.clear();
          setActive(null);
          setOverallOpen(false);
        }, children: "\u6E05\u7A7A" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "dsr-sb-sep" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { type: "button", className: "dsr-sb-btn", disabled: !canSend, onClick: () => send("discuss"), title: "\u6A21\u578B\u9010\u6761\u56DE\u5E94\u6BCF\u6761\u6279\u6CE8", children: "\u9010\u6761\u56DE\u5E94" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { type: "button", className: "dsr-sb-btn dsr-sb-primary", disabled: !canSend, onClick: () => send("revise"), title: "\u6A21\u578B\u6309\u6279\u6CE8\u8F93\u51FA\u4FEE\u8BA2\u540E\u7684\u5B8C\u6574\u7248\u672C", children: "\u51FA\u4FEE\u8BA2\u7248" })
      ] })
    ] });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { ref: anchor, className: "dsr-anchor", "data-dsr-ui": "true", children: [
    marginHost && margin ? (0, import_react_dom2.createPortal)(margin, marginHost) : null,
    barHost && bar ? (0, import_react_dom2.createPortal)(bar, barHost) : null
  ] });
});

// src/client/styles.ts
var TAG_ID = "dsh-doc-review/review.css";
var CSS2 = `
body{
  --dsr-surface:var(--dsw-alias-bg-layer-1,#fff);
  --dsr-border:var(--dsw-alias-border-l2,rgba(0,0,0,.1));
  --dsr-text:var(--dsw-alias-label-primary,#1f2329);
  --dsr-text-2:var(--dsw-alias-label-secondary,#646a73);
  --dsr-text-3:var(--dsw-alias-label-tertiary,#8f959e);
  --dsr-hover:var(--dsw-alias-interactive-bg-hover-solid,rgba(31,35,41,.06));
  --dsr-brand:var(--dsw-static-deepseek-500,#4d6bfe);
  --dsr-shadow:0 1px 2px rgba(31,35,41,.06),0 4px 14px rgba(31,35,41,.08);
  --dsr-shadow-lg:0 2px 4px rgba(31,35,41,.06),0 10px 28px rgba(31,35,41,.14);
  --dsd-line:color-mix(in srgb,var(--dsr-text) 12%,transparent);
  --dsd-line2:color-mix(in srgb,var(--dsr-text) 22%,transparent);
  --dsd-hover:color-mix(in srgb,var(--dsr-text) 6%,transparent);
  --dsd-soft:color-mix(in srgb,var(--dsr-text) 3%,var(--dsr-surface));
}

/* In-place marks: quiet by default, stronger when their card is active. */
::highlight(dsr-comment){background-color:rgba(255,198,10,.20);text-decoration:underline 2px rgba(232,170,0,.85);text-underline-offset:3px}
::highlight(dsr-agree){background-color:rgba(36,160,104,.14)}
::highlight(dsr-disagree){background-color:rgba(229,72,77,.09);text-decoration:underline wavy 1.5px rgba(229,72,77,.75);text-underline-offset:3px}
::highlight(dsr-active){background-color:rgba(255,198,10,.42)}

/* Kind accents. */
[data-kind='comment']{--dsr-accent:#d9a400}
[data-kind='agree']{--dsr-accent:#24a068}
[data-kind='disagree']{--dsr-accent:#e5484d}

/*
 * Desktop marks body-level portals as app-region:no-drag. pointer-events:none
 * does not exclude their rectangles from Electron's native drag hit testing.
 * Keep the portal hosts empty-sized; their fixed-position children still use
 * viewport coordinates and remain visible/clickable outside the hosts.
 */
.dsr-float-root,.dsr-margin-host,.dsr-margin,.dsr-bar-host,.dsd-host{position:fixed;top:0;left:0;width:0;height:0;overflow:visible;pointer-events:none}

/* Selection toolbar. */
.dsr-float-root{z-index:80}
.dsr-float-root>*{pointer-events:auto}
.dsr-toolbar{position:fixed;display:flex;align-items:center;gap:2px;height:34px;padding:0 4px;border-radius:8px;border:1px solid var(--dsr-border);background:var(--dsr-surface);box-shadow:var(--dsr-shadow-lg);animation:dsr-pop .12s ease-out}
.dsr-tb-btn{display:inline-flex;align-items:center;justify-content:center;gap:5px;height:26px;min-width:26px;padding:0 5px;border:none;border-radius:6px;background:none;color:var(--dsr-text-2);cursor:pointer;font:inherit;font-size:13px;line-height:1}
.dsr-tb-btn:hover{background:var(--dsr-hover);color:var(--dsr-text)}
.dsr-tb-primary{padding:0 8px;color:var(--dsr-text);font-weight:500}
.dsr-tb-sep{width:1px;height:16px;margin:0 3px;background:var(--dsr-border)}
.dsr-tip{position:fixed;padding:4px 8px;border-radius:6px;background:rgba(31,35,41,.92);color:#fff;font-size:12px;line-height:16px;white-space:nowrap;pointer-events:none}
@keyframes dsr-pop{from{opacity:0;transform:translateY(3px)}to{opacity:1;transform:none}}

/* Margin cards. */
.dsr-margin-host,.dsr-bar-host{z-index:60}
.dsr-slot{position:fixed;pointer-events:auto;transition:top .18s ease,left .18s ease}
.dsr-card{position:relative;box-sizing:border-box;padding:8px 10px 8px 12px;border:1px solid var(--dsr-border);border-radius:8px;background:var(--dsr-surface);box-shadow:var(--dsr-shadow);cursor:default}
.dsr-card::before{content:'';position:absolute;left:-1px;top:10px;bottom:10px;width:3px;border-radius:0 3px 3px 0;background:var(--dsr-accent);opacity:.9}
.dsr-card[data-active='true']{box-shadow:var(--dsr-shadow-lg);border-color:transparent}
.dsr-card-head{display:flex;align-items:center;gap:6px;height:24px}
.dsr-kind-chip{display:inline-flex;align-items:center;gap:4px;height:22px;padding:0 6px;margin-left:-4px;border:none;border-radius:5px;background:none;color:var(--dsr-accent);cursor:pointer;font:inherit;font-size:12px;font-weight:600}
.dsr-kind-chip:hover{background:var(--dsr-hover)}
.dsr-kind-chip svg:last-child{opacity:.6}
.dsr-card-num{margin-left:auto;color:var(--dsr-text-3);font-size:12px;font-variant-numeric:tabular-nums}
.dsr-icon-btn{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border:none;border-radius:5px;background:none;color:var(--dsr-text-3);cursor:pointer}
.dsr-icon-btn:hover{background:var(--dsr-hover);color:var(--dsr-text)}
.dsr-card-del{opacity:0;transition:opacity .12s}
.dsr-card:hover .dsr-card-del,.dsr-card[data-active='true'] .dsr-card-del{opacity:1}
.dsr-card-del:hover{color:#e5484d}
.dsr-card-text{display:block;width:100%;box-sizing:border-box;margin-top:4px;padding:2px 0;border:none;background:none;resize:none;outline:none;color:var(--dsr-text);font:inherit;font-size:13px;line-height:20px;overflow:hidden}
.dsr-card-text::placeholder{color:var(--dsr-text-3)}
.dsr-card-warn{margin-top:2px;color:#e5484d;font-size:12px;line-height:18px}
.dsr-menu{position:absolute;z-index:2;top:32px;left:6px;min-width:132px;padding:4px;border:1px solid var(--dsr-border);border-radius:8px;background:var(--dsr-surface);box-shadow:var(--dsr-shadow-lg)}
.dsr-menu-item{display:flex;align-items:center;gap:8px;width:100%;height:30px;padding:0 8px;border:none;border-radius:5px;background:none;color:var(--dsr-text);cursor:pointer;font:inherit;font-size:13px;text-align:left}
.dsr-menu-item svg:first-child{color:var(--dsr-accent)}
.dsr-menu-item svg:last-child:not(:first-child){margin-left:auto;color:var(--dsr-brand)}
.dsr-menu-item:hover{background:var(--dsr-hover)}
.dsr-marker{position:fixed;pointer-events:auto;width:20px;height:20px;border:none;border-radius:10px 10px 10px 2px;background:var(--dsr-accent);color:#fff;font-size:11px;font-weight:600;line-height:20px;text-align:center;cursor:pointer;box-shadow:var(--dsr-shadow)}

/* Send bar. */
.dsr-anchor{height:0;width:100%}
.dsr-sendbar-wrap{position:fixed;transform:translateX(-50%);pointer-events:auto;display:flex;flex-direction:column;align-items:center;gap:8px}
.dsr-sendbar{display:flex;align-items:center;gap:2px;height:40px;padding:0 4px 0 6px;border:1px solid var(--dsr-border);border-radius:20px;background:var(--dsr-surface);box-shadow:var(--dsr-shadow-lg);white-space:nowrap;animation:dsr-pop .15s ease-out}
.dsr-sb-count{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 8px;border:none;border-radius:15px;background:none;color:var(--dsr-text);cursor:pointer;font:inherit;font-size:13px;font-weight:500}
.dsr-sb-count:hover{background:var(--dsr-hover)}
.dsr-sb-warn{padding:0 6px;color:#e5484d;font-size:12px}
.dsr-sb-sep{width:1px;height:16px;margin:0 4px;background:var(--dsr-border)}
.dsr-sb-ghost{display:inline-flex;align-items:center;gap:5px;height:30px;padding:0 10px;border:none;border-radius:15px;background:none;color:var(--dsr-text-2);cursor:pointer;font:inherit;font-size:13px}
.dsr-sb-ghost:hover,.dsr-sb-ghost[data-on='true']{background:var(--dsr-hover);color:var(--dsr-text)}
.dsr-sb-btn{height:30px;padding:0 14px;border:1px solid var(--dsr-border);border-radius:15px;background:var(--dsr-surface);color:var(--dsr-text);cursor:pointer;font:inherit;font-size:13px;font-weight:500}
.dsr-sb-btn+.dsr-sb-btn{margin-left:4px}
.dsr-sb-btn:hover:not(:disabled){background:var(--dsr-hover)}
.dsr-sb-primary{border-color:transparent;background:var(--dsr-brand);color:#fff}
.dsr-sb-primary:hover:not(:disabled){background:var(--dsr-brand);filter:brightness(1.07)}
.dsr-sb-btn:disabled{opacity:.4;cursor:default}
.dsr-overall-pop{width:420px;max-width:calc(100vw - 32px);box-sizing:border-box;padding:10px 12px;border:1px solid var(--dsr-border);border-radius:10px;background:var(--dsr-surface);box-shadow:var(--dsr-shadow-lg);animation:dsr-pop .12s ease-out}
.dsr-overall-title{font-size:12px;font-weight:600;color:var(--dsr-text-2);margin-bottom:4px}
.dsr-overall-text{display:block;width:100%;min-height:60px;max-height:160px;box-sizing:border-box;padding:0;border:none;background:none;resize:vertical;outline:none;color:var(--dsr-text);font:inherit;font-size:13px;line-height:20px}

/* ---------- Document mode: quiet document-tool layer on top of dsh's own theme ---------- */
::highlight(dsd-hl){background-color:rgba(110,170,120,.22)}
::highlight(dsd-cmt){background-color:rgba(240,190,40,.16);text-decoration:underline 1.5px rgba(215,160,20,.6);text-underline-offset:4px}
::highlight(dsd-active){background-color:rgba(240,190,40,.36)}
::highlight(dsd-flash){background-color:rgba(240,190,40,.45)}

.dsd-entry{display:inline-flex;align-items:center;margin-left:6px}
.dsd-docbtn{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px;border:.5px solid var(--dsd-line2);border-radius:8px;background:var(--dsr-surface);color:var(--dsr-text-2);font:inherit;font-size:13px;cursor:pointer;white-space:nowrap}
.dsd-docbtn:hover{background:var(--dsd-hover);color:var(--dsr-text)}
.dsd-badge{margin-left:8px;font-size:12px;color:var(--dsr-text-3);white-space:nowrap}

.dsd-host{z-index:75}
.dsd-root{position:fixed;pointer-events:auto;display:flex;flex-direction:column;background:var(--dsr-surface);color:var(--dsr-text);z-index:75;font-size:14px;box-shadow:-1px 0 0 var(--dsd-line)}
.dsd-root button{font:inherit;cursor:pointer}
.dsd-spacer{flex:1}
.dsd-bar{height:52px;flex:none;display:flex;align-items:center;gap:12px;padding:0 16px 0 12px;border-bottom:.5px solid var(--dsd-line)}
.dsd-back{display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 10px 0 6px;border:none;border-radius:8px;background:none;color:var(--dsr-text);font-weight:500}
.dsd-back:hover{background:var(--dsd-hover)}
.dsd-divider{width:.5px;height:18px;background:var(--dsd-line2)}
.dsd-pill{font-size:12px;color:var(--dsr-text-3);white-space:nowrap}
.dsd-title{font-size:14px;color:var(--dsr-text-2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.dsd-panelbtn{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 10px;border:none;border-radius:8px;background:none;color:var(--dsr-text-2);font-size:13px;white-space:nowrap}
.dsd-panelbtn:hover,.dsd-panelbtn.on{background:var(--dsd-hover);color:var(--dsr-text)}
.dsd-scroll{flex:1;overflow:auto;position:relative}
.dsd-hint{position:absolute;bottom:24px;left:50%;transform:translateX(-50%);z-index:6;width:max-content;max-width:calc(100% - 32px);box-sizing:border-box;display:flex;align-items:center;gap:10px;padding:7px 8px 7px 14px;border-radius:10px;background:var(--dsr-surface);border:.5px solid var(--dsd-line2);color:var(--dsr-text-2);font-size:13px;box-shadow:0 4px 16px rgba(15,23,42,.07)}
.dsd-hint button{width:22px;height:22px;flex:none;border:none;border-radius:6px;background:none;color:var(--dsr-text-3);display:inline-flex;align-items:center;justify-content:center}
.dsd-hint button:hover{background:var(--dsd-hover)}
.dsd-wrap{display:flex;gap:40px;max-width:1080px;margin:0 auto;padding:36px 32px 240px;box-sizing:border-box}
.dsd-doc{flex:1 1 auto;max-width:700px;min-width:0;position:relative}
.dsd-h1{font-size:28px;line-height:1.3;font-weight:700;margin:0 0 8px}
.dsd-meta{color:var(--dsr-text-3);font-size:13px;margin-bottom:24px}
.dsd-body{font-size:16px;line-height:1.9}
.dsd-body ::selection{background:rgba(77,107,254,.18)}
.dsd-rail{flex:0 0 272px;position:relative}
@media (max-width:1180px){.dsd-wrap{gap:24px;padding:28px 20px 240px}.dsd-rail{flex-basis:236px}}

.dsd-tb{position:absolute;z-index:8;transform:translate(-50%,-100%);margin-top:-10px;display:flex;align-items:center;gap:2px;padding:3px;background:var(--dsr-surface);border:.5px solid var(--dsd-line2);border-radius:10px;box-shadow:0 6px 20px rgba(15,23,42,.10)}
.dsd-tb button{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 10px;border:none;border-radius:7px;background:none;color:var(--dsr-text);font-size:13px;white-space:nowrap}
.dsd-tb button:hover{background:var(--dsd-hover)}
.dsd-tb button svg{color:var(--dsr-text-3)}
.dsd-tb-sep{width:.5px;height:16px;margin:0 2px;background:var(--dsd-line2)}

.dsd-card{position:absolute;left:0;right:0;box-sizing:border-box;background:var(--dsr-surface);border:.5px solid var(--dsd-line);border-radius:12px;padding:12px 14px;transition:top .22s ease,transform .15s ease,box-shadow .15s ease,border-color .15s}
.dsd-card:hover{border-color:var(--dsd-line2)}
.dsd-card.is-active{box-shadow:0 8px 28px rgba(15,23,42,.09);border-color:var(--dsd-line2);transform:translateX(-6px)}
.dsd-resolve{position:absolute;top:8px;right:8px;width:26px;height:26px;border:none;border-radius:6px;background:none;color:var(--dsr-text-3);display:inline-flex;align-items:center;justify-content:center;opacity:0;transition:opacity .12s}
.dsd-card:hover .dsd-resolve,.dsd-card.is-active .dsd-resolve{opacity:1}
.dsd-resolve:hover{background:var(--dsd-hover);color:var(--dsr-text)}
.dsd-msg+.dsd-msg{margin-top:12px}
.dsd-who{display:flex;align-items:baseline;gap:6px;font-size:13px;padding-right:28px}
.dsd-name{font-weight:500;color:var(--dsr-text)}
.r-agent .dsd-name{color:var(--dsr-text-2)}
.dsd-mt{margin-top:3px;font-size:14px;line-height:1.7;white-space:pre-wrap;color:var(--dsr-text);word-break:break-word}
.r-agent .dsd-mt{color:var(--dsr-text-2);white-space:normal}
.dsd-mt.is-error{color:var(--dsr-text-3)}
.dsd-md-text p{margin:0 0 6px}.dsd-md-text p:last-child{margin-bottom:0}
.dsd-md-text ul,.dsd-md-text ol{margin:4px 0;padding-left:18px}
.dsd-md-text pre{font-size:12px;overflow:auto}
.dsd-thinking{margin-top:4px;font-size:13px;color:var(--dsr-text-3);display:flex;align-items:center;gap:5px}
.dsd-thinking i{width:4px;height:4px;border-radius:2px;background:currentColor;animation:dsd-b 1.1s infinite}
.dsd-thinking i:nth-child(2){animation-delay:.15s}
.dsd-thinking i:nth-child(3){animation-delay:.3s}
@keyframes dsd-b{0%,80%,100%{opacity:.3}40%{opacity:1}}
.dsd-editrow{margin-top:8px;display:flex;align-items:center;gap:8px;font-size:12px;color:var(--dsr-text-3)}
.dsd-editrow .dot{width:5px;height:5px;border-radius:3px;background:rgba(215,160,20,.8)}
.dsd-link{border:none;background:none;color:var(--dsr-text-2);font-size:12px;padding:0;text-decoration:underline;text-decoration-color:var(--dsd-line2);text-underline-offset:2px}
.dsd-link:hover{color:var(--dsr-text)}
.dsd-cc{margin-top:12px;border:.5px solid var(--dsd-line2);border-radius:10px;padding:8px 10px;background:var(--dsr-surface)}
.dsd-cc:focus-within{border-color:color-mix(in srgb,var(--dsr-text) 45%,transparent)}
.dsd-cc textarea{display:block;width:100%;box-sizing:border-box;border:none;resize:none;outline:none;font:inherit;font-size:14px;line-height:1.6;min-height:24px;color:var(--dsr-text);background:none;padding:0}
.dsd-cc textarea::placeholder{color:var(--dsr-text-3)}
.dsd-ccrow{display:flex;align-items:center;gap:6px;margin-top:8px}
.dsd-send{width:26px;height:26px;flex:none;border:none;border-radius:7px;background:var(--dsr-text);color:var(--dsr-surface);display:inline-flex;align-items:center;justify-content:center}
.dsd-send:disabled{opacity:.3;cursor:default}
.dsd-toggle{display:inline-flex;align-items:center;gap:6px;height:24px;padding:0 6px 0 2px;border:none;border-radius:6px;background:none;color:var(--dsr-text-3);font-size:12px}
.dsd-toggle:hover{background:var(--dsd-hover)}
.dsd-switch{width:12px;height:12px;box-sizing:border-box;border-radius:3px;border:1px solid var(--dsr-text-3);position:relative}
.dsd-toggle.on{color:var(--dsr-text-2)}
.dsd-toggle.on .dsd-switch{border-color:var(--dsr-text-2);background:var(--dsr-text-2)}
.dsd-toggle.on .dsd-switch::after{content:'';position:absolute;left:3px;top:.5px;width:3px;height:6px;border:solid var(--dsr-surface);border-width:0 1.5px 1.5px 0;transform:rotate(45deg)}
.dsd-btn{height:30px;padding:0 12px;border:.5px solid var(--dsd-line2);border-radius:8px;background:var(--dsr-surface);color:var(--dsr-text);font-size:13px}
.dsd-btn:hover{background:var(--dsd-hover)}
.dsd-btn.primary{border-color:transparent;background:var(--dsr-text);color:var(--dsr-surface)}
.dsd-btn.primary:hover{opacity:.88}
.dsd-btn.ghost{border-color:transparent;background:none;color:var(--dsr-text-2)}
.dsd-btn.ghost:hover{background:var(--dsd-hover)}
.dsd-btn.sm{height:26px;padding:0 8px;font-size:12px}
.dsd-ib{width:30px;height:30px;border:none;border-radius:8px;background:none;color:var(--dsr-text-3);display:inline-flex;align-items:center;justify-content:center;cursor:pointer}
.dsd-ib:hover{background:var(--dsd-hover);color:var(--dsr-text)}
.dsd-ib.sm{width:24px;height:24px;border-radius:6px}

.dsd-panel{position:absolute;top:52px;right:0;bottom:0;width:340px;max-width:100%;z-index:20;background:var(--dsr-surface);border-left:.5px solid var(--dsd-line2);box-shadow:-8px 0 24px rgba(15,23,42,.05);display:flex;flex-direction:column}
.dsd-panel-h{display:flex;align-items:center;gap:8px;padding:12px 12px 8px 16px}
.dsd-panel-title{font-weight:600;font-size:15px}
.dsd-tabs{display:flex;gap:2px;padding:0 12px 10px;border-bottom:.5px solid var(--dsd-line)}
.dsd-tab{height:28px;padding:0 10px;border:none;border-radius:7px;background:none;color:var(--dsr-text-3);font-size:13px}
.dsd-tab:hover{color:var(--dsr-text)}
.dsd-tab.on{background:var(--dsd-hover);color:var(--dsr-text)}
.dsd-plist{flex:1;overflow:auto;padding:8px}
.dsd-pitem{display:block;width:100%;text-align:left;border:none;background:none;border-radius:10px;padding:10px;color:var(--dsr-text)}
.dsd-pitem:hover{background:var(--dsd-hover)}
.dsd-pq{font-size:12px;color:var(--dsr-text-3);padding-left:8px;border-left:1.5px solid rgba(215,160,20,.55);line-height:1.6;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.dsd-pb{margin-top:6px;font-size:13px;line-height:1.6;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.dsd-pm{margin-top:4px;font-size:12px;color:var(--dsr-text-3)}
.dsd-pempty{padding:32px 16px;text-align:center;color:var(--dsr-text-3);font-size:13px}

.dsd-sline{display:flex;gap:10px;padding:9px 0;border-top:.5px solid var(--dsd-line)}
.dsd-stag{flex:none;font-size:11px;font-weight:500;padding:0 6px;border-radius:4px;height:18px;line-height:18px;color:var(--dsr-text-2);background:var(--dsd-hover)}
.dsd-stag.t-hl{color:#2f6b3d;background:rgba(110,170,120,.18)}
.dsd-stag.t-cmt{color:#7a5a08;background:rgba(240,190,40,.18)}
.dsd-sq{font-size:13px;color:var(--dsr-text-3)}
.dsd-sb{font-size:13px;color:var(--dsr-text);margin-top:2px;line-height:1.6;white-space:pre-wrap}
.dsd-overlay{position:absolute;inset:0;z-index:50;background:rgba(15,23,42,.24);display:flex;align-items:center;justify-content:center;padding:24px}
.dsd-modal{width:520px;max-width:100%;max-height:calc(100% - 48px);overflow:auto;box-sizing:border-box;background:var(--dsr-surface);border-radius:14px;padding:22px 24px;box-shadow:0 20px 60px rgba(15,23,42,.18)}
.dsd-mh{font-size:17px;font-weight:600;line-height:1.4}
.dsd-md{margin-top:6px;color:var(--dsr-text-2);line-height:1.7}
.dsd-mlist{margin-top:16px;border:.5px solid var(--dsd-line2);border-radius:10px;padding:2px 14px}
.dsd-mlist .dsd-sline:first-child{border-top:none}
.dsd-mrow{display:flex;align-items:center;gap:8px;margin-top:20px}

.dsd-attachdock{display:flex;flex-direction:column;gap:6px;width:100%;max-width:800px;box-sizing:border-box;margin:0 auto 8px}
.dsd-attach{border:.5px solid var(--dsd-line2);border-radius:10px;background:var(--dsd-soft);padding:6px 6px 6px 10px}
.dsd-attach-h{display:flex;align-items:center;gap:8px;font-size:13px;min-width:0}
.dsd-attach-h>svg{color:var(--dsr-text-3);flex:none}
.dsd-attach-title{font-weight:500;color:var(--dsr-text);white-space:nowrap}
.dsd-attach-sub{color:var(--dsr-text-3);font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.dsd-attach-list{max-height:180px;overflow:auto;margin-top:6px;padding:0 6px 2px 0}
.dsd-attach-list .dsd-sline:first-child{border-top:none}
[data-composer-chip="dsh-doc-review"]{display:none}
.dsd-refmsg{display:flex;flex-direction:column;align-items:flex-start;width:fit-content;max-width:100%;margin:2px 0 8px}
.dsd-refpill{display:inline-flex;align-items:center;gap:6px;height:26px;padding:0 10px;border:.5px solid var(--dsd-line2);border-radius:8px;background:var(--dsr-surface);color:var(--dsr-text-2);font:inherit;font-size:12px;cursor:pointer;white-space:nowrap}
.dsd-refpill:hover{background:var(--dsd-hover);color:var(--dsr-text)}
.dsd-refpill>svg{color:var(--dsr-text-3)}
.dsd-refpill .sub{color:var(--dsr-text-3)}
.dsd-refbody{margin-top:6px;max-height:260px;overflow:auto;padding:8px 10px;border:.5px solid var(--dsd-line);border-radius:8px;background:var(--dsr-surface);font-size:12px;line-height:1.6;color:var(--dsr-text-2);white-space:pre-wrap;text-align:left}
`;
function ensureStyles() {
  if (document.querySelector('style[data-plugin-css="' + TAG_ID + '"]')) return () => {
  };
  const tag = document.createElement("style");
  tag.dataset.plugin = "dsh-doc-review";
  tag.dataset.pluginCss = TAG_ID;
  tag.textContent = CSS2;
  document.head.appendChild(tag);
  return () => tag.remove();
}

// src/client/doc/refmsg.tsx
var import_react4 = require("react");
var import_jsx_runtime5 = require("react/jsx-runtime");
var LEGACY_END = "\u8BF7\u628A\u8FD9\u4E9B\u4F5C\u4E3A\u80CC\u666F\uFF0C\u56DE\u5E94\u6211\u63A5\u4E0B\u6765\u7684\u6D88\u606F\u3002";
var REF_NODE_ID = "dsh-review-ref";
var refRule = {
  id: REF_NODE_ID,
  order: 5,
  match(text, from) {
    const start = text.indexOf(REF_OPEN, from);
    if (start < 0) return void 0;
    let end = text.indexOf(REF_CLOSE, start);
    if (end >= 0) end += REF_CLOSE.length;
    else {
      const legacy = text.indexOf(LEGACY_END, start);
      if (legacy < 0) return void 0;
      end = legacy + LEGACY_END.length;
    }
    while (end < text.length && /\s/.test(text[end])) end++;
    return { id: REF_NODE_ID, start, end, data: {} };
  }
};
function describe(raw) {
  const n = (re) => (raw.match(re) ?? []).length;
  const parts = [];
  const hl = n(/\[高亮\]/g);
  const cmt = n(/\[(评论|讨论|已修改|已撤销)\]/g);
  const edits = n(/\[已修改\]/g);
  if (hl) parts.push(hl + " \u5904\u9AD8\u4EAE");
  if (cmt) parts.push(cmt + " \u6761\u8BC4\u8BBA");
  if (edits) parts.push("\u5DF2\u4FEE\u8BA2 " + edits + " \u5904");
  return parts.join(" \xB7 ");
}
function RefMessage({ raw }) {
  const [open, setOpen] = (0, import_react4.useState)(false);
  const body = raw.replace(REF_OPEN, "").replace(REF_CLOSE, "").trim();
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("span", { className: "dsd-refmsg", "data-dsr-ui": "true", children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("button", { type: "button", className: "dsd-refpill", onClick: () => setOpen(!open), title: open ? "\u6536\u8D77" : "\u5C55\u5F00\u9605\u8BFB\u6458\u8981", children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Icon, { name: "doc", size: 13, width: 1.8 }),
      "\u6587\u6863\u6A21\u5F0F\u9605\u8BFB\u6458\u8981",
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "sub", children: describe(raw) }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Icon, { name: open ? "up" : "down", size: 12, width: 2 })
    ] }),
    open ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "dsd-refbody", children: body }) : null
  ] });
}
var REVIEW_NODE_ID = "dsh-review-notes";
var REVIEW_OPEN = "\u3010\u5BA1\u9605\u610F\u89C1";
var reviewRule = {
  id: REVIEW_NODE_ID,
  order: 6,
  match(text, from) {
    const start = text.indexOf(REVIEW_OPEN, from);
    if (start < 0) return void 0;
    const close = text.indexOf(REVIEW_CLOSE, start);
    let end = close >= 0 ? close + REVIEW_CLOSE.length : text.length;
    while (end < text.length && /\s/.test(text[end])) end++;
    return { id: REVIEW_NODE_ID, start, end, data: {} };
  }
};
function ReviewNotesMessage({ raw }) {
  const [open, setOpen] = (0, import_react4.useState)(false);
  const revise = raw.startsWith("\u3010\u5BA1\u9605\u610F\u89C1\xB7\u8BF7\u51FA\u4FEE\u8BA2\u7248\u3011");
  const kinds = {};
  for (const m of raw.matchAll(/(?:批注|意见) \d+｜(\S+)/g)) kinds[m[1]] = (kinds[m[1]] ?? 0) + 1;
  const total = Object.values(kinds).reduce((a, b) => a + b, 0);
  const parts = Object.entries(kinds).map(([k, n]) => k + " " + n);
  if (/(整体|总体)意见：/.test(raw)) parts.push("\u6574\u4F53\u610F\u89C1");
  const body = raw.replace(REVIEW_CLOSE, "").trim();
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("span", { className: "dsd-refmsg", "data-dsr-ui": "true", children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("button", { type: "button", className: "dsd-refpill", onClick: () => setOpen(!open), title: open ? "\u6536\u8D77" : "\u5C55\u5F00\u5BA1\u9605\u610F\u89C1", children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Icon, { name: "comment", size: 13, width: 1.8 }),
      revise ? "\u5BA1\u9605\u610F\u89C1 \xB7 \u51FA\u4FEE\u8BA2\u7248" : "\u5BA1\u9605\u610F\u89C1 \xB7 \u9010\u6761\u56DE\u5E94",
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "sub", children: (total ? total + " \u6761\u6279\u6CE8" : "") + (parts.length ? "\uFF08" + parts.join("\u3001") + "\uFF09" : "") }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Icon, { name: open ? "up" : "down", size: 12, width: 2 })
    ] }),
    open ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "dsd-refbody", children: body }) : null
  ] });
}

// src/client/index.ts
var inject = ["slots", "sessions", "uiConversation", "inputTriggers", "workspaces"];
function apply(ctx) {
  ctx.effect(() => ensureStyles(), "review: stylesheet");
  const painter = new HighlightPainter();
  ctx.effect(() => () => painter.dispose(), "review: highlights");
  const stores = /* @__PURE__ */ new Map();
  const storeFor = (sessionId) => {
    let store = stores.get(sessionId);
    if (!store) {
      store = new ReviewStore(sessionId);
      stores.set(sessionId, store);
    }
    return store;
  };
  const focusListeners = /* @__PURE__ */ new Set();
  const onFocusRequest = (fn) => {
    focusListeners.add(fn);
    return () => {
      focusListeners.delete(fn);
    };
  };
  const mounted = /* @__PURE__ */ new Map();
  const currentSession = () => {
    let last = null;
    for (const id of mounted.keys()) last = id;
    return last;
  };
  ctx.effect(
    () => createToolbar({
      stage: (kind, quote, rowKey, range) => {
        const sessionId = currentSession();
        if (sessionId === null) return null;
        const id = storeFor(sessionId).add(kind, quote, "", rowKey);
        painter.seed(id, range);
        const req = { id, focus: KINDS[kind].needsNote };
        for (const fn of focusListeners) fn(req);
        return id;
      }
    }),
    "review: toolbar"
  );
  ctx.slots.inject(
    "conversation.input.dock",
    () => ctx.slots.register(
      {
        name: "conversation.input.dock",
        id: "review",
        order: 90,
        inject: (sessionId) => ({
          review: storeFor(String(sessionId)),
          painter,
          onFocusRequest,
          trackDock: () => {
            const key = String(sessionId);
            mounted.delete(key);
            mounted.set(key, true);
            return () => {
              mounted.delete(key);
            };
          }
        })
      },
      ReviewLayer
    )
  );
  const deps = { sessions: ctx.sessions, uiConversation: ctx.uiConversation, workspaces: ctx.workspaces };
  const DocEntry = makeDocEntry(deps);
  ctx.effect(() => {
    const tm = window.setTimeout(() => void sweepChildren(deps), 4e3);
    return () => window.clearTimeout(tm);
  }, "review: sweep side sessions");
  const AttachDock = makeAttachDock(ctx.sessions);
  ctx.slots.inject(
    "conversation.chat.assistant-actions",
    () => ctx.slots.register({ name: "conversation.chat.assistant-actions", id: "review-doc", order: 30 }, DocEntry)
  );
  ctx.slots.inject(
    "shell.overlay",
    () => ctx.slots.register({ name: "shell.overlay", id: "review-doc", order: 60 }, () => (0, import_react5.createElement)(DocOverlay, { deps }))
  );
  ctx.slots.inject(
    "conversation.input.dock",
    () => ctx.slots.register({ name: "conversation.input.dock", id: "review-attach", order: 6 }, AttachDock)
  );
  try {
    for (const rule of [refRule, reviewRule]) {
      const off = ctx.uiConversation.userText.register(rule);
      if (typeof off === "function") ctx.effect(() => off, "review: user-text rule " + rule.id);
    }
  } catch (err) {
    console.error("[dsh-doc-review] user-text rule registration failed:", err);
  }
  ctx.slots.inject(
    "conversation.user.text.node",
    () => ctx.slots.register({ name: "conversation.user.text.node", key: REF_NODE_ID, priority: 100 }, RefMessage)
  );
  ctx.slots.inject(
    "conversation.user.text.node",
    () => ctx.slots.register({ name: "conversation.user.text.node", key: REVIEW_NODE_ID, priority: 100 }, ReviewNotesMessage)
  );
  try {
    const off = ctx.inputTriggers.registerSource({
      trigger: "@",
      name: ATTACH_SOURCE,
      candidates: async () => [],
      onPick: () => "handled",
      codec: {
        clipboardText: (ref) => attachments.get(ref)?.text ?? "",
        serialize: async (ref) => attachments.get(ref)?.text ?? ""
      }
    });
    if (typeof off === "function") ctx.effect(() => off, "review: attach codec");
  } catch (err) {
    console.error("[dsh-doc-review] reference codec registration failed:", err);
  }
}
		return module.exports;
	}
});
