/* dc-lite — a tiny runtime that renders GHG Town 3D's .dc.html template (holes, sc-if, sc-for, onClick, ref)
   in any browser, without the Claude Design viewer. DOM is patched in place (no flicker, animations keep running). */
(function () {
  'use strict';
  window.DCLogic = class DCLogic {
    constructor(props) { this.props = props || {}; this.state = {}; }
    setState(patch) {
      const p = typeof patch === 'function' ? patch(this.state, this.props) : patch;
      this.state = Object.assign({}, this.state, p);
      if (this.__dcSchedule) this.__dcSchedule();
    }
  };

  const HOLE = /\{\{\s*([^}]*?)\s*\}\}/g;
  const ONE = /^\s*\{\{\s*([^}]*?)\s*\}\}\s*$/;

  function lookup(path, scope, vals) {
    const p = path.trim();
    if (p === 'true') return true;
    if (p === 'false') return false;
    const parts = p.split('.');
    let v = Object.prototype.hasOwnProperty.call(scope, parts[0]) ? scope[parts[0]] : (vals ? vals[parts[0]] : undefined);
    for (let i = 1; i < parts.length && v != null; i++) v = v[parts[i]];
    return v;
  }
  function subst(str, scope, vals) {
    const m = ONE.exec(str);
    if (m) return lookup(m[1], scope, vals);
    return str.replace(HOLE, (x, p) => { const v = lookup(p, scope, vals); return v == null ? '' : String(v); });
  }

  function mount(root, tplHtml, Cls, props) {
    const host = document.createElement('template');
    host.innerHTML = tplHtml;
    const frag = host.content;
    const helmet = frag.querySelector('helmet');
    if (helmet) {
      for (const n of Array.from(helmet.childNodes)) if (n.nodeType === 1) document.head.appendChild(document.importNode(n, true));
      helmet.remove();
    }
    const C = new Cls(props || {});
    const keep = new Map(); // ref callback -> element (created once, like a mounted React node)
    const refQueue = [];

    function build(node, scope, vals, out) {
      if (node.nodeType === 3) {
        const t = node.nodeValue;
        const v = t.indexOf('{{') >= 0 ? subst(t, scope, vals) : t;
        out.push(document.createTextNode(v == null ? '' : String(v)));
        return;
      }
      if (node.nodeType !== 1) return;
      const tag = node.tagName.toLowerCase();
      if (tag === 'sc-if') {
        if (subst(node.getAttribute('value') || '', scope, vals)) for (const ch of node.childNodes) build(ch, scope, vals, out);
        return;
      }
      if (tag === 'sc-for') {
        const list = subst(node.getAttribute('list') || '', scope, vals);
        const as = node.getAttribute('as') || 'item';
        if (!Array.isArray(list)) return;
        for (const item of list) {
          const sc = Object.assign({}, scope);
          sc[as] = item;
          for (const ch of node.childNodes) build(ch, sc, vals, out);
        }
        return;
      }
      const refAttr = node.getAttribute('ref');
      let refFn = null;
      if (refAttr) {
        refFn = subst(refAttr, scope, vals);
        if (typeof refFn === 'function' && keep.has(refFn)) {
          const ph = document.createElement('dc-keep');
          ph.__keep = keep.get(refFn);
          out.push(ph);
          return;
        }
      }
      const svg = node.namespaceURI && node.namespaceURI !== 'http://www.w3.org/1999/xhtml';
      const el = svg ? document.createElementNS(node.namespaceURI, node.tagName) : document.createElement(node.tagName);
      for (const a of Array.from(node.attributes)) {
        const n = a.name;
        if (n.indexOf('hint-placeholder') === 0 || n === 'ref') continue;
        const v = a.value.indexOf('{{') >= 0 ? subst(a.value, scope, vals) : a.value;
        if (n === 'onclick') { if (typeof v === 'function') el.__h = v; continue; }
        if (n === 'disabled' || n === 'hidden' || n === 'checked') { if (v === true || v === 'true' || v === '') el.setAttribute(n, ''); continue; }
        if (v == null || v === false) continue;
        el.setAttribute(n, String(v));
      }
      if (refFn && typeof refFn === 'function') { el.__isKeep = true; keep.set(refFn, el); refQueue.push([refFn, el]); }
      const kids = [];
      for (const ch of node.childNodes) build(ch, scope, vals, kids);
      for (const k of kids) el.appendChild(k);
      out.push(el);
    }

    function morphEl(live, next) {
      const la = live.attributes;
      for (let i = la.length - 1; i >= 0; i--) { const n = la[i].name; if (!next.hasAttribute(n)) live.removeAttribute(n); }
      const na = next.attributes;
      for (let i = 0; i < na.length; i++) { const a = na[i]; if (live.getAttribute(a.name) !== a.value) live.setAttribute(a.name, a.value); }
      live.__h = next.__h;
      morphKids(live, next);
    }
    // a freshly built subtree can hold <dc-keep> placeholders deeper down (e.g. the minimap canvas inside a
    // re-created panel): swap them for the kept live elements before the subtree goes into the page
    function resolveKeeps(n) {
      if (n.__keep) return n.__keep;
      if (n.nodeType === 1 && !n.__isKeep) {
        for (const ch of Array.from(n.childNodes)) {
          const r = resolveKeeps(ch);
          if (r !== ch) n.replaceChild(r, ch);
        }
      }
      return n;
    }
    function morphKids(live, next) {
      const nk = Array.from(next.childNodes);
      for (let i = 0; i < nk.length; i++) {
        let n = nk[i];
        if (n.__keep) n = n.__keep;
        const l = live.childNodes[i];
        if (!l) { live.appendChild(resolveKeeps(n)); continue; }
        if (l === n) continue;
        if (n.__isKeep || l.__isKeep) { live.insertBefore(resolveKeeps(n), l); continue; }
        if (l.nodeType !== n.nodeType || l.nodeName !== n.nodeName) { live.replaceChild(resolveKeeps(n), l); continue; }
        if (n.nodeType === 3 || n.nodeType === 8) { if (l.nodeValue !== n.nodeValue) l.nodeValue = n.nodeValue; continue; }
        morphEl(l, n);
      }
      while (live.childNodes.length > nk.length) live.removeChild(live.lastChild);
    }

    let pending = false;
    function render() {
      const vals = C.renderVals();
      const next = document.createElement('div');
      const out = [];
      for (const ch of frag.childNodes) build(ch, {}, vals, out);
      for (const n of out) next.appendChild(n);
      morphKids(root, next);
      // refs: mount callbacks for new elements, unmount for removed ones
      while (refQueue.length) { const r = refQueue.shift(); try { r[0](r[1]); } catch (err) { console.error(err); } }
      for (const [fn, el] of Array.from(keep.entries())) {
        if (!root.contains(el)) { keep.delete(fn); try { fn(null); } catch (err) { console.error(err); } }
      }
    }
    C.__dcSchedule = () => {
      if (pending) return;
      pending = true;
      Promise.resolve().then(() => { pending = false; render(); });
    };
    root.addEventListener('click', (e) => {
      let t = e.target;
      while (t && t !== root) {
        if (t.__h) { if (!t.disabled) t.__h(e); return; }
        t = t.parentNode;
      }
    });
    render();
    if (typeof C.componentDidMount === 'function') C.componentDidMount();
    window.addEventListener('pagehide', () => { if (typeof C.componentWillUnmount === 'function') C.componentWillUnmount(); });
    return C;
  }

  window.DCLite = { mount: mount };
})();
