/**
* @vue/shared v3.5.13
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
/*! #__NO_SIDE_EFFECTS__ */
// @__NO_SIDE_EFFECTS__
function zo(e) {
  const t = /* @__PURE__ */ Object.create(null);
  for (const n of e.split(",")) t[n] = 1;
  return (n) => n in t;
}
const we = {}, vn = [], Tt = () => {
}, Wu = () => !1, Ms = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // uppercase letter
(e.charCodeAt(2) > 122 || e.charCodeAt(2) < 97), Uo = (e) => e.startsWith("onUpdate:"), ze = Object.assign, Ho = (e, t) => {
  const n = e.indexOf(t);
  n > -1 && e.splice(n, 1);
}, Ju = Object.prototype.hasOwnProperty, ye = (e, t) => Ju.call(e, t), oe = Array.isArray, yn = (e) => Is(e) === "[object Map]", Oa = (e) => Is(e) === "[object Set]", le = (e) => typeof e == "function", Ie = (e) => typeof e == "string", qt = (e) => typeof e == "symbol", Me = (e) => e !== null && typeof e == "object", Fa = (e) => (Me(e) || le(e)) && le(e.then) && le(e.catch), qa = Object.prototype.toString, Is = (e) => qa.call(e), Yu = (e) => Is(e).slice(8, -1), Pa = (e) => Is(e) === "[object Object]", Vo = (e) => Ie(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e, Bn = /* @__PURE__ */ zo(
  // the leading comma is intentional so empty string "" is also included
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
), Ns = (e) => {
  const t = /* @__PURE__ */ Object.create(null);
  return (n) => t[n] || (t[n] = e(n));
}, Xu = /-(\w)/g, gt = Ns(
  (e) => e.replace(Xu, (t, n) => n ? n.toUpperCase() : "")
), Qu = /\B([A-Z])/g, Wt = Ns(
  (e) => e.replace(Qu, "-$1").toLowerCase()
), Ls = Ns((e) => e.charAt(0).toUpperCase() + e.slice(1)), nr = Ns(
  (e) => e ? `on${Ls(e)}` : ""
), Gt = (e, t) => !Object.is(e, t), ms = (e, ...t) => {
  for (let n = 0; n < e.length; n++)
    e[n](...t);
}, Ba = (e, t, n, s = !1) => {
  Object.defineProperty(e, t, {
    configurable: !0,
    enumerable: !1,
    writable: s,
    value: n
  });
}, To = (e) => {
  const t = parseFloat(e);
  return isNaN(t) ? e : t;
}, ef = (e) => {
  const t = Ie(e) ? Number(e) : NaN;
  return isNaN(t) ? e : t;
};
let Tc;
const Os = () => Tc || (Tc = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {});
function Qn(e) {
  if (oe(e)) {
    const t = {};
    for (let n = 0; n < e.length; n++) {
      const s = e[n], r = Ie(s) ? rf(s) : Qn(s);
      if (r)
        for (const o in r)
          t[o] = r[o];
    }
    return t;
  } else if (Ie(e) || Me(e))
    return e;
}
const tf = /;(?![^(]*\))/g, nf = /:([^]+)/, sf = /\/\*[^]*?\*\//g;
function rf(e) {
  const t = {};
  return e.replace(sf, "").split(tf).forEach((n) => {
    if (n) {
      const s = n.split(nf);
      s.length > 1 && (t[s[0].trim()] = s[1].trim());
    }
  }), t;
}
function Tn(e) {
  let t = "";
  if (Ie(e))
    t = e;
  else if (oe(e))
    for (let n = 0; n < e.length; n++) {
      const s = Tn(e[n]);
      s && (t += s + " ");
    }
  else if (Me(e))
    for (const n in e)
      e[n] && (t += n + " ");
  return t.trim();
}
function Rc(e) {
  if (!e) return null;
  let { class: t, style: n } = e;
  return t && !Ie(t) && (e.class = Tn(t)), n && (e.style = Qn(n)), e;
}
const of = "itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly", cf = /* @__PURE__ */ zo(of);
function $a(e) {
  return !!e || e === "";
}
const za = (e) => !!(e && e.__v_isRef === !0), fn = (e) => Ie(e) ? e : e == null ? "" : oe(e) || Me(e) && (e.toString === qa || !le(e.toString)) ? za(e) ? fn(e.value) : JSON.stringify(e, Ua, 2) : String(e), Ua = (e, t) => za(t) ? Ua(e, t.value) : yn(t) ? {
  [`Map(${t.size})`]: [...t.entries()].reduce(
    (n, [s, r], o) => (n[sr(s, o) + " =>"] = r, n),
    {}
  )
} : Oa(t) ? {
  [`Set(${t.size})`]: [...t.values()].map((n) => sr(n))
} : qt(t) ? sr(t) : Me(t) && !oe(t) && !Pa(t) ? String(t) : t, sr = (e, t = "") => {
  var n;
  return (
    // Symbol.description in es2019+ so we need to cast here to pass
    // the lib: es2016 check
    qt(e) ? `Symbol(${(n = e.description) != null ? n : t})` : e
  );
};
/**
* @vue/reactivity v3.5.13
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let et;
class af {
  constructor(t = !1) {
    this.detached = t, this._active = !0, this.effects = [], this.cleanups = [], this._isPaused = !1, this.parent = et, !t && et && (this.index = (et.scopes || (et.scopes = [])).push(
      this
    ) - 1);
  }
  get active() {
    return this._active;
  }
  pause() {
    if (this._active) {
      this._isPaused = !0;
      let t, n;
      if (this.scopes)
        for (t = 0, n = this.scopes.length; t < n; t++)
          this.scopes[t].pause();
      for (t = 0, n = this.effects.length; t < n; t++)
        this.effects[t].pause();
    }
  }
  /**
   * Resumes the effect scope, including all child scopes and effects.
   */
  resume() {
    if (this._active && this._isPaused) {
      this._isPaused = !1;
      let t, n;
      if (this.scopes)
        for (t = 0, n = this.scopes.length; t < n; t++)
          this.scopes[t].resume();
      for (t = 0, n = this.effects.length; t < n; t++)
        this.effects[t].resume();
    }
  }
  run(t) {
    if (this._active) {
      const n = et;
      try {
        return et = this, t();
      } finally {
        et = n;
      }
    }
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  on() {
    et = this;
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  off() {
    et = this.parent;
  }
  stop(t) {
    if (this._active) {
      this._active = !1;
      let n, s;
      for (n = 0, s = this.effects.length; n < s; n++)
        this.effects[n].stop();
      for (this.effects.length = 0, n = 0, s = this.cleanups.length; n < s; n++)
        this.cleanups[n]();
      if (this.cleanups.length = 0, this.scopes) {
        for (n = 0, s = this.scopes.length; n < s; n++)
          this.scopes[n].stop(!0);
        this.scopes.length = 0;
      }
      if (!this.detached && this.parent && !t) {
        const r = this.parent.scopes.pop();
        r && r !== this && (this.parent.scopes[this.index] = r, r.index = this.index);
      }
      this.parent = void 0;
    }
  }
}
function Ha() {
  return et;
}
function lf(e, t = !1) {
  et && et.cleanups.push(e);
}
let Re;
const rr = /* @__PURE__ */ new WeakSet();
class Va {
  constructor(t) {
    this.fn = t, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, et && et.active && et.effects.push(this);
  }
  pause() {
    this.flags |= 64;
  }
  resume() {
    this.flags & 64 && (this.flags &= -65, rr.has(this) && (rr.delete(this), this.trigger()));
  }
  /**
   * @internal
   */
  notify() {
    this.flags & 2 && !(this.flags & 32) || this.flags & 8 || Ga(this);
  }
  run() {
    if (!(this.flags & 1))
      return this.fn();
    this.flags |= 2, Dc(this), Ka(this);
    const t = Re, n = bt;
    Re = this, bt = !0;
    try {
      return this.fn();
    } finally {
      Za(this), Re = t, bt = n, this.flags &= -3;
    }
  }
  stop() {
    if (this.flags & 1) {
      for (let t = this.deps; t; t = t.nextDep)
        Ko(t);
      this.deps = this.depsTail = void 0, Dc(this), this.onStop && this.onStop(), this.flags &= -2;
    }
  }
  trigger() {
    this.flags & 64 ? rr.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
  }
  /**
   * @internal
   */
  runIfDirty() {
    Ro(this) && this.run();
  }
  get dirty() {
    return Ro(this);
  }
}
let ja = 0, $n, zn;
function Ga(e, t = !1) {
  if (e.flags |= 8, t) {
    e.next = zn, zn = e;
    return;
  }
  e.next = $n, $n = e;
}
function jo() {
  ja++;
}
function Go() {
  if (--ja > 0)
    return;
  if (zn) {
    let t = zn;
    for (zn = void 0; t; ) {
      const n = t.next;
      t.next = void 0, t.flags &= -9, t = n;
    }
  }
  let e;
  for (; $n; ) {
    let t = $n;
    for ($n = void 0; t; ) {
      const n = t.next;
      if (t.next = void 0, t.flags &= -9, t.flags & 1)
        try {
          t.trigger();
        } catch (s) {
          e || (e = s);
        }
      t = n;
    }
  }
  if (e) throw e;
}
function Ka(e) {
  for (let t = e.deps; t; t = t.nextDep)
    t.version = -1, t.prevActiveLink = t.dep.activeLink, t.dep.activeLink = t;
}
function Za(e) {
  let t, n = e.depsTail, s = n;
  for (; s; ) {
    const r = s.prevDep;
    s.version === -1 ? (s === n && (n = r), Ko(s), uf(s)) : t = s, s.dep.activeLink = s.prevActiveLink, s.prevActiveLink = void 0, s = r;
  }
  e.deps = t, e.depsTail = n;
}
function Ro(e) {
  for (let t = e.deps; t; t = t.nextDep)
    if (t.dep.version !== t.version || t.dep.computed && (Wa(t.dep.computed) || t.dep.version !== t.version))
      return !0;
  return !!e._dirty;
}
function Wa(e) {
  if (e.flags & 4 && !(e.flags & 16) || (e.flags &= -17, e.globalVersion === Vn))
    return;
  e.globalVersion = Vn;
  const t = e.dep;
  if (e.flags |= 2, t.version > 0 && !e.isSSR && e.deps && !Ro(e)) {
    e.flags &= -3;
    return;
  }
  const n = Re, s = bt;
  Re = e, bt = !0;
  try {
    Ka(e);
    const r = e.fn(e._value);
    (t.version === 0 || Gt(r, e._value)) && (e._value = r, t.version++);
  } catch (r) {
    throw t.version++, r;
  } finally {
    Re = n, bt = s, Za(e), e.flags &= -3;
  }
}
function Ko(e, t = !1) {
  const { dep: n, prevSub: s, nextSub: r } = e;
  if (s && (s.nextSub = r, e.prevSub = void 0), r && (r.prevSub = s, e.nextSub = void 0), n.subs === e && (n.subs = s, !s && n.computed)) {
    n.computed.flags &= -5;
    for (let o = n.computed.deps; o; o = o.nextDep)
      Ko(o, !0);
  }
  !t && !--n.sc && n.map && n.map.delete(n.key);
}
function uf(e) {
  const { prevDep: t, nextDep: n } = e;
  t && (t.nextDep = n, e.prevDep = void 0), n && (n.prevDep = t, e.nextDep = void 0);
}
let bt = !0;
const Ja = [];
function Jt() {
  Ja.push(bt), bt = !1;
}
function Yt() {
  const e = Ja.pop();
  bt = e === void 0 ? !0 : e;
}
function Dc(e) {
  const { cleanup: t } = e;
  if (e.cleanup = void 0, t) {
    const n = Re;
    Re = void 0;
    try {
      t();
    } finally {
      Re = n;
    }
  }
}
let Vn = 0;
class ff {
  constructor(t, n) {
    this.sub = t, this.dep = n, this.version = n.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
  }
}
class Zo {
  constructor(t) {
    this.computed = t, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0;
  }
  track(t) {
    if (!Re || !bt || Re === this.computed)
      return;
    let n = this.activeLink;
    if (n === void 0 || n.sub !== Re)
      n = this.activeLink = new ff(Re, this), Re.deps ? (n.prevDep = Re.depsTail, Re.depsTail.nextDep = n, Re.depsTail = n) : Re.deps = Re.depsTail = n, Ya(n);
    else if (n.version === -1 && (n.version = this.version, n.nextDep)) {
      const s = n.nextDep;
      s.prevDep = n.prevDep, n.prevDep && (n.prevDep.nextDep = s), n.prevDep = Re.depsTail, n.nextDep = void 0, Re.depsTail.nextDep = n, Re.depsTail = n, Re.deps === n && (Re.deps = s);
    }
    return n;
  }
  trigger(t) {
    this.version++, Vn++, this.notify(t);
  }
  notify(t) {
    jo();
    try {
      for (let n = this.subs; n; n = n.prevSub)
        n.sub.notify() && n.sub.dep.notify();
    } finally {
      Go();
    }
  }
}
function Ya(e) {
  if (e.dep.sc++, e.sub.flags & 4) {
    const t = e.dep.computed;
    if (t && !e.dep.subs) {
      t.flags |= 20;
      for (let s = t.deps; s; s = s.nextDep)
        Ya(s);
    }
    const n = e.dep.subs;
    n !== e && (e.prevSub = n, n && (n.nextSub = e)), e.dep.subs = e;
  }
}
const xs = /* @__PURE__ */ new WeakMap(), un = Symbol(
  ""
), Do = Symbol(
  ""
), jn = Symbol(
  ""
);
function Ze(e, t, n) {
  if (bt && Re) {
    let s = xs.get(e);
    s || xs.set(e, s = /* @__PURE__ */ new Map());
    let r = s.get(n);
    r || (s.set(n, r = new Zo()), r.map = s, r.key = n), r.track();
  }
}
function Ot(e, t, n, s, r, o) {
  const c = xs.get(e);
  if (!c) {
    Vn++;
    return;
  }
  const i = (a) => {
    a && a.trigger();
  };
  if (jo(), t === "clear")
    c.forEach(i);
  else {
    const a = oe(e), l = a && Vo(n);
    if (a && n === "length") {
      const u = Number(s);
      c.forEach((f, d) => {
        (d === "length" || d === jn || !qt(d) && d >= u) && i(f);
      });
    } else
      switch ((n !== void 0 || c.has(void 0)) && i(c.get(n)), l && i(c.get(jn)), t) {
        case "add":
          a ? l && i(c.get("length")) : (i(c.get(un)), yn(e) && i(c.get(Do)));
          break;
        case "delete":
          a || (i(c.get(un)), yn(e) && i(c.get(Do)));
          break;
        case "set":
          yn(e) && i(c.get(un));
          break;
      }
  }
  Go();
}
function hf(e, t) {
  const n = xs.get(e);
  return n && n.get(t);
}
function gn(e) {
  const t = be(e);
  return t === e ? t : (Ze(t, "iterate", jn), pt(e) ? t : t.map(We));
}
function Fs(e) {
  return Ze(e = be(e), "iterate", jn), e;
}
const df = {
  __proto__: null,
  [Symbol.iterator]() {
    return or(this, Symbol.iterator, We);
  },
  concat(...e) {
    return gn(this).concat(
      ...e.map((t) => oe(t) ? gn(t) : t)
    );
  },
  entries() {
    return or(this, "entries", (e) => (e[1] = We(e[1]), e));
  },
  every(e, t) {
    return Mt(this, "every", e, t, void 0, arguments);
  },
  filter(e, t) {
    return Mt(this, "filter", e, t, (n) => n.map(We), arguments);
  },
  find(e, t) {
    return Mt(this, "find", e, t, We, arguments);
  },
  findIndex(e, t) {
    return Mt(this, "findIndex", e, t, void 0, arguments);
  },
  findLast(e, t) {
    return Mt(this, "findLast", e, t, We, arguments);
  },
  findLastIndex(e, t) {
    return Mt(this, "findLastIndex", e, t, void 0, arguments);
  },
  // flat, flatMap could benefit from ARRAY_ITERATE but are not straight-forward to implement
  forEach(e, t) {
    return Mt(this, "forEach", e, t, void 0, arguments);
  },
  includes(...e) {
    return cr(this, "includes", e);
  },
  indexOf(...e) {
    return cr(this, "indexOf", e);
  },
  join(e) {
    return gn(this).join(e);
  },
  // keys() iterator only reads `length`, no optimisation required
  lastIndexOf(...e) {
    return cr(this, "lastIndexOf", e);
  },
  map(e, t) {
    return Mt(this, "map", e, t, void 0, arguments);
  },
  pop() {
    return In(this, "pop");
  },
  push(...e) {
    return In(this, "push", e);
  },
  reduce(e, ...t) {
    return Mc(this, "reduce", e, t);
  },
  reduceRight(e, ...t) {
    return Mc(this, "reduceRight", e, t);
  },
  shift() {
    return In(this, "shift");
  },
  // slice could use ARRAY_ITERATE but also seems to beg for range tracking
  some(e, t) {
    return Mt(this, "some", e, t, void 0, arguments);
  },
  splice(...e) {
    return In(this, "splice", e);
  },
  toReversed() {
    return gn(this).toReversed();
  },
  toSorted(e) {
    return gn(this).toSorted(e);
  },
  toSpliced(...e) {
    return gn(this).toSpliced(...e);
  },
  unshift(...e) {
    return In(this, "unshift", e);
  },
  values() {
    return or(this, "values", We);
  }
};
function or(e, t, n) {
  const s = Fs(e), r = s[t]();
  return s !== e && !pt(e) && (r._next = r.next, r.next = () => {
    const o = r._next();
    return o.value && (o.value = n(o.value)), o;
  }), r;
}
const pf = Array.prototype;
function Mt(e, t, n, s, r, o) {
  const c = Fs(e), i = c !== e && !pt(e), a = c[t];
  if (a !== pf[t]) {
    const f = a.apply(e, o);
    return i ? We(f) : f;
  }
  let l = n;
  c !== e && (i ? l = function(f, d) {
    return n.call(this, We(f), d, e);
  } : n.length > 2 && (l = function(f, d) {
    return n.call(this, f, d, e);
  }));
  const u = a.call(c, l, s);
  return i && r ? r(u) : u;
}
function Mc(e, t, n, s) {
  const r = Fs(e);
  let o = n;
  return r !== e && (pt(e) ? n.length > 3 && (o = function(c, i, a) {
    return n.call(this, c, i, a, e);
  }) : o = function(c, i, a) {
    return n.call(this, c, We(i), a, e);
  }), r[t](o, ...s);
}
function cr(e, t, n) {
  const s = be(e);
  Ze(s, "iterate", jn);
  const r = s[t](...n);
  return (r === -1 || r === !1) && Qo(n[0]) ? (n[0] = be(n[0]), s[t](...n)) : r;
}
function In(e, t, n = []) {
  Jt(), jo();
  const s = be(e)[t].apply(e, n);
  return Go(), Yt(), s;
}
const gf = /* @__PURE__ */ zo("__proto__,__v_isRef,__isVue"), Xa = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((e) => e !== "arguments" && e !== "caller").map((e) => Symbol[e]).filter(qt)
);
function _f(e) {
  qt(e) || (e = String(e));
  const t = be(this);
  return Ze(t, "has", e), t.hasOwnProperty(e);
}
class Qa {
  constructor(t = !1, n = !1) {
    this._isReadonly = t, this._isShallow = n;
  }
  get(t, n, s) {
    if (n === "__v_skip") return t.__v_skip;
    const r = this._isReadonly, o = this._isShallow;
    if (n === "__v_isReactive")
      return !r;
    if (n === "__v_isReadonly")
      return r;
    if (n === "__v_isShallow")
      return o;
    if (n === "__v_raw")
      return s === (r ? o ? wf : sl : o ? nl : tl).get(t) || // receiver is not the reactive proxy, but has the same prototype
      // this means the receiver is a user proxy of the reactive proxy
      Object.getPrototypeOf(t) === Object.getPrototypeOf(s) ? t : void 0;
    const c = oe(t);
    if (!r) {
      let a;
      if (c && (a = df[n]))
        return a;
      if (n === "hasOwnProperty")
        return _f;
    }
    const i = Reflect.get(
      t,
      n,
      // if this is a proxy wrapping a ref, return methods using the raw ref
      // as receiver so that we don't have to call `toRaw` on the ref in all
      // its class methods
      $e(t) ? t : s
    );
    return (qt(n) ? Xa.has(n) : gf(n)) || (r || Ze(t, "get", n), o) ? i : $e(i) ? c && Vo(n) ? i : i.value : Me(i) ? r ? Yo(i) : Jo(i) : i;
  }
}
class el extends Qa {
  constructor(t = !1) {
    super(!1, t);
  }
  set(t, n, s, r) {
    let o = t[n];
    if (!this._isShallow) {
      const a = hn(o);
      if (!pt(s) && !hn(s) && (o = be(o), s = be(s)), !oe(t) && $e(o) && !$e(s))
        return a ? !1 : (o.value = s, !0);
    }
    const c = oe(t) && Vo(n) ? Number(n) < t.length : ye(t, n), i = Reflect.set(
      t,
      n,
      s,
      $e(t) ? t : r
    );
    return t === be(r) && (c ? Gt(s, o) && Ot(t, "set", n, s) : Ot(t, "add", n, s)), i;
  }
  deleteProperty(t, n) {
    const s = ye(t, n);
    t[n];
    const r = Reflect.deleteProperty(t, n);
    return r && s && Ot(t, "delete", n, void 0), r;
  }
  has(t, n) {
    const s = Reflect.has(t, n);
    return (!qt(n) || !Xa.has(n)) && Ze(t, "has", n), s;
  }
  ownKeys(t) {
    return Ze(
      t,
      "iterate",
      oe(t) ? "length" : un
    ), Reflect.ownKeys(t);
  }
}
class mf extends Qa {
  constructor(t = !1) {
    super(!0, t);
  }
  set(t, n) {
    return !0;
  }
  deleteProperty(t, n) {
    return !0;
  }
}
const bf = /* @__PURE__ */ new el(), vf = /* @__PURE__ */ new mf(), yf = /* @__PURE__ */ new el(!0);
const Mo = (e) => e, ls = (e) => Reflect.getPrototypeOf(e);
function xf(e, t, n) {
  return function(...s) {
    const r = this.__v_raw, o = be(r), c = yn(o), i = e === "entries" || e === Symbol.iterator && c, a = e === "keys" && c, l = r[e](...s), u = n ? Mo : t ? Io : We;
    return !t && Ze(
      o,
      "iterate",
      a ? Do : un
    ), {
      // iterator protocol
      next() {
        const { value: f, done: d } = l.next();
        return d ? { value: f, done: d } : {
          value: i ? [u(f[0]), u(f[1])] : u(f),
          done: d
        };
      },
      // iterable protocol
      [Symbol.iterator]() {
        return this;
      }
    };
  };
}
function us(e) {
  return function(...t) {
    return e === "delete" ? !1 : e === "clear" ? void 0 : this;
  };
}
function kf(e, t) {
  const n = {
    get(r) {
      const o = this.__v_raw, c = be(o), i = be(r);
      e || (Gt(r, i) && Ze(c, "get", r), Ze(c, "get", i));
      const { has: a } = ls(c), l = t ? Mo : e ? Io : We;
      if (a.call(c, r))
        return l(o.get(r));
      if (a.call(c, i))
        return l(o.get(i));
      o !== c && o.get(r);
    },
    get size() {
      const r = this.__v_raw;
      return !e && Ze(be(r), "iterate", un), Reflect.get(r, "size", r);
    },
    has(r) {
      const o = this.__v_raw, c = be(o), i = be(r);
      return e || (Gt(r, i) && Ze(c, "has", r), Ze(c, "has", i)), r === i ? o.has(r) : o.has(r) || o.has(i);
    },
    forEach(r, o) {
      const c = this, i = c.__v_raw, a = be(i), l = t ? Mo : e ? Io : We;
      return !e && Ze(a, "iterate", un), i.forEach((u, f) => r.call(o, l(u), l(f), c));
    }
  };
  return ze(
    n,
    e ? {
      add: us("add"),
      set: us("set"),
      delete: us("delete"),
      clear: us("clear")
    } : {
      add(r) {
        !t && !pt(r) && !hn(r) && (r = be(r));
        const o = be(this);
        return ls(o).has.call(o, r) || (o.add(r), Ot(o, "add", r, r)), this;
      },
      set(r, o) {
        !t && !pt(o) && !hn(o) && (o = be(o));
        const c = be(this), { has: i, get: a } = ls(c);
        let l = i.call(c, r);
        l || (r = be(r), l = i.call(c, r));
        const u = a.call(c, r);
        return c.set(r, o), l ? Gt(o, u) && Ot(c, "set", r, o) : Ot(c, "add", r, o), this;
      },
      delete(r) {
        const o = be(this), { has: c, get: i } = ls(o);
        let a = c.call(o, r);
        a || (r = be(r), a = c.call(o, r)), i && i.call(o, r);
        const l = o.delete(r);
        return a && Ot(o, "delete", r, void 0), l;
      },
      clear() {
        const r = be(this), o = r.size !== 0, c = r.clear();
        return o && Ot(
          r,
          "clear",
          void 0,
          void 0
        ), c;
      }
    }
  ), [
    "keys",
    "values",
    "entries",
    Symbol.iterator
  ].forEach((r) => {
    n[r] = xf(r, e, t);
  }), n;
}
function Wo(e, t) {
  const n = kf(e, t);
  return (s, r, o) => r === "__v_isReactive" ? !e : r === "__v_isReadonly" ? e : r === "__v_raw" ? s : Reflect.get(
    ye(n, r) && r in s ? n : s,
    r,
    o
  );
}
const Ef = {
  get: /* @__PURE__ */ Wo(!1, !1)
}, Cf = {
  get: /* @__PURE__ */ Wo(!1, !0)
}, Af = {
  get: /* @__PURE__ */ Wo(!0, !1)
};
const tl = /* @__PURE__ */ new WeakMap(), nl = /* @__PURE__ */ new WeakMap(), sl = /* @__PURE__ */ new WeakMap(), wf = /* @__PURE__ */ new WeakMap();
function Sf(e) {
  switch (e) {
    case "Object":
    case "Array":
      return 1;
    case "Map":
    case "Set":
    case "WeakMap":
    case "WeakSet":
      return 2;
    default:
      return 0;
  }
}
function Tf(e) {
  return e.__v_skip || !Object.isExtensible(e) ? 0 : Sf(Yu(e));
}
function Jo(e) {
  return hn(e) ? e : Xo(
    e,
    !1,
    bf,
    Ef,
    tl
  );
}
function Rf(e) {
  return Xo(
    e,
    !1,
    yf,
    Cf,
    nl
  );
}
function Yo(e) {
  return Xo(
    e,
    !0,
    vf,
    Af,
    sl
  );
}
function Xo(e, t, n, s, r) {
  if (!Me(e) || e.__v_raw && !(t && e.__v_isReactive))
    return e;
  const o = r.get(e);
  if (o)
    return o;
  const c = Tf(e);
  if (c === 0)
    return e;
  const i = new Proxy(
    e,
    c === 2 ? s : n
  );
  return r.set(e, i), i;
}
function xn(e) {
  return hn(e) ? xn(e.__v_raw) : !!(e && e.__v_isReactive);
}
function hn(e) {
  return !!(e && e.__v_isReadonly);
}
function pt(e) {
  return !!(e && e.__v_isShallow);
}
function Qo(e) {
  return e ? !!e.__v_raw : !1;
}
function be(e) {
  const t = e && e.__v_raw;
  return t ? be(t) : e;
}
function Df(e) {
  return !ye(e, "__v_skip") && Object.isExtensible(e) && Ba(e, "__v_skip", !0), e;
}
const We = (e) => Me(e) ? Jo(e) : e, Io = (e) => Me(e) ? Yo(e) : e;
function $e(e) {
  return e ? e.__v_isRef === !0 : !1;
}
function Je(e) {
  return Mf(e, !1);
}
function Mf(e, t) {
  return $e(e) ? e : new If(e, t);
}
class If {
  constructor(t, n) {
    this.dep = new Zo(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = n ? t : be(t), this._value = n ? t : We(t), this.__v_isShallow = n;
  }
  get value() {
    return this.dep.track(), this._value;
  }
  set value(t) {
    const n = this._rawValue, s = this.__v_isShallow || pt(t) || hn(t);
    t = s ? t : be(t), Gt(t, n) && (this._rawValue = t, this._value = s ? t : We(t), this.dep.trigger());
  }
}
function de(e) {
  return $e(e) ? e.value : e;
}
const Nf = {
  get: (e, t, n) => t === "__v_raw" ? e : de(Reflect.get(e, t, n)),
  set: (e, t, n, s) => {
    const r = e[t];
    return $e(r) && !$e(n) ? (r.value = n, !0) : Reflect.set(e, t, n, s);
  }
};
function rl(e) {
  return xn(e) ? e : new Proxy(e, Nf);
}
function Lf(e) {
  const t = oe(e) ? new Array(e.length) : {};
  for (const n in e)
    t[n] = Ff(e, n);
  return t;
}
class Of {
  constructor(t, n, s) {
    this._object = t, this._key = n, this._defaultValue = s, this.__v_isRef = !0, this._value = void 0;
  }
  get value() {
    const t = this._object[this._key];
    return this._value = t === void 0 ? this._defaultValue : t;
  }
  set value(t) {
    this._object[this._key] = t;
  }
  get dep() {
    return hf(be(this._object), this._key);
  }
}
function Ff(e, t, n) {
  const s = e[t];
  return $e(s) ? s : new Of(e, t, n);
}
class qf {
  constructor(t, n, s) {
    this.fn = t, this.setter = n, this._value = void 0, this.dep = new Zo(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = Vn - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !n, this.isSSR = s;
  }
  /**
   * @internal
   */
  notify() {
    if (this.flags |= 16, !(this.flags & 8) && // avoid infinite self recursion
    Re !== this)
      return Ga(this, !0), !0;
  }
  get value() {
    const t = this.dep.track();
    return Wa(this), t && (t.version = this.dep.version), this._value;
  }
  set value(t) {
    this.setter && this.setter(t);
  }
}
function Pf(e, t, n = !1) {
  let s, r;
  return le(e) ? s = e : (s = e.get, r = e.set), new qf(s, r, n);
}
const fs = {}, ks = /* @__PURE__ */ new WeakMap();
let an;
function Bf(e, t = !1, n = an) {
  if (n) {
    let s = ks.get(n);
    s || ks.set(n, s = []), s.push(e);
  }
}
function $f(e, t, n = we) {
  const { immediate: s, deep: r, once: o, scheduler: c, augmentJob: i, call: a } = n, l = (p) => r ? p : pt(p) || r === !1 || r === 0 ? Ft(p, 1) : Ft(p);
  let u, f, d, h, m = !1, x = !1;
  if ($e(e) ? (f = () => e.value, m = pt(e)) : xn(e) ? (f = () => l(e), m = !0) : oe(e) ? (x = !0, m = e.some((p) => xn(p) || pt(p)), f = () => e.map((p) => {
    if ($e(p))
      return p.value;
    if (xn(p))
      return l(p);
    if (le(p))
      return a ? a(p, 2) : p();
  })) : le(e) ? t ? f = a ? () => a(e, 2) : e : f = () => {
    if (d) {
      Jt();
      try {
        d();
      } finally {
        Yt();
      }
    }
    const p = an;
    an = u;
    try {
      return a ? a(e, 3, [h]) : e(h);
    } finally {
      an = p;
    }
  } : f = Tt, t && r) {
    const p = f, E = r === !0 ? 1 / 0 : r;
    f = () => Ft(p(), E);
  }
  const A = Ha(), v = () => {
    u.stop(), A && A.active && Ho(A.effects, u);
  };
  if (o && t) {
    const p = t;
    t = (...E) => {
      p(...E), v();
    };
  }
  let k = x ? new Array(e.length).fill(fs) : fs;
  const b = (p) => {
    if (!(!(u.flags & 1) || !u.dirty && !p))
      if (t) {
        const E = u.run();
        if (r || m || (x ? E.some((C, z) => Gt(C, k[z])) : Gt(E, k))) {
          d && d();
          const C = an;
          an = u;
          try {
            const z = [
              E,
              // pass undefined as the old value when it's changed for the first time
              k === fs ? void 0 : x && k[0] === fs ? [] : k,
              h
            ];
            a ? a(t, 3, z) : (
              // @ts-expect-error
              t(...z)
            ), k = E;
          } finally {
            an = C;
          }
        }
      } else
        u.run();
  };
  return i && i(b), u = new Va(f), u.scheduler = c ? () => c(b, !1) : b, h = (p) => Bf(p, !1, u), d = u.onStop = () => {
    const p = ks.get(u);
    if (p) {
      if (a)
        a(p, 4);
      else
        for (const E of p) E();
      ks.delete(u);
    }
  }, t ? s ? b(!0) : k = u.run() : c ? c(b.bind(null, !0), !0) : u.run(), v.pause = u.pause.bind(u), v.resume = u.resume.bind(u), v.stop = v, v;
}
function Ft(e, t = 1 / 0, n) {
  if (t <= 0 || !Me(e) || e.__v_skip || (n = n || /* @__PURE__ */ new Set(), n.has(e)))
    return e;
  if (n.add(e), t--, $e(e))
    Ft(e.value, t, n);
  else if (oe(e))
    for (let s = 0; s < e.length; s++)
      Ft(e[s], t, n);
  else if (Oa(e) || yn(e))
    e.forEach((s) => {
      Ft(s, t, n);
    });
  else if (Pa(e)) {
    for (const s in e)
      Ft(e[s], t, n);
    for (const s of Object.getOwnPropertySymbols(e))
      Object.prototype.propertyIsEnumerable.call(e, s) && Ft(e[s], t, n);
  }
  return e;
}
/**
* @vue/runtime-core v3.5.13
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
function es(e, t, n, s) {
  try {
    return s ? e(...s) : e();
  } catch (r) {
    qs(r, t, n);
  }
}
function vt(e, t, n, s) {
  if (le(e)) {
    const r = es(e, t, n, s);
    return r && Fa(r) && r.catch((o) => {
      qs(o, t, n);
    }), r;
  }
  if (oe(e)) {
    const r = [];
    for (let o = 0; o < e.length; o++)
      r.push(vt(e[o], t, n, s));
    return r;
  }
}
function qs(e, t, n, s = !0) {
  const r = t ? t.vnode : null, { errorHandler: o, throwUnhandledErrorInProduction: c } = t && t.appContext.config || we;
  if (t) {
    let i = t.parent;
    const a = t.proxy, l = `https://vuejs.org/error-reference/#runtime-${n}`;
    for (; i; ) {
      const u = i.ec;
      if (u) {
        for (let f = 0; f < u.length; f++)
          if (u[f](e, a, l) === !1)
            return;
      }
      i = i.parent;
    }
    if (o) {
      Jt(), es(o, null, 10, [
        e,
        a,
        l
      ]), Yt();
      return;
    }
  }
  zf(e, n, r, s, c);
}
function zf(e, t, n, s = !0, r = !1) {
  if (r)
    throw e;
  console.error(e);
}
const tt = [];
let Ct = -1;
const kn = [];
let Ut = null, mn = 0;
const ol = /* @__PURE__ */ Promise.resolve();
let Es = null;
function Sn(e) {
  const t = Es || ol;
  return e ? t.then(this ? e.bind(this) : e) : t;
}
function Uf(e) {
  let t = Ct + 1, n = tt.length;
  for (; t < n; ) {
    const s = t + n >>> 1, r = tt[s], o = Gn(r);
    o < e || o === e && r.flags & 2 ? t = s + 1 : n = s;
  }
  return t;
}
function ec(e) {
  if (!(e.flags & 1)) {
    const t = Gn(e), n = tt[tt.length - 1];
    !n || // fast path when the job id is larger than the tail
    !(e.flags & 2) && t >= Gn(n) ? tt.push(e) : tt.splice(Uf(t), 0, e), e.flags |= 1, cl();
  }
}
function cl() {
  Es || (Es = ol.then(al));
}
function Hf(e) {
  oe(e) ? kn.push(...e) : Ut && e.id === -1 ? Ut.splice(mn + 1, 0, e) : e.flags & 1 || (kn.push(e), e.flags |= 1), cl();
}
function Ic(e, t, n = Ct + 1) {
  for (; n < tt.length; n++) {
    const s = tt[n];
    if (s && s.flags & 2) {
      if (e && s.id !== e.uid)
        continue;
      tt.splice(n, 1), n--, s.flags & 4 && (s.flags &= -2), s(), s.flags & 4 || (s.flags &= -2);
    }
  }
}
function il(e) {
  if (kn.length) {
    const t = [...new Set(kn)].sort(
      (n, s) => Gn(n) - Gn(s)
    );
    if (kn.length = 0, Ut) {
      Ut.push(...t);
      return;
    }
    for (Ut = t, mn = 0; mn < Ut.length; mn++) {
      const n = Ut[mn];
      n.flags & 4 && (n.flags &= -2), n.flags & 8 || n(), n.flags &= -2;
    }
    Ut = null, mn = 0;
  }
}
const Gn = (e) => e.id == null ? e.flags & 2 ? -1 : 1 / 0 : e.id;
function al(e) {
  try {
    for (Ct = 0; Ct < tt.length; Ct++) {
      const t = tt[Ct];
      t && !(t.flags & 8) && (t.flags & 4 && (t.flags &= -2), es(
        t,
        t.i,
        t.i ? 15 : 14
      ), t.flags & 4 || (t.flags &= -2));
    }
  } finally {
    for (; Ct < tt.length; Ct++) {
      const t = tt[Ct];
      t && (t.flags &= -2);
    }
    Ct = -1, tt.length = 0, il(), Es = null, (tt.length || kn.length) && al();
  }
}
let Be = null, ll = null;
function Cs(e) {
  const t = Be;
  return Be = e, ll = e && e.type.__scopeId || null, t;
}
function Rt(e, t = Be, n) {
  if (!t || e._n)
    return e;
  const s = (...r) => {
    s._d && Vc(-1);
    const o = Cs(t);
    let c;
    try {
      c = e(...r);
    } finally {
      Cs(o), s._d && Vc(1);
    }
    return c;
  };
  return s._n = !0, s._c = !0, s._d = !0, s;
}
function ul(e, t) {
  if (Be === null)
    return e;
  const n = Hs(Be), s = e.dirs || (e.dirs = []);
  for (let r = 0; r < t.length; r++) {
    let [o, c, i, a = we] = t[r];
    o && (le(o) && (o = {
      mounted: o,
      updated: o
    }), o.deep && Ft(c), s.push({
      dir: o,
      instance: n,
      value: c,
      oldValue: void 0,
      arg: i,
      modifiers: a
    }));
  }
  return e;
}
function nn(e, t, n, s) {
  const r = e.dirs, o = t && t.dirs;
  for (let c = 0; c < r.length; c++) {
    const i = r[c];
    o && (i.oldValue = o[c].value);
    let a = i.dir[s];
    a && (Jt(), vt(a, n, 8, [
      e.el,
      i,
      e,
      t
    ]), Yt());
  }
}
const Vf = Symbol("_vte"), fl = (e) => e.__isTeleport, Ht = Symbol("_leaveCb"), hs = Symbol("_enterCb");
function jf() {
  const e = {
    isMounted: !1,
    isLeaving: !1,
    isUnmounting: !1,
    leavingVNodes: /* @__PURE__ */ new Map()
  };
  return Xt(() => {
    e.isMounted = !0;
  }), tc(() => {
    e.isUnmounting = !0;
  }), e;
}
const dt = [Function, Array], hl = {
  mode: String,
  appear: Boolean,
  persisted: Boolean,
  // enter
  onBeforeEnter: dt,
  onEnter: dt,
  onAfterEnter: dt,
  onEnterCancelled: dt,
  // leave
  onBeforeLeave: dt,
  onLeave: dt,
  onAfterLeave: dt,
  onLeaveCancelled: dt,
  // appear
  onBeforeAppear: dt,
  onAppear: dt,
  onAfterAppear: dt,
  onAppearCancelled: dt
}, dl = (e) => {
  const t = e.subTree;
  return t.component ? dl(t.component) : t;
}, Gf = {
  name: "BaseTransition",
  props: hl,
  setup(e, { slots: t }) {
    const n = Bh(), s = jf();
    return () => {
      const r = t.default && _l(t.default(), !0);
      if (!r || !r.length)
        return;
      const o = pl(r), c = be(e), { mode: i } = c;
      if (s.isLeaving)
        return ir(o);
      const a = Nc(o);
      if (!a)
        return ir(o);
      let l = No(
        a,
        c,
        s,
        n,
        // #11061, ensure enterHooks is fresh after clone
        (f) => l = f
      );
      a.type !== st && Kn(a, l);
      let u = n.subTree && Nc(n.subTree);
      if (u && u.type !== st && !ln(a, u) && dl(n).type !== st) {
        let f = No(
          u,
          c,
          s,
          n
        );
        if (Kn(u, f), i === "out-in" && a.type !== st)
          return s.isLeaving = !0, f.afterLeave = () => {
            s.isLeaving = !1, n.job.flags & 8 || n.update(), delete f.afterLeave, u = void 0;
          }, ir(o);
        i === "in-out" && a.type !== st ? f.delayLeave = (d, h, m) => {
          const x = gl(
            s,
            u
          );
          x[String(u.key)] = u, d[Ht] = () => {
            h(), d[Ht] = void 0, delete l.delayedLeave, u = void 0;
          }, l.delayedLeave = () => {
            m(), delete l.delayedLeave, u = void 0;
          };
        } : u = void 0;
      } else u && (u = void 0);
      return o;
    };
  }
};
function pl(e) {
  let t = e[0];
  if (e.length > 1) {
    for (const n of e)
      if (n.type !== st) {
        t = n;
        break;
      }
  }
  return t;
}
const Kf = Gf;
function gl(e, t) {
  const { leavingVNodes: n } = e;
  let s = n.get(t.type);
  return s || (s = /* @__PURE__ */ Object.create(null), n.set(t.type, s)), s;
}
function No(e, t, n, s, r) {
  const {
    appear: o,
    mode: c,
    persisted: i = !1,
    onBeforeEnter: a,
    onEnter: l,
    onAfterEnter: u,
    onEnterCancelled: f,
    onBeforeLeave: d,
    onLeave: h,
    onAfterLeave: m,
    onLeaveCancelled: x,
    onBeforeAppear: A,
    onAppear: v,
    onAfterAppear: k,
    onAppearCancelled: b
  } = t, p = String(e.key), E = gl(n, e), C = (R, M) => {
    R && vt(
      R,
      s,
      9,
      M
    );
  }, z = (R, M) => {
    const q = M[1];
    C(R, M), oe(R) ? R.every((I) => I.length <= 1) && q() : R.length <= 1 && q();
  }, T = {
    mode: c,
    persisted: i,
    beforeEnter(R) {
      let M = a;
      if (!n.isMounted)
        if (o)
          M = A || a;
        else
          return;
      R[Ht] && R[Ht](
        !0
        /* cancelled */
      );
      const q = E[p];
      q && ln(e, q) && q.el[Ht] && q.el[Ht](), C(M, [R]);
    },
    enter(R) {
      let M = l, q = u, I = f;
      if (!n.isMounted)
        if (o)
          M = v || l, q = k || u, I = b || f;
        else
          return;
      let se = !1;
      const S = R[hs] = (B) => {
        se || (se = !0, B ? C(I, [R]) : C(q, [R]), T.delayedLeave && T.delayedLeave(), R[hs] = void 0);
      };
      M ? z(M, [R, S]) : S();
    },
    leave(R, M) {
      const q = String(e.key);
      if (R[hs] && R[hs](
        !0
        /* cancelled */
      ), n.isUnmounting)
        return M();
      C(d, [R]);
      let I = !1;
      const se = R[Ht] = (S) => {
        I || (I = !0, M(), S ? C(x, [R]) : C(m, [R]), R[Ht] = void 0, E[q] === e && delete E[q]);
      };
      E[q] = e, h ? z(h, [R, se]) : se();
    },
    clone(R) {
      const M = No(
        R,
        t,
        n,
        s,
        r
      );
      return r && r(M), M;
    }
  };
  return T;
}
function ir(e) {
  if (Ps(e))
    return e = Zt(e), e.children = null, e;
}
function Nc(e) {
  if (!Ps(e))
    return fl(e.type) && e.children ? pl(e.children) : e;
  const { shapeFlag: t, children: n } = e;
  if (n) {
    if (t & 16)
      return n[0];
    if (t & 32 && le(n.default))
      return n.default();
  }
}
function Kn(e, t) {
  e.shapeFlag & 6 && e.component ? (e.transition = t, Kn(e.component.subTree, t)) : e.shapeFlag & 128 ? (e.ssContent.transition = t.clone(e.ssContent), e.ssFallback.transition = t.clone(e.ssFallback)) : e.transition = t;
}
function _l(e, t = !1, n) {
  let s = [], r = 0;
  for (let o = 0; o < e.length; o++) {
    let c = e[o];
    const i = n == null ? c.key : String(n) + String(c.key != null ? c.key : o);
    c.type === Ve ? (c.patchFlag & 128 && r++, s = s.concat(
      _l(c.children, t, i)
    )) : (t || c.type !== st) && s.push(i != null ? Zt(c, { key: i }) : c);
  }
  if (r > 1)
    for (let o = 0; o < s.length; o++)
      s[o].patchFlag = -2;
  return s;
}
/*! #__NO_SIDE_EFFECTS__ */
// @__NO_SIDE_EFFECTS__
function _t(e, t) {
  return le(e) ? (
    // #8236: extend call and options.name access are considered side-effects
    // by Rollup, so we have to wrap it in a pure-annotated IIFE.
    ze({ name: e.name }, t, { setup: e })
  ) : e;
}
function ml(e) {
  e.ids = [e.ids[0] + e.ids[2]++ + "-", 0, 0];
}
function As(e, t, n, s, r = !1) {
  if (oe(e)) {
    e.forEach(
      (m, x) => As(
        m,
        t && (oe(t) ? t[x] : t),
        n,
        s,
        r
      )
    );
    return;
  }
  if (En(s) && !r) {
    s.shapeFlag & 512 && s.type.__asyncResolved && s.component.subTree.component && As(e, t, n, s.component.subTree);
    return;
  }
  const o = s.shapeFlag & 4 ? Hs(s.component) : s.el, c = r ? null : o, { i, r: a } = e, l = t && t.r, u = i.refs === we ? i.refs = {} : i.refs, f = i.setupState, d = be(f), h = f === we ? () => !1 : (m) => ye(d, m);
  if (l != null && l !== a && (Ie(l) ? (u[l] = null, h(l) && (f[l] = null)) : $e(l) && (l.value = null)), le(a))
    es(a, i, 12, [c, u]);
  else {
    const m = Ie(a), x = $e(a);
    if (m || x) {
      const A = () => {
        if (e.f) {
          const v = m ? h(a) ? f[a] : u[a] : a.value;
          r ? oe(v) && Ho(v, o) : oe(v) ? v.includes(o) || v.push(o) : m ? (u[a] = [o], h(a) && (f[a] = u[a])) : (a.value = [o], e.k && (u[e.k] = a.value));
        } else m ? (u[a] = c, h(a) && (f[a] = c)) : x && (a.value = c, e.k && (u[e.k] = c));
      };
      c ? (A.id = -1, it(A, n)) : A();
    }
  }
}
Os().requestIdleCallback;
Os().cancelIdleCallback;
const En = (e) => !!e.type.__asyncLoader, Ps = (e) => e.type.__isKeepAlive;
function Zf(e, t) {
  bl(e, "a", t);
}
function Wf(e, t) {
  bl(e, "da", t);
}
function bl(e, t, n = je) {
  const s = e.__wdc || (e.__wdc = () => {
    let r = n;
    for (; r; ) {
      if (r.isDeactivated)
        return;
      r = r.parent;
    }
    return e();
  });
  if (Bs(t, s, n), n) {
    let r = n.parent;
    for (; r && r.parent; )
      Ps(r.parent.vnode) && Jf(s, t, n, r), r = r.parent;
  }
}
function Jf(e, t, n, s) {
  const r = Bs(
    t,
    e,
    s,
    !0
    /* prepend */
  );
  nc(() => {
    Ho(s[t], r);
  }, n);
}
function Bs(e, t, n = je, s = !1) {
  if (n) {
    const r = n[e] || (n[e] = []), o = t.__weh || (t.__weh = (...c) => {
      Jt();
      const i = ts(n), a = vt(t, n, e, c);
      return i(), Yt(), a;
    });
    return s ? r.unshift(o) : r.push(o), o;
  }
}
const Pt = (e) => (t, n = je) => {
  (!Jn || e === "sp") && Bs(e, (...s) => t(...s), n);
}, Yf = Pt("bm"), Xt = Pt("m"), Xf = Pt(
  "bu"
), Qf = Pt("u"), tc = Pt(
  "bum"
), nc = Pt("um"), eh = Pt(
  "sp"
), th = Pt("rtg"), nh = Pt("rtc");
function sh(e, t = je) {
  Bs("ec", e, t);
}
const vl = "components";
function Lc(e, t) {
  return xl(vl, e, !0, t) || e;
}
const yl = Symbol.for("v-ndc");
function rh(e) {
  return Ie(e) ? xl(vl, e, !1) || e : e || yl;
}
function xl(e, t, n = !0, s = !1) {
  const r = Be || je;
  if (r) {
    const o = r.type;
    {
      const i = Vh(
        o,
        !1
      );
      if (i && (i === t || i === gt(t) || i === Ls(gt(t))))
        return o;
    }
    const c = (
      // local registration
      // check instance[type] first which is resolved for options API
      Oc(r[e] || o[e], t) || // global registration
      Oc(r.appContext[e], t)
    );
    return !c && s ? o : c;
  }
}
function Oc(e, t) {
  return e && (e[t] || e[gt(t)] || e[Ls(gt(t))]);
}
function ws(e, t, n, s) {
  let r;
  const o = n, c = oe(e);
  if (c || Ie(e)) {
    const i = c && xn(e);
    let a = !1;
    i && (a = !pt(e), e = Fs(e)), r = new Array(e.length);
    for (let l = 0, u = e.length; l < u; l++)
      r[l] = t(
        a ? We(e[l]) : e[l],
        l,
        void 0,
        o
      );
  } else if (typeof e == "number") {
    r = new Array(e);
    for (let i = 0; i < e; i++)
      r[i] = t(i + 1, i, void 0, o);
  } else if (Me(e))
    if (e[Symbol.iterator])
      r = Array.from(
        e,
        (i, a) => t(i, a, void 0, o)
      );
    else {
      const i = Object.keys(e);
      r = new Array(i.length);
      for (let a = 0, l = i.length; a < l; a++) {
        const u = i[a];
        r[a] = t(e[u], u, a, o);
      }
    }
  else
    r = [];
  return r;
}
function Kt(e, t, n = {}, s, r) {
  if (Be.ce || Be.parent && En(Be.parent) && Be.parent.ce)
    return t !== "default" && (n.name = t), Q(), Fe(
      Ve,
      null,
      [Se("slot", n, s && s())],
      64
    );
  let o = e[t];
  o && o._c && (o._d = !1), Q();
  const c = o && kl(o(n)), i = n.key || // slot content array of a dynamic conditional slot may have a branch
  // key attached in the `createSlots` helper, respect that
  c && c.key, a = Fe(
    Ve,
    {
      key: (i && !qt(i) ? i : `_${t}`) + // #7256 force differentiate fallback content from actual content
      (!c && s ? "_fb" : "")
    },
    c || (s ? s() : []),
    c && e._ === 1 ? 64 : -2
  );
  return !r && a.scopeId && (a.slotScopeIds = [a.scopeId + "-s"]), o && o._c && (o._d = !0), a;
}
function kl(e) {
  return e.some((t) => Wn(t) ? !(t.type === st || t.type === Ve && !kl(t.children)) : !0) ? e : null;
}
const Lo = (e) => e ? Vl(e) ? Hs(e) : Lo(e.parent) : null, Un = (
  // Move PURE marker to new line to workaround compiler discarding it
  // due to type annotation
  /* @__PURE__ */ ze(/* @__PURE__ */ Object.create(null), {
    $: (e) => e,
    $el: (e) => e.vnode.el,
    $data: (e) => e.data,
    $props: (e) => e.props,
    $attrs: (e) => e.attrs,
    $slots: (e) => e.slots,
    $refs: (e) => e.refs,
    $parent: (e) => Lo(e.parent),
    $root: (e) => Lo(e.root),
    $host: (e) => e.ce,
    $emit: (e) => e.emit,
    $options: (e) => Cl(e),
    $forceUpdate: (e) => e.f || (e.f = () => {
      ec(e.update);
    }),
    $nextTick: (e) => e.n || (e.n = Sn.bind(e.proxy)),
    $watch: (e) => wh.bind(e)
  })
), ar = (e, t) => e !== we && !e.__isScriptSetup && ye(e, t), oh = {
  get({ _: e }, t) {
    if (t === "__v_skip")
      return !0;
    const { ctx: n, setupState: s, data: r, props: o, accessCache: c, type: i, appContext: a } = e;
    let l;
    if (t[0] !== "$") {
      const h = c[t];
      if (h !== void 0)
        switch (h) {
          case 1:
            return s[t];
          case 2:
            return r[t];
          case 4:
            return n[t];
          case 3:
            return o[t];
        }
      else {
        if (ar(s, t))
          return c[t] = 1, s[t];
        if (r !== we && ye(r, t))
          return c[t] = 2, r[t];
        if (
          // only cache other properties when instance has declared (thus stable)
          // props
          (l = e.propsOptions[0]) && ye(l, t)
        )
          return c[t] = 3, o[t];
        if (n !== we && ye(n, t))
          return c[t] = 4, n[t];
        Oo && (c[t] = 0);
      }
    }
    const u = Un[t];
    let f, d;
    if (u)
      return t === "$attrs" && Ze(e.attrs, "get", ""), u(e);
    if (
      // css module (injected by vue-loader)
      (f = i.__cssModules) && (f = f[t])
    )
      return f;
    if (n !== we && ye(n, t))
      return c[t] = 4, n[t];
    if (
      // global properties
      d = a.config.globalProperties, ye(d, t)
    )
      return d[t];
  },
  set({ _: e }, t, n) {
    const { data: s, setupState: r, ctx: o } = e;
    return ar(r, t) ? (r[t] = n, !0) : s !== we && ye(s, t) ? (s[t] = n, !0) : ye(e.props, t) || t[0] === "$" && t.slice(1) in e ? !1 : (o[t] = n, !0);
  },
  has({
    _: { data: e, setupState: t, accessCache: n, ctx: s, appContext: r, propsOptions: o }
  }, c) {
    let i;
    return !!n[c] || e !== we && ye(e, c) || ar(t, c) || (i = o[0]) && ye(i, c) || ye(s, c) || ye(Un, c) || ye(r.config.globalProperties, c);
  },
  defineProperty(e, t, n) {
    return n.get != null ? e._.accessCache[t] = 0 : ye(n, "value") && this.set(e, t, n.value, null), Reflect.defineProperty(e, t, n);
  }
};
function Fc(e) {
  return oe(e) ? e.reduce(
    (t, n) => (t[n] = null, t),
    {}
  ) : e;
}
let Oo = !0;
function ch(e) {
  const t = Cl(e), n = e.proxy, s = e.ctx;
  Oo = !1, t.beforeCreate && qc(t.beforeCreate, e, "bc");
  const {
    // state
    data: r,
    computed: o,
    methods: c,
    watch: i,
    provide: a,
    inject: l,
    // lifecycle
    created: u,
    beforeMount: f,
    mounted: d,
    beforeUpdate: h,
    updated: m,
    activated: x,
    deactivated: A,
    beforeDestroy: v,
    beforeUnmount: k,
    destroyed: b,
    unmounted: p,
    render: E,
    renderTracked: C,
    renderTriggered: z,
    errorCaptured: T,
    serverPrefetch: R,
    // public API
    expose: M,
    inheritAttrs: q,
    // assets
    components: I,
    directives: se,
    filters: S
  } = t;
  if (l && ih(l, s, null), c)
    for (const ee in c) {
      const Z = c[ee];
      le(Z) && (s[ee] = Z.bind(n));
    }
  if (r) {
    const ee = r.call(n, n);
    Me(ee) && (e.data = Jo(ee));
  }
  if (Oo = !0, o)
    for (const ee in o) {
      const Z = o[ee], fe = le(Z) ? Z.bind(n, n) : le(Z.get) ? Z.get.bind(n, n) : Tt, J = !le(Z) && le(Z.set) ? Z.set.bind(n) : Tt, Ce = nt({
        get: fe,
        set: J
      });
      Object.defineProperty(s, ee, {
        enumerable: !0,
        configurable: !0,
        get: () => Ce.value,
        set: (Ae) => Ce.value = Ae
      });
    }
  if (i)
    for (const ee in i)
      El(i[ee], s, n, ee);
  if (a) {
    const ee = le(a) ? a.call(n) : a;
    Reflect.ownKeys(ee).forEach((Z) => {
      dh(Z, ee[Z]);
    });
  }
  u && qc(u, e, "c");
  function K(ee, Z) {
    oe(Z) ? Z.forEach((fe) => ee(fe.bind(n))) : Z && ee(Z.bind(n));
  }
  if (K(Yf, f), K(Xt, d), K(Xf, h), K(Qf, m), K(Zf, x), K(Wf, A), K(sh, T), K(nh, C), K(th, z), K(tc, k), K(nc, p), K(eh, R), oe(M))
    if (M.length) {
      const ee = e.exposed || (e.exposed = {});
      M.forEach((Z) => {
        Object.defineProperty(ee, Z, {
          get: () => n[Z],
          set: (fe) => n[Z] = fe
        });
      });
    } else e.exposed || (e.exposed = {});
  E && e.render === Tt && (e.render = E), q != null && (e.inheritAttrs = q), I && (e.components = I), se && (e.directives = se), R && ml(e);
}
function ih(e, t, n = Tt) {
  oe(e) && (e = Fo(e));
  for (const s in e) {
    const r = e[s];
    let o;
    Me(r) ? "default" in r ? o = An(
      r.from || s,
      r.default,
      !0
    ) : o = An(r.from || s) : o = An(r), $e(o) ? Object.defineProperty(t, s, {
      enumerable: !0,
      configurable: !0,
      get: () => o.value,
      set: (c) => o.value = c
    }) : t[s] = o;
  }
}
function qc(e, t, n) {
  vt(
    oe(e) ? e.map((s) => s.bind(t.proxy)) : e.bind(t.proxy),
    t,
    n
  );
}
function El(e, t, n, s) {
  let r = s.includes(".") ? Pl(n, s) : () => n[s];
  if (Ie(e)) {
    const o = t[e];
    le(o) && bs(r, o);
  } else if (le(e))
    bs(r, e.bind(n));
  else if (Me(e))
    if (oe(e))
      e.forEach((o) => El(o, t, n, s));
    else {
      const o = le(e.handler) ? e.handler.bind(n) : t[e.handler];
      le(o) && bs(r, o, e);
    }
}
function Cl(e) {
  const t = e.type, { mixins: n, extends: s } = t, {
    mixins: r,
    optionsCache: o,
    config: { optionMergeStrategies: c }
  } = e.appContext, i = o.get(t);
  let a;
  return i ? a = i : !r.length && !n && !s ? a = t : (a = {}, r.length && r.forEach(
    (l) => Ss(a, l, c, !0)
  ), Ss(a, t, c)), Me(t) && o.set(t, a), a;
}
function Ss(e, t, n, s = !1) {
  const { mixins: r, extends: o } = t;
  o && Ss(e, o, n, !0), r && r.forEach(
    (c) => Ss(e, c, n, !0)
  );
  for (const c in t)
    if (!(s && c === "expose")) {
      const i = ah[c] || n && n[c];
      e[c] = i ? i(e[c], t[c]) : t[c];
    }
  return e;
}
const ah = {
  data: Pc,
  props: Bc,
  emits: Bc,
  // objects
  methods: Pn,
  computed: Pn,
  // lifecycle
  beforeCreate: Qe,
  created: Qe,
  beforeMount: Qe,
  mounted: Qe,
  beforeUpdate: Qe,
  updated: Qe,
  beforeDestroy: Qe,
  beforeUnmount: Qe,
  destroyed: Qe,
  unmounted: Qe,
  activated: Qe,
  deactivated: Qe,
  errorCaptured: Qe,
  serverPrefetch: Qe,
  // assets
  components: Pn,
  directives: Pn,
  // watch
  watch: uh,
  // provide / inject
  provide: Pc,
  inject: lh
};
function Pc(e, t) {
  return t ? e ? function() {
    return ze(
      le(e) ? e.call(this, this) : e,
      le(t) ? t.call(this, this) : t
    );
  } : t : e;
}
function lh(e, t) {
  return Pn(Fo(e), Fo(t));
}
function Fo(e) {
  if (oe(e)) {
    const t = {};
    for (let n = 0; n < e.length; n++)
      t[e[n]] = e[n];
    return t;
  }
  return e;
}
function Qe(e, t) {
  return e ? [...new Set([].concat(e, t))] : t;
}
function Pn(e, t) {
  return e ? ze(/* @__PURE__ */ Object.create(null), e, t) : t;
}
function Bc(e, t) {
  return e ? oe(e) && oe(t) ? [.../* @__PURE__ */ new Set([...e, ...t])] : ze(
    /* @__PURE__ */ Object.create(null),
    Fc(e),
    Fc(t ?? {})
  ) : t;
}
function uh(e, t) {
  if (!e) return t;
  if (!t) return e;
  const n = ze(/* @__PURE__ */ Object.create(null), e);
  for (const s in t)
    n[s] = Qe(e[s], t[s]);
  return n;
}
function Al() {
  return {
    app: null,
    config: {
      isNativeTag: Wu,
      performance: !1,
      globalProperties: {},
      optionMergeStrategies: {},
      errorHandler: void 0,
      warnHandler: void 0,
      compilerOptions: {}
    },
    mixins: [],
    components: {},
    directives: {},
    provides: /* @__PURE__ */ Object.create(null),
    optionsCache: /* @__PURE__ */ new WeakMap(),
    propsCache: /* @__PURE__ */ new WeakMap(),
    emitsCache: /* @__PURE__ */ new WeakMap()
  };
}
let fh = 0;
function hh(e, t) {
  return function(s, r = null) {
    le(s) || (s = ze({}, s)), r != null && !Me(r) && (r = null);
    const o = Al(), c = /* @__PURE__ */ new WeakSet(), i = [];
    let a = !1;
    const l = o.app = {
      _uid: fh++,
      _component: s,
      _props: r,
      _container: null,
      _context: o,
      _instance: null,
      version: Gh,
      get config() {
        return o.config;
      },
      set config(u) {
      },
      use(u, ...f) {
        return c.has(u) || (u && le(u.install) ? (c.add(u), u.install(l, ...f)) : le(u) && (c.add(u), u(l, ...f))), l;
      },
      mixin(u) {
        return o.mixins.includes(u) || o.mixins.push(u), l;
      },
      component(u, f) {
        return f ? (o.components[u] = f, l) : o.components[u];
      },
      directive(u, f) {
        return f ? (o.directives[u] = f, l) : o.directives[u];
      },
      mount(u, f, d) {
        if (!a) {
          const h = l._ceVNode || Se(s, r);
          return h.appContext = o, d === !0 ? d = "svg" : d === !1 && (d = void 0), e(h, u, d), a = !0, l._container = u, u.__vue_app__ = l, Hs(h.component);
        }
      },
      onUnmount(u) {
        i.push(u);
      },
      unmount() {
        a && (vt(
          i,
          l._instance,
          16
        ), e(null, l._container), delete l._container.__vue_app__);
      },
      provide(u, f) {
        return o.provides[u] = f, l;
      },
      runWithContext(u) {
        const f = Cn;
        Cn = l;
        try {
          return u();
        } finally {
          Cn = f;
        }
      }
    };
    return l;
  };
}
let Cn = null;
function dh(e, t) {
  if (je) {
    let n = je.provides;
    const s = je.parent && je.parent.provides;
    s === n && (n = je.provides = Object.create(s)), n[e] = t;
  }
}
function An(e, t, n = !1) {
  const s = je || Be;
  if (s || Cn) {
    const r = Cn ? Cn._context.provides : s ? s.parent == null ? s.vnode.appContext && s.vnode.appContext.provides : s.parent.provides : void 0;
    if (r && e in r)
      return r[e];
    if (arguments.length > 1)
      return n && le(t) ? t.call(s && s.proxy) : t;
  }
}
const wl = {}, Sl = () => Object.create(wl), Tl = (e) => Object.getPrototypeOf(e) === wl;
function ph(e, t, n, s = !1) {
  const r = {}, o = Sl();
  e.propsDefaults = /* @__PURE__ */ Object.create(null), Rl(e, t, r, o);
  for (const c in e.propsOptions[0])
    c in r || (r[c] = void 0);
  n ? e.props = s ? r : Rf(r) : e.type.props ? e.props = r : e.props = o, e.attrs = o;
}
function gh(e, t, n, s) {
  const {
    props: r,
    attrs: o,
    vnode: { patchFlag: c }
  } = e, i = be(r), [a] = e.propsOptions;
  let l = !1;
  if (
    // always force full diff in dev
    // - #1942 if hmr is enabled with sfc component
    // - vite#872 non-sfc component used by sfc component
    (s || c > 0) && !(c & 16)
  ) {
    if (c & 8) {
      const u = e.vnode.dynamicProps;
      for (let f = 0; f < u.length; f++) {
        let d = u[f];
        if ($s(e.emitsOptions, d))
          continue;
        const h = t[d];
        if (a)
          if (ye(o, d))
            h !== o[d] && (o[d] = h, l = !0);
          else {
            const m = gt(d);
            r[m] = qo(
              a,
              i,
              m,
              h,
              e,
              !1
            );
          }
        else
          h !== o[d] && (o[d] = h, l = !0);
      }
    }
  } else {
    Rl(e, t, r, o) && (l = !0);
    let u;
    for (const f in i)
      (!t || // for camelCase
      !ye(t, f) && // it's possible the original props was passed in as kebab-case
      // and converted to camelCase (#955)
      ((u = Wt(f)) === f || !ye(t, u))) && (a ? n && // for camelCase
      (n[f] !== void 0 || // for kebab-case
      n[u] !== void 0) && (r[f] = qo(
        a,
        i,
        f,
        void 0,
        e,
        !0
      )) : delete r[f]);
    if (o !== i)
      for (const f in o)
        (!t || !ye(t, f)) && (delete o[f], l = !0);
  }
  l && Ot(e.attrs, "set", "");
}
function Rl(e, t, n, s) {
  const [r, o] = e.propsOptions;
  let c = !1, i;
  if (t)
    for (let a in t) {
      if (Bn(a))
        continue;
      const l = t[a];
      let u;
      r && ye(r, u = gt(a)) ? !o || !o.includes(u) ? n[u] = l : (i || (i = {}))[u] = l : $s(e.emitsOptions, a) || (!(a in s) || l !== s[a]) && (s[a] = l, c = !0);
    }
  if (o) {
    const a = be(n), l = i || we;
    for (let u = 0; u < o.length; u++) {
      const f = o[u];
      n[f] = qo(
        r,
        a,
        f,
        l[f],
        e,
        !ye(l, f)
      );
    }
  }
  return c;
}
function qo(e, t, n, s, r, o) {
  const c = e[n];
  if (c != null) {
    const i = ye(c, "default");
    if (i && s === void 0) {
      const a = c.default;
      if (c.type !== Function && !c.skipFactory && le(a)) {
        const { propsDefaults: l } = r;
        if (n in l)
          s = l[n];
        else {
          const u = ts(r);
          s = l[n] = a.call(
            null,
            t
          ), u();
        }
      } else
        s = a;
      r.ce && r.ce._setProp(n, s);
    }
    c[
      0
      /* shouldCast */
    ] && (o && !i ? s = !1 : c[
      1
      /* shouldCastTrue */
    ] && (s === "" || s === Wt(n)) && (s = !0));
  }
  return s;
}
const _h = /* @__PURE__ */ new WeakMap();
function Dl(e, t, n = !1) {
  const s = n ? _h : t.propsCache, r = s.get(e);
  if (r)
    return r;
  const o = e.props, c = {}, i = [];
  let a = !1;
  if (!le(e)) {
    const u = (f) => {
      a = !0;
      const [d, h] = Dl(f, t, !0);
      ze(c, d), h && i.push(...h);
    };
    !n && t.mixins.length && t.mixins.forEach(u), e.extends && u(e.extends), e.mixins && e.mixins.forEach(u);
  }
  if (!o && !a)
    return Me(e) && s.set(e, vn), vn;
  if (oe(o))
    for (let u = 0; u < o.length; u++) {
      const f = gt(o[u]);
      $c(f) && (c[f] = we);
    }
  else if (o)
    for (const u in o) {
      const f = gt(u);
      if ($c(f)) {
        const d = o[u], h = c[f] = oe(d) || le(d) ? { type: d } : ze({}, d), m = h.type;
        let x = !1, A = !0;
        if (oe(m))
          for (let v = 0; v < m.length; ++v) {
            const k = m[v], b = le(k) && k.name;
            if (b === "Boolean") {
              x = !0;
              break;
            } else b === "String" && (A = !1);
          }
        else
          x = le(m) && m.name === "Boolean";
        h[
          0
          /* shouldCast */
        ] = x, h[
          1
          /* shouldCastTrue */
        ] = A, (x || ye(h, "default")) && i.push(f);
      }
    }
  const l = [c, i];
  return Me(e) && s.set(e, l), l;
}
function $c(e) {
  return e[0] !== "$" && !Bn(e);
}
const Ml = (e) => e[0] === "_" || e === "$stable", sc = (e) => oe(e) ? e.map(At) : [At(e)], mh = (e, t, n) => {
  if (t._n)
    return t;
  const s = Rt((...r) => sc(t(...r)), n);
  return s._c = !1, s;
}, Il = (e, t, n) => {
  const s = e._ctx;
  for (const r in e) {
    if (Ml(r)) continue;
    const o = e[r];
    if (le(o))
      t[r] = mh(r, o, s);
    else if (o != null) {
      const c = sc(o);
      t[r] = () => c;
    }
  }
}, Nl = (e, t) => {
  const n = sc(t);
  e.slots.default = () => n;
}, Ll = (e, t, n) => {
  for (const s in t)
    (n || s !== "_") && (e[s] = t[s]);
}, bh = (e, t, n) => {
  const s = e.slots = Sl();
  if (e.vnode.shapeFlag & 32) {
    const r = t._;
    r ? (Ll(s, t, n), n && Ba(s, "_", r, !0)) : Il(t, s);
  } else t && Nl(e, t);
}, vh = (e, t, n) => {
  const { vnode: s, slots: r } = e;
  let o = !0, c = we;
  if (s.shapeFlag & 32) {
    const i = t._;
    i ? n && i === 1 ? o = !1 : Ll(r, t, n) : (o = !t.$stable, Il(t, r)), c = t;
  } else t && (Nl(e, t), c = { default: 1 });
  if (o)
    for (const i in r)
      !Ml(i) && c[i] == null && delete r[i];
}, it = Nh;
function yh(e) {
  return xh(e);
}
function xh(e, t) {
  const n = Os();
  n.__VUE__ = !0;
  const {
    insert: s,
    remove: r,
    patchProp: o,
    createElement: c,
    createText: i,
    createComment: a,
    setText: l,
    setElementText: u,
    parentNode: f,
    nextSibling: d,
    setScopeId: h = Tt,
    insertStaticContent: m
  } = e, x = (g, y, w, O = null, N = null, L = null, V = void 0, U = null, $ = !!y.dynamicChildren) => {
    if (g === y)
      return;
    g && !ln(g, y) && (O = dn(g), Ae(g, N, L, !0), g = null), y.patchFlag === -2 && ($ = !1, y.dynamicChildren = null);
    const { type: F, ref: re, shapeFlag: G } = y;
    switch (F) {
      case zs:
        A(g, y, w, O);
        break;
      case st:
        v(g, y, w, O);
        break;
      case ur:
        g == null && k(y, w, O, V);
        break;
      case Ve:
        I(
          g,
          y,
          w,
          O,
          N,
          L,
          V,
          U,
          $
        );
        break;
      default:
        G & 1 ? E(
          g,
          y,
          w,
          O,
          N,
          L,
          V,
          U,
          $
        ) : G & 6 ? se(
          g,
          y,
          w,
          O,
          N,
          L,
          V,
          U,
          $
        ) : (G & 64 || G & 128) && F.process(
          g,
          y,
          w,
          O,
          N,
          L,
          V,
          U,
          $,
          yt
        );
    }
    re != null && N && As(re, g && g.ref, L, y || g, !y);
  }, A = (g, y, w, O) => {
    if (g == null)
      s(
        y.el = i(y.children),
        w,
        O
      );
    else {
      const N = y.el = g.el;
      y.children !== g.children && l(N, y.children);
    }
  }, v = (g, y, w, O) => {
    g == null ? s(
      y.el = a(y.children || ""),
      w,
      O
    ) : y.el = g.el;
  }, k = (g, y, w, O) => {
    [g.el, g.anchor] = m(
      g.children,
      y,
      w,
      O,
      g.el,
      g.anchor
    );
  }, b = ({ el: g, anchor: y }, w, O) => {
    let N;
    for (; g && g !== y; )
      N = d(g), s(g, w, O), g = N;
    s(y, w, O);
  }, p = ({ el: g, anchor: y }) => {
    let w;
    for (; g && g !== y; )
      w = d(g), r(g), g = w;
    r(y);
  }, E = (g, y, w, O, N, L, V, U, $) => {
    y.type === "svg" ? V = "svg" : y.type === "math" && (V = "mathml"), g == null ? C(
      y,
      w,
      O,
      N,
      L,
      V,
      U,
      $
    ) : R(
      g,
      y,
      N,
      L,
      V,
      U,
      $
    );
  }, C = (g, y, w, O, N, L, V, U) => {
    let $, F;
    const { props: re, shapeFlag: G, transition: Y, dirs: ce } = g;
    if ($ = g.el = c(
      g.type,
      L,
      re && re.is,
      re
    ), G & 8 ? u($, g.children) : G & 16 && T(
      g.children,
      $,
      null,
      O,
      N,
      lr(g, L),
      V,
      U
    ), ce && nn(g, null, O, "created"), z($, g, g.scopeId, V, O), re) {
      for (const ve in re)
        ve !== "value" && !Bn(ve) && o($, ve, null, re[ve], L, O);
      "value" in re && o($, "value", null, re.value, L), (F = re.onVnodeBeforeMount) && Et(F, O, g);
    }
    ce && nn(g, null, O, "beforeMount");
    const he = kh(N, Y);
    he && Y.beforeEnter($), s($, y, w), ((F = re && re.onVnodeMounted) || he || ce) && it(() => {
      F && Et(F, O, g), he && Y.enter($), ce && nn(g, null, O, "mounted");
    }, N);
  }, z = (g, y, w, O, N) => {
    if (w && h(g, w), O)
      for (let L = 0; L < O.length; L++)
        h(g, O[L]);
    if (N) {
      let L = N.subTree;
      if (y === L || $l(L.type) && (L.ssContent === y || L.ssFallback === y)) {
        const V = N.vnode;
        z(
          g,
          V,
          V.scopeId,
          V.slotScopeIds,
          N.parent
        );
      }
    }
  }, T = (g, y, w, O, N, L, V, U, $ = 0) => {
    for (let F = $; F < g.length; F++) {
      const re = g[F] = U ? Vt(g[F]) : At(g[F]);
      x(
        null,
        re,
        y,
        w,
        O,
        N,
        L,
        V,
        U
      );
    }
  }, R = (g, y, w, O, N, L, V) => {
    const U = y.el = g.el;
    let { patchFlag: $, dynamicChildren: F, dirs: re } = y;
    $ |= g.patchFlag & 16;
    const G = g.props || we, Y = y.props || we;
    let ce;
    if (w && sn(w, !1), (ce = Y.onVnodeBeforeUpdate) && Et(ce, w, y, g), re && nn(y, g, w, "beforeUpdate"), w && sn(w, !0), (G.innerHTML && Y.innerHTML == null || G.textContent && Y.textContent == null) && u(U, ""), F ? M(
      g.dynamicChildren,
      F,
      U,
      w,
      O,
      lr(y, N),
      L
    ) : V || Z(
      g,
      y,
      U,
      null,
      w,
      O,
      lr(y, N),
      L,
      !1
    ), $ > 0) {
      if ($ & 16)
        q(U, G, Y, w, N);
      else if ($ & 2 && G.class !== Y.class && o(U, "class", null, Y.class, N), $ & 4 && o(U, "style", G.style, Y.style, N), $ & 8) {
        const he = y.dynamicProps;
        for (let ve = 0; ve < he.length; ve++) {
          const me = he[ve], Ye = G[me], Ge = Y[me];
          (Ge !== Ye || me === "value") && o(U, me, Ye, Ge, N, w);
        }
      }
      $ & 1 && g.children !== y.children && u(U, y.children);
    } else !V && F == null && q(U, G, Y, w, N);
    ((ce = Y.onVnodeUpdated) || re) && it(() => {
      ce && Et(ce, w, y, g), re && nn(y, g, w, "updated");
    }, O);
  }, M = (g, y, w, O, N, L, V) => {
    for (let U = 0; U < y.length; U++) {
      const $ = g[U], F = y[U], re = (
        // oldVNode may be an errored async setup() component inside Suspense
        // which will not have a mounted element
        $.el && // - In the case of a Fragment, we need to provide the actual parent
        // of the Fragment itself so it can move its children.
        ($.type === Ve || // - In the case of different nodes, there is going to be a replacement
        // which also requires the correct parent container
        !ln($, F) || // - In the case of a component, it could contain anything.
        $.shapeFlag & 70) ? f($.el) : (
          // In other cases, the parent container is not actually used so we
          // just pass the block element here to avoid a DOM parentNode call.
          w
        )
      );
      x(
        $,
        F,
        re,
        null,
        O,
        N,
        L,
        V,
        !0
      );
    }
  }, q = (g, y, w, O, N) => {
    if (y !== w) {
      if (y !== we)
        for (const L in y)
          !Bn(L) && !(L in w) && o(
            g,
            L,
            y[L],
            null,
            N,
            O
          );
      for (const L in w) {
        if (Bn(L)) continue;
        const V = w[L], U = y[L];
        V !== U && L !== "value" && o(g, L, U, V, N, O);
      }
      "value" in w && o(g, "value", y.value, w.value, N);
    }
  }, I = (g, y, w, O, N, L, V, U, $) => {
    const F = y.el = g ? g.el : i(""), re = y.anchor = g ? g.anchor : i("");
    let { patchFlag: G, dynamicChildren: Y, slotScopeIds: ce } = y;
    ce && (U = U ? U.concat(ce) : ce), g == null ? (s(F, w, O), s(re, w, O), T(
      // #10007
      // such fragment like `<></>` will be compiled into
      // a fragment which doesn't have a children.
      // In this case fallback to an empty array
      y.children || [],
      w,
      re,
      N,
      L,
      V,
      U,
      $
    )) : G > 0 && G & 64 && Y && // #2715 the previous fragment could've been a BAILed one as a result
    // of renderSlot() with no valid children
    g.dynamicChildren ? (M(
      g.dynamicChildren,
      Y,
      w,
      N,
      L,
      V,
      U
    ), // #2080 if the stable fragment has a key, it's a <template v-for> that may
    //  get moved around. Make sure all root level vnodes inherit el.
    // #2134 or if it's a component root, it may also get moved around
    // as the component is being moved.
    (y.key != null || N && y === N.subTree) && Ol(
      g,
      y,
      !0
      /* shallow */
    )) : Z(
      g,
      y,
      w,
      re,
      N,
      L,
      V,
      U,
      $
    );
  }, se = (g, y, w, O, N, L, V, U, $) => {
    y.slotScopeIds = U, g == null ? y.shapeFlag & 512 ? N.ctx.activate(
      y,
      w,
      O,
      V,
      $
    ) : S(
      y,
      w,
      O,
      N,
      L,
      V,
      $
    ) : B(g, y, $);
  }, S = (g, y, w, O, N, L, V) => {
    const U = g.component = Ph(
      g,
      O,
      N
    );
    if (Ps(g) && (U.ctx.renderer = yt), $h(U, !1, V), U.asyncDep) {
      if (N && N.registerDep(U, K, V), !g.el) {
        const $ = U.subTree = Se(st);
        v(null, $, y, w);
      }
    } else
      K(
        U,
        g,
        y,
        w,
        N,
        L,
        V
      );
  }, B = (g, y, w) => {
    const O = y.component = g.component;
    if (Mh(g, y, w))
      if (O.asyncDep && !O.asyncResolved) {
        ee(O, y, w);
        return;
      } else
        O.next = y, O.update();
    else
      y.el = g.el, O.vnode = y;
  }, K = (g, y, w, O, N, L, V) => {
    const U = () => {
      if (g.isMounted) {
        let { next: G, bu: Y, u: ce, parent: he, vnode: ve } = g;
        {
          const ft = Fl(g);
          if (ft) {
            G && (G.el = ve.el, ee(g, G, V)), ft.asyncDep.then(() => {
              g.isUnmounted || U();
            });
            return;
          }
        }
        let me = G, Ye;
        sn(g, !1), G ? (G.el = ve.el, ee(g, G, V)) : G = ve, Y && ms(Y), (Ye = G.props && G.props.onVnodeBeforeUpdate) && Et(Ye, he, G, ve), sn(g, !0);
        const Ge = Uc(g), ut = g.subTree;
        g.subTree = Ge, x(
          ut,
          Ge,
          // parent may have changed if it's in a teleport
          f(ut.el),
          // anchor may have changed if it's in a fragment
          dn(ut),
          g,
          N,
          L
        ), G.el = Ge.el, me === null && Ih(g, Ge.el), ce && it(ce, N), (Ye = G.props && G.props.onVnodeUpdated) && it(
          () => Et(Ye, he, G, ve),
          N
        );
      } else {
        let G;
        const { el: Y, props: ce } = y, { bm: he, m: ve, parent: me, root: Ye, type: Ge } = g, ut = En(y);
        sn(g, !1), he && ms(he), !ut && (G = ce && ce.onVnodeBeforeMount) && Et(G, me, y), sn(g, !0);
        {
          Ye.ce && Ye.ce._injectChildStyle(Ge);
          const ft = g.subTree = Uc(g);
          x(
            null,
            ft,
            w,
            O,
            g,
            N,
            L
          ), y.el = ft.el;
        }
        if (ve && it(ve, N), !ut && (G = ce && ce.onVnodeMounted)) {
          const ft = y;
          it(
            () => Et(G, me, ft),
            N
          );
        }
        (y.shapeFlag & 256 || me && En(me.vnode) && me.vnode.shapeFlag & 256) && g.a && it(g.a, N), g.isMounted = !0, y = w = O = null;
      }
    };
    g.scope.on();
    const $ = g.effect = new Va(U);
    g.scope.off();
    const F = g.update = $.run.bind($), re = g.job = $.runIfDirty.bind($);
    re.i = g, re.id = g.uid, $.scheduler = () => ec(re), sn(g, !0), F();
  }, ee = (g, y, w) => {
    y.component = g;
    const O = g.vnode.props;
    g.vnode = y, g.next = null, gh(g, y.props, O, w), vh(g, y.children, w), Jt(), Ic(g), Yt();
  }, Z = (g, y, w, O, N, L, V, U, $ = !1) => {
    const F = g && g.children, re = g ? g.shapeFlag : 0, G = y.children, { patchFlag: Y, shapeFlag: ce } = y;
    if (Y > 0) {
      if (Y & 128) {
        J(
          F,
          G,
          w,
          O,
          N,
          L,
          V,
          U,
          $
        );
        return;
      } else if (Y & 256) {
        fe(
          F,
          G,
          w,
          O,
          N,
          L,
          V,
          U,
          $
        );
        return;
      }
    }
    ce & 8 ? (re & 16 && Qt(F, N, L), G !== F && u(w, G)) : re & 16 ? ce & 16 ? J(
      F,
      G,
      w,
      O,
      N,
      L,
      V,
      U,
      $
    ) : Qt(F, N, L, !0) : (re & 8 && u(w, ""), ce & 16 && T(
      G,
      w,
      O,
      N,
      L,
      V,
      U,
      $
    ));
  }, fe = (g, y, w, O, N, L, V, U, $) => {
    g = g || vn, y = y || vn;
    const F = g.length, re = y.length, G = Math.min(F, re);
    let Y;
    for (Y = 0; Y < G; Y++) {
      const ce = y[Y] = $ ? Vt(y[Y]) : At(y[Y]);
      x(
        g[Y],
        ce,
        w,
        null,
        N,
        L,
        V,
        U,
        $
      );
    }
    F > re ? Qt(
      g,
      N,
      L,
      !0,
      !1,
      G
    ) : T(
      y,
      w,
      O,
      N,
      L,
      V,
      U,
      $,
      G
    );
  }, J = (g, y, w, O, N, L, V, U, $) => {
    let F = 0;
    const re = y.length;
    let G = g.length - 1, Y = re - 1;
    for (; F <= G && F <= Y; ) {
      const ce = g[F], he = y[F] = $ ? Vt(y[F]) : At(y[F]);
      if (ln(ce, he))
        x(
          ce,
          he,
          w,
          null,
          N,
          L,
          V,
          U,
          $
        );
      else
        break;
      F++;
    }
    for (; F <= G && F <= Y; ) {
      const ce = g[G], he = y[Y] = $ ? Vt(y[Y]) : At(y[Y]);
      if (ln(ce, he))
        x(
          ce,
          he,
          w,
          null,
          N,
          L,
          V,
          U,
          $
        );
      else
        break;
      G--, Y--;
    }
    if (F > G) {
      if (F <= Y) {
        const ce = Y + 1, he = ce < re ? y[ce].el : O;
        for (; F <= Y; )
          x(
            null,
            y[F] = $ ? Vt(y[F]) : At(y[F]),
            w,
            he,
            N,
            L,
            V,
            U,
            $
          ), F++;
      }
    } else if (F > Y)
      for (; F <= G; )
        Ae(g[F], N, L, !0), F++;
    else {
      const ce = F, he = F, ve = /* @__PURE__ */ new Map();
      for (F = he; F <= Y; F++) {
        const Xe = y[F] = $ ? Vt(y[F]) : At(y[F]);
        Xe.key != null && ve.set(Xe.key, F);
      }
      let me, Ye = 0;
      const Ge = Y - he + 1;
      let ut = !1, ft = 0;
      const en = new Array(Ge);
      for (F = 0; F < Ge; F++) en[F] = 0;
      for (F = ce; F <= G; F++) {
        const Xe = g[F];
        if (Ye >= Ge) {
          Ae(Xe, N, L, !0);
          continue;
        }
        let ht;
        if (Xe.key != null)
          ht = ve.get(Xe.key);
        else
          for (me = he; me <= Y; me++)
            if (en[me - he] === 0 && ln(Xe, y[me])) {
              ht = me;
              break;
            }
        ht === void 0 ? Ae(Xe, N, L, !0) : (en[ht - he] = F + 1, ht >= ft ? ft = ht : ut = !0, x(
          Xe,
          y[ht],
          w,
          null,
          N,
          L,
          V,
          U,
          $
        ), Ye++);
      }
      const Dn = ut ? Eh(en) : vn;
      for (me = Dn.length - 1, F = Ge - 1; F >= 0; F--) {
        const Xe = he + F, ht = y[Xe], ss = Xe + 1 < re ? y[Xe + 1].el : O;
        en[F] === 0 ? x(
          null,
          ht,
          w,
          ss,
          N,
          L,
          V,
          U,
          $
        ) : ut && (me < 0 || F !== Dn[me] ? Ce(ht, w, ss, 2) : me--);
      }
    }
  }, Ce = (g, y, w, O, N = null) => {
    const { el: L, type: V, transition: U, children: $, shapeFlag: F } = g;
    if (F & 6) {
      Ce(g.component.subTree, y, w, O);
      return;
    }
    if (F & 128) {
      g.suspense.move(y, w, O);
      return;
    }
    if (F & 64) {
      V.move(g, y, w, yt);
      return;
    }
    if (V === Ve) {
      s(L, y, w);
      for (let G = 0; G < $.length; G++)
        Ce($[G], y, w, O);
      s(g.anchor, y, w);
      return;
    }
    if (V === ur) {
      b(g, y, w);
      return;
    }
    if (O !== 2 && F & 1 && U)
      if (O === 0)
        U.beforeEnter(L), s(L, y, w), it(() => U.enter(L), N);
      else {
        const { leave: G, delayLeave: Y, afterLeave: ce } = U, he = () => s(L, y, w), ve = () => {
          G(L, () => {
            he(), ce && ce();
          });
        };
        Y ? Y(L, he, ve) : ve();
      }
    else
      s(L, y, w);
  }, Ae = (g, y, w, O = !1, N = !1) => {
    const {
      type: L,
      props: V,
      ref: U,
      children: $,
      dynamicChildren: F,
      shapeFlag: re,
      patchFlag: G,
      dirs: Y,
      cacheIndex: ce
    } = g;
    if (G === -2 && (N = !1), U != null && As(U, null, w, g, !0), ce != null && (y.renderCache[ce] = void 0), re & 256) {
      y.ctx.deactivate(g);
      return;
    }
    const he = re & 1 && Y, ve = !En(g);
    let me;
    if (ve && (me = V && V.onVnodeBeforeUnmount) && Et(me, y, g), re & 6)
      Ks(g.component, w, O);
    else {
      if (re & 128) {
        g.suspense.unmount(w, O);
        return;
      }
      he && nn(g, null, y, "beforeUnmount"), re & 64 ? g.type.remove(
        g,
        y,
        w,
        yt,
        O
      ) : F && // #5154
      // when v-once is used inside a block, setBlockTracking(-1) marks the
      // parent block with hasOnce: true
      // so that it doesn't take the fast path during unmount - otherwise
      // components nested in v-once are never unmounted.
      !F.hasOnce && // #1153: fast path should not be taken for non-stable (v-for) fragments
      (L !== Ve || G > 0 && G & 64) ? Qt(
        F,
        y,
        w,
        !1,
        !0
      ) : (L === Ve && G & 384 || !N && re & 16) && Qt($, y, w), O && rt(g);
    }
    (ve && (me = V && V.onVnodeUnmounted) || he) && it(() => {
      me && Et(me, y, g), he && nn(g, null, y, "unmounted");
    }, w);
  }, rt = (g) => {
    const { type: y, el: w, anchor: O, transition: N } = g;
    if (y === Ve) {
      Gs(w, O);
      return;
    }
    if (y === ur) {
      p(g);
      return;
    }
    const L = () => {
      r(w), N && !N.persisted && N.afterLeave && N.afterLeave();
    };
    if (g.shapeFlag & 1 && N && !N.persisted) {
      const { leave: V, delayLeave: U } = N, $ = () => V(w, L);
      U ? U(g.el, L, $) : $();
    } else
      L();
  }, Gs = (g, y) => {
    let w;
    for (; g !== y; )
      w = d(g), r(g), g = w;
    r(y);
  }, Ks = (g, y, w) => {
    const { bum: O, scope: N, job: L, subTree: V, um: U, m: $, a: F } = g;
    zc($), zc(F), O && ms(O), N.stop(), L && (L.flags |= 8, Ae(V, g, y, w)), U && it(U, y), it(() => {
      g.isUnmounted = !0;
    }, y), y && y.pendingBranch && !y.isUnmounted && g.asyncDep && !g.asyncResolved && g.suspenseId === y.pendingId && (y.deps--, y.deps === 0 && y.resolve());
  }, Qt = (g, y, w, O = !1, N = !1, L = 0) => {
    for (let V = L; V < g.length; V++)
      Ae(g[V], y, w, O, N);
  }, dn = (g) => {
    if (g.shapeFlag & 6)
      return dn(g.component.subTree);
    if (g.shapeFlag & 128)
      return g.suspense.next();
    const y = d(g.anchor || g.el), w = y && y[Vf];
    return w ? d(w) : y;
  };
  let Rn = !1;
  const Zs = (g, y, w) => {
    g == null ? y._vnode && Ae(y._vnode, null, null, !0) : x(
      y._vnode || null,
      g,
      y,
      null,
      null,
      null,
      w
    ), y._vnode = g, Rn || (Rn = !0, Ic(), il(), Rn = !1);
  }, yt = {
    p: x,
    um: Ae,
    m: Ce,
    r: rt,
    mt: S,
    mc: T,
    pc: Z,
    pbc: M,
    n: dn,
    o: e
  };
  return {
    render: Zs,
    hydrate: void 0,
    createApp: hh(Zs)
  };
}
function lr({ type: e, props: t }, n) {
  return n === "svg" && e === "foreignObject" || n === "mathml" && e === "annotation-xml" && t && t.encoding && t.encoding.includes("html") ? void 0 : n;
}
function sn({ effect: e, job: t }, n) {
  n ? (e.flags |= 32, t.flags |= 4) : (e.flags &= -33, t.flags &= -5);
}
function kh(e, t) {
  return (!e || e && !e.pendingBranch) && t && !t.persisted;
}
function Ol(e, t, n = !1) {
  const s = e.children, r = t.children;
  if (oe(s) && oe(r))
    for (let o = 0; o < s.length; o++) {
      const c = s[o];
      let i = r[o];
      i.shapeFlag & 1 && !i.dynamicChildren && ((i.patchFlag <= 0 || i.patchFlag === 32) && (i = r[o] = Vt(r[o]), i.el = c.el), !n && i.patchFlag !== -2 && Ol(c, i)), i.type === zs && (i.el = c.el);
    }
}
function Eh(e) {
  const t = e.slice(), n = [0];
  let s, r, o, c, i;
  const a = e.length;
  for (s = 0; s < a; s++) {
    const l = e[s];
    if (l !== 0) {
      if (r = n[n.length - 1], e[r] < l) {
        t[s] = r, n.push(s);
        continue;
      }
      for (o = 0, c = n.length - 1; o < c; )
        i = o + c >> 1, e[n[i]] < l ? o = i + 1 : c = i;
      l < e[n[o]] && (o > 0 && (t[s] = n[o - 1]), n[o] = s);
    }
  }
  for (o = n.length, c = n[o - 1]; o-- > 0; )
    n[o] = c, c = t[c];
  return n;
}
function Fl(e) {
  const t = e.subTree.component;
  if (t)
    return t.asyncDep && !t.asyncResolved ? t : Fl(t);
}
function zc(e) {
  if (e)
    for (let t = 0; t < e.length; t++)
      e[t].flags |= 8;
}
const Ch = Symbol.for("v-scx"), Ah = () => An(Ch);
function bs(e, t, n) {
  return ql(e, t, n);
}
function ql(e, t, n = we) {
  const { immediate: s, deep: r, flush: o, once: c } = n, i = ze({}, n), a = t && s || !t && o !== "post";
  let l;
  if (Jn) {
    if (o === "sync") {
      const h = Ah();
      l = h.__watcherHandles || (h.__watcherHandles = []);
    } else if (!a) {
      const h = () => {
      };
      return h.stop = Tt, h.resume = Tt, h.pause = Tt, h;
    }
  }
  const u = je;
  i.call = (h, m, x) => vt(h, u, m, x);
  let f = !1;
  o === "post" ? i.scheduler = (h) => {
    it(h, u && u.suspense);
  } : o !== "sync" && (f = !0, i.scheduler = (h, m) => {
    m ? h() : ec(h);
  }), i.augmentJob = (h) => {
    t && (h.flags |= 4), f && (h.flags |= 2, u && (h.id = u.uid, h.i = u));
  };
  const d = $f(e, t, i);
  return Jn && (l ? l.push(d) : a && d()), d;
}
function wh(e, t, n) {
  const s = this.proxy, r = Ie(e) ? e.includes(".") ? Pl(s, e) : () => s[e] : e.bind(s, s);
  let o;
  le(t) ? o = t : (o = t.handler, n = t);
  const c = ts(this), i = ql(r, o.bind(s), n);
  return c(), i;
}
function Pl(e, t) {
  const n = t.split(".");
  return () => {
    let s = e;
    for (let r = 0; r < n.length && s; r++)
      s = s[n[r]];
    return s;
  };
}
const Sh = (e, t) => t === "modelValue" || t === "model-value" ? e.modelModifiers : e[`${t}Modifiers`] || e[`${gt(t)}Modifiers`] || e[`${Wt(t)}Modifiers`];
function Th(e, t, ...n) {
  if (e.isUnmounted) return;
  const s = e.vnode.props || we;
  let r = n;
  const o = t.startsWith("update:"), c = o && Sh(s, t.slice(7));
  c && (c.trim && (r = n.map((u) => Ie(u) ? u.trim() : u)), c.number && (r = n.map(To)));
  let i, a = s[i = nr(t)] || // also try camelCase event handler (#2249)
  s[i = nr(gt(t))];
  !a && o && (a = s[i = nr(Wt(t))]), a && vt(
    a,
    e,
    6,
    r
  );
  const l = s[i + "Once"];
  if (l) {
    if (!e.emitted)
      e.emitted = {};
    else if (e.emitted[i])
      return;
    e.emitted[i] = !0, vt(
      l,
      e,
      6,
      r
    );
  }
}
function Bl(e, t, n = !1) {
  const s = t.emitsCache, r = s.get(e);
  if (r !== void 0)
    return r;
  const o = e.emits;
  let c = {}, i = !1;
  if (!le(e)) {
    const a = (l) => {
      const u = Bl(l, t, !0);
      u && (i = !0, ze(c, u));
    };
    !n && t.mixins.length && t.mixins.forEach(a), e.extends && a(e.extends), e.mixins && e.mixins.forEach(a);
  }
  return !o && !i ? (Me(e) && s.set(e, null), null) : (oe(o) ? o.forEach((a) => c[a] = null) : ze(c, o), Me(e) && s.set(e, c), c);
}
function $s(e, t) {
  return !e || !Ms(t) ? !1 : (t = t.slice(2).replace(/Once$/, ""), ye(e, t[0].toLowerCase() + t.slice(1)) || ye(e, Wt(t)) || ye(e, t));
}
function Uc(e) {
  const {
    type: t,
    vnode: n,
    proxy: s,
    withProxy: r,
    propsOptions: [o],
    slots: c,
    attrs: i,
    emit: a,
    render: l,
    renderCache: u,
    props: f,
    data: d,
    setupState: h,
    ctx: m,
    inheritAttrs: x
  } = e, A = Cs(e);
  let v, k;
  try {
    if (n.shapeFlag & 4) {
      const p = r || s, E = p;
      v = At(
        l.call(
          E,
          p,
          u,
          f,
          h,
          d,
          m
        )
      ), k = i;
    } else {
      const p = t;
      v = At(
        p.length > 1 ? p(
          f,
          { attrs: i, slots: c, emit: a }
        ) : p(
          f,
          null
        )
      ), k = t.props ? i : Rh(i);
    }
  } catch (p) {
    Hn.length = 0, qs(p, e, 1), v = Se(st);
  }
  let b = v;
  if (k && x !== !1) {
    const p = Object.keys(k), { shapeFlag: E } = b;
    p.length && E & 7 && (o && p.some(Uo) && (k = Dh(
      k,
      o
    )), b = Zt(b, k, !1, !0));
  }
  return n.dirs && (b = Zt(b, null, !1, !0), b.dirs = b.dirs ? b.dirs.concat(n.dirs) : n.dirs), n.transition && Kn(b, n.transition), v = b, Cs(A), v;
}
const Rh = (e) => {
  let t;
  for (const n in e)
    (n === "class" || n === "style" || Ms(n)) && ((t || (t = {}))[n] = e[n]);
  return t;
}, Dh = (e, t) => {
  const n = {};
  for (const s in e)
    (!Uo(s) || !(s.slice(9) in t)) && (n[s] = e[s]);
  return n;
};
function Mh(e, t, n) {
  const { props: s, children: r, component: o } = e, { props: c, children: i, patchFlag: a } = t, l = o.emitsOptions;
  if (t.dirs || t.transition)
    return !0;
  if (n && a >= 0) {
    if (a & 1024)
      return !0;
    if (a & 16)
      return s ? Hc(s, c, l) : !!c;
    if (a & 8) {
      const u = t.dynamicProps;
      for (let f = 0; f < u.length; f++) {
        const d = u[f];
        if (c[d] !== s[d] && !$s(l, d))
          return !0;
      }
    }
  } else
    return (r || i) && (!i || !i.$stable) ? !0 : s === c ? !1 : s ? c ? Hc(s, c, l) : !0 : !!c;
  return !1;
}
function Hc(e, t, n) {
  const s = Object.keys(t);
  if (s.length !== Object.keys(e).length)
    return !0;
  for (let r = 0; r < s.length; r++) {
    const o = s[r];
    if (t[o] !== e[o] && !$s(n, o))
      return !0;
  }
  return !1;
}
function Ih({ vnode: e, parent: t }, n) {
  for (; t; ) {
    const s = t.subTree;
    if (s.suspense && s.suspense.activeBranch === e && (s.el = e.el), s === e)
      (e = t.vnode).el = n, t = t.parent;
    else
      break;
  }
}
const $l = (e) => e.__isSuspense;
function Nh(e, t) {
  t && t.pendingBranch ? oe(e) ? t.effects.push(...e) : t.effects.push(e) : Hf(e);
}
const Ve = Symbol.for("v-fgt"), zs = Symbol.for("v-txt"), st = Symbol.for("v-cmt"), ur = Symbol.for("v-stc"), Hn = [];
let at = null;
function Q(e = !1) {
  Hn.push(at = e ? null : []);
}
function Lh() {
  Hn.pop(), at = Hn[Hn.length - 1] || null;
}
let Zn = 1;
function Vc(e, t = !1) {
  Zn += e, e < 0 && at && t && (at.hasOnce = !0);
}
function zl(e) {
  return e.dynamicChildren = Zn > 0 ? at || vn : null, Lh(), Zn > 0 && at && at.push(e), e;
}
function ge(e, t, n, s, r, o) {
  return zl(
    Ee(
      e,
      t,
      n,
      s,
      r,
      o,
      !0
    )
  );
}
function Fe(e, t, n, s, r) {
  return zl(
    Se(
      e,
      t,
      n,
      s,
      r,
      !0
    )
  );
}
function Wn(e) {
  return e ? e.__v_isVNode === !0 : !1;
}
function ln(e, t) {
  return e.type === t.type && e.key === t.key;
}
const Ul = ({ key: e }) => e ?? null, vs = ({
  ref: e,
  ref_key: t,
  ref_for: n
}) => (typeof e == "number" && (e = "" + e), e != null ? Ie(e) || $e(e) || le(e) ? { i: Be, r: e, k: t, f: !!n } : e : null);
function Ee(e, t = null, n = null, s = 0, r = null, o = e === Ve ? 0 : 1, c = !1, i = !1) {
  const a = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e,
    props: t,
    key: t && Ul(t),
    ref: t && vs(t),
    scopeId: ll,
    slotScopeIds: null,
    children: n,
    component: null,
    suspense: null,
    ssContent: null,
    ssFallback: null,
    dirs: null,
    transition: null,
    el: null,
    anchor: null,
    target: null,
    targetStart: null,
    targetAnchor: null,
    staticCount: 0,
    shapeFlag: o,
    patchFlag: s,
    dynamicProps: r,
    dynamicChildren: null,
    appContext: null,
    ctx: Be
  };
  return i ? (rc(a, n), o & 128 && e.normalize(a)) : n && (a.shapeFlag |= Ie(n) ? 8 : 16), Zn > 0 && // avoid a block node from tracking itself
  !c && // has current parent block
  at && // presence of a patch flag indicates this node needs patching on updates.
  // component nodes also should always be patched, because even if the
  // component doesn't need to update, it needs to persist the instance on to
  // the next vnode so that it can be properly unmounted later.
  (a.patchFlag > 0 || o & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
  // vnode should not be considered dynamic due to handler caching.
  a.patchFlag !== 32 && at.push(a), a;
}
const Se = Oh;
function Oh(e, t = null, n = null, s = 0, r = null, o = !1) {
  if ((!e || e === yl) && (e = st), Wn(e)) {
    const i = Zt(
      e,
      t,
      !0
      /* mergeRef: true */
    );
    return n && rc(i, n), Zn > 0 && !o && at && (i.shapeFlag & 6 ? at[at.indexOf(e)] = i : at.push(i)), i.patchFlag = -2, i;
  }
  if (jh(e) && (e = e.__vccOpts), t) {
    t = Hl(t);
    let { class: i, style: a } = t;
    i && !Ie(i) && (t.class = Tn(i)), Me(a) && (Qo(a) && !oe(a) && (a = ze({}, a)), t.style = Qn(a));
  }
  const c = Ie(e) ? 1 : $l(e) ? 128 : fl(e) ? 64 : Me(e) ? 4 : le(e) ? 2 : 0;
  return Ee(
    e,
    t,
    n,
    s,
    r,
    c,
    o,
    !0
  );
}
function Hl(e) {
  return e ? Qo(e) || Tl(e) ? ze({}, e) : e : null;
}
function Zt(e, t, n = !1, s = !1) {
  const { props: r, ref: o, patchFlag: c, children: i, transition: a } = e, l = t ? oc(r || {}, t) : r, u = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e.type,
    props: l,
    key: l && Ul(l),
    ref: t && t.ref ? (
      // #2078 in the case of <component :is="vnode" ref="extra"/>
      // if the vnode itself already has a ref, cloneVNode will need to merge
      // the refs so the single vnode can be set on multiple refs
      n && o ? oe(o) ? o.concat(vs(t)) : [o, vs(t)] : vs(t)
    ) : o,
    scopeId: e.scopeId,
    slotScopeIds: e.slotScopeIds,
    children: i,
    target: e.target,
    targetStart: e.targetStart,
    targetAnchor: e.targetAnchor,
    staticCount: e.staticCount,
    shapeFlag: e.shapeFlag,
    // if the vnode is cloned with extra props, we can no longer assume its
    // existing patch flag to be reliable and need to add the FULL_PROPS flag.
    // note: preserve flag for fragments since they use the flag for children
    // fast paths only.
    patchFlag: t && e.type !== Ve ? c === -1 ? 16 : c | 16 : c,
    dynamicProps: e.dynamicProps,
    dynamicChildren: e.dynamicChildren,
    appContext: e.appContext,
    dirs: e.dirs,
    transition: a,
    // These should technically only be non-null on mounted VNodes. However,
    // they *should* be copied for kept-alive vnodes. So we just always copy
    // them since them being non-null during a mount doesn't affect the logic as
    // they will simply be overwritten.
    component: e.component,
    suspense: e.suspense,
    ssContent: e.ssContent && Zt(e.ssContent),
    ssFallback: e.ssFallback && Zt(e.ssFallback),
    el: e.el,
    anchor: e.anchor,
    ctx: e.ctx,
    ce: e.ce
  };
  return a && s && Kn(
    u,
    a.clone(u)
  ), u;
}
function Us(e = " ", t = 0) {
  return Se(zs, null, e, t);
}
function lt(e = "", t = !1) {
  return t ? (Q(), Fe(st, null, e)) : Se(st, null, e);
}
function At(e) {
  return e == null || typeof e == "boolean" ? Se(st) : oe(e) ? Se(
    Ve,
    null,
    // #3666, avoid reference pollution when reusing vnode
    e.slice()
  ) : Wn(e) ? Vt(e) : Se(zs, null, String(e));
}
function Vt(e) {
  return e.el === null && e.patchFlag !== -1 || e.memo ? e : Zt(e);
}
function rc(e, t) {
  let n = 0;
  const { shapeFlag: s } = e;
  if (t == null)
    t = null;
  else if (oe(t))
    n = 16;
  else if (typeof t == "object")
    if (s & 65) {
      const r = t.default;
      r && (r._c && (r._d = !1), rc(e, r()), r._c && (r._d = !0));
      return;
    } else {
      n = 32;
      const r = t._;
      !r && !Tl(t) ? t._ctx = Be : r === 3 && Be && (Be.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024));
    }
  else le(t) ? (t = { default: t, _ctx: Be }, n = 32) : (t = String(t), s & 64 ? (n = 16, t = [Us(t)]) : n = 8);
  e.children = t, e.shapeFlag |= n;
}
function oc(...e) {
  const t = {};
  for (let n = 0; n < e.length; n++) {
    const s = e[n];
    for (const r in s)
      if (r === "class")
        t.class !== s.class && (t.class = Tn([t.class, s.class]));
      else if (r === "style")
        t.style = Qn([t.style, s.style]);
      else if (Ms(r)) {
        const o = t[r], c = s[r];
        c && o !== c && !(oe(o) && o.includes(c)) && (t[r] = o ? [].concat(o, c) : c);
      } else r !== "" && (t[r] = s[r]);
  }
  return t;
}
function Et(e, t, n, s = null) {
  vt(e, t, 7, [
    n,
    s
  ]);
}
const Fh = Al();
let qh = 0;
function Ph(e, t, n) {
  const s = e.type, r = (t ? t.appContext : e.appContext) || Fh, o = {
    uid: qh++,
    vnode: e,
    type: s,
    parent: t,
    appContext: r,
    root: null,
    // to be immediately set
    next: null,
    subTree: null,
    // will be set synchronously right after creation
    effect: null,
    update: null,
    // will be set synchronously right after creation
    job: null,
    scope: new af(
      !0
      /* detached */
    ),
    render: null,
    proxy: null,
    exposed: null,
    exposeProxy: null,
    withProxy: null,
    provides: t ? t.provides : Object.create(r.provides),
    ids: t ? t.ids : ["", 0, 0],
    accessCache: null,
    renderCache: [],
    // local resolved assets
    components: null,
    directives: null,
    // resolved props and emits options
    propsOptions: Dl(s, r),
    emitsOptions: Bl(s, r),
    // emit
    emit: null,
    // to be set immediately
    emitted: null,
    // props default value
    propsDefaults: we,
    // inheritAttrs
    inheritAttrs: s.inheritAttrs,
    // state
    ctx: we,
    data: we,
    props: we,
    attrs: we,
    slots: we,
    refs: we,
    setupState: we,
    setupContext: null,
    // suspense related
    suspense: n,
    suspenseId: n ? n.pendingId : 0,
    asyncDep: null,
    asyncResolved: !1,
    // lifecycle hooks
    // not using enums here because it results in computed properties
    isMounted: !1,
    isUnmounted: !1,
    isDeactivated: !1,
    bc: null,
    c: null,
    bm: null,
    m: null,
    bu: null,
    u: null,
    um: null,
    bum: null,
    da: null,
    a: null,
    rtg: null,
    rtc: null,
    ec: null,
    sp: null
  };
  return o.ctx = { _: o }, o.root = t ? t.root : o, o.emit = Th.bind(null, o), e.ce && e.ce(o), o;
}
let je = null;
const Bh = () => je || Be;
let Ts, Po;
{
  const e = Os(), t = (n, s) => {
    let r;
    return (r = e[n]) || (r = e[n] = []), r.push(s), (o) => {
      r.length > 1 ? r.forEach((c) => c(o)) : r[0](o);
    };
  };
  Ts = t(
    "__VUE_INSTANCE_SETTERS__",
    (n) => je = n
  ), Po = t(
    "__VUE_SSR_SETTERS__",
    (n) => Jn = n
  );
}
const ts = (e) => {
  const t = je;
  return Ts(e), e.scope.on(), () => {
    e.scope.off(), Ts(t);
  };
}, jc = () => {
  je && je.scope.off(), Ts(null);
};
function Vl(e) {
  return e.vnode.shapeFlag & 4;
}
let Jn = !1;
function $h(e, t = !1, n = !1) {
  t && Po(t);
  const { props: s, children: r } = e.vnode, o = Vl(e);
  ph(e, s, o, t), bh(e, r, n);
  const c = o ? zh(e, t) : void 0;
  return t && Po(!1), c;
}
function zh(e, t) {
  const n = e.type;
  e.accessCache = /* @__PURE__ */ Object.create(null), e.proxy = new Proxy(e.ctx, oh);
  const { setup: s } = n;
  if (s) {
    Jt();
    const r = e.setupContext = s.length > 1 ? Hh(e) : null, o = ts(e), c = es(
      s,
      e,
      0,
      [
        e.props,
        r
      ]
    ), i = Fa(c);
    if (Yt(), o(), (i || e.sp) && !En(e) && ml(e), i) {
      if (c.then(jc, jc), t)
        return c.then((a) => {
          Gc(e, a);
        }).catch((a) => {
          qs(a, e, 0);
        });
      e.asyncDep = c;
    } else
      Gc(e, c);
  } else
    jl(e);
}
function Gc(e, t, n) {
  le(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : Me(t) && (e.setupState = rl(t)), jl(e);
}
function jl(e, t, n) {
  const s = e.type;
  e.render || (e.render = s.render || Tt);
  {
    const r = ts(e);
    Jt();
    try {
      ch(e);
    } finally {
      Yt(), r();
    }
  }
}
const Uh = {
  get(e, t) {
    return Ze(e, "get", ""), e[t];
  }
};
function Hh(e) {
  const t = (n) => {
    e.exposed = n || {};
  };
  return {
    attrs: new Proxy(e.attrs, Uh),
    slots: e.slots,
    emit: e.emit,
    expose: t
  };
}
function Hs(e) {
  return e.exposed ? e.exposeProxy || (e.exposeProxy = new Proxy(rl(Df(e.exposed)), {
    get(t, n) {
      if (n in t)
        return t[n];
      if (n in Un)
        return Un[n](e);
    },
    has(t, n) {
      return n in t || n in Un;
    }
  })) : e.proxy;
}
function Vh(e, t = !0) {
  return le(e) ? e.displayName || e.name : e.name || t && e.__name;
}
function jh(e) {
  return le(e) && "__vccOpts" in e;
}
const nt = (e, t) => Pf(e, t, Jn);
function Gl(e, t, n) {
  const s = arguments.length;
  return s === 2 ? Me(t) && !oe(t) ? Wn(t) ? Se(e, null, [t]) : Se(e, t) : Se(e, null, t) : (s > 3 ? n = Array.prototype.slice.call(arguments, 2) : s === 3 && Wn(n) && (n = [n]), Se(e, t, n));
}
const Gh = "3.5.13";
/**
* @vue/runtime-dom v3.5.13
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let Bo;
const Kc = typeof window < "u" && window.trustedTypes;
if (Kc)
  try {
    Bo = /* @__PURE__ */ Kc.createPolicy("vue", {
      createHTML: (e) => e
    });
  } catch {
  }
const Kl = Bo ? (e) => Bo.createHTML(e) : (e) => e, Kh = "http://www.w3.org/2000/svg", Zh = "http://www.w3.org/1998/Math/MathML", Nt = typeof document < "u" ? document : null, Zc = Nt && /* @__PURE__ */ Nt.createElement("template"), Wh = {
  insert: (e, t, n) => {
    t.insertBefore(e, n || null);
  },
  remove: (e) => {
    const t = e.parentNode;
    t && t.removeChild(e);
  },
  createElement: (e, t, n, s) => {
    const r = t === "svg" ? Nt.createElementNS(Kh, e) : t === "mathml" ? Nt.createElementNS(Zh, e) : n ? Nt.createElement(e, { is: n }) : Nt.createElement(e);
    return e === "select" && s && s.multiple != null && r.setAttribute("multiple", s.multiple), r;
  },
  createText: (e) => Nt.createTextNode(e),
  createComment: (e) => Nt.createComment(e),
  setText: (e, t) => {
    e.nodeValue = t;
  },
  setElementText: (e, t) => {
    e.textContent = t;
  },
  parentNode: (e) => e.parentNode,
  nextSibling: (e) => e.nextSibling,
  querySelector: (e) => Nt.querySelector(e),
  setScopeId(e, t) {
    e.setAttribute(t, "");
  },
  // __UNSAFE__
  // Reason: innerHTML.
  // Static content here can only come from compiled templates.
  // As long as the user only uses trusted templates, this is safe.
  insertStaticContent(e, t, n, s, r, o) {
    const c = n ? n.previousSibling : t.lastChild;
    if (r && (r === o || r.nextSibling))
      for (; t.insertBefore(r.cloneNode(!0), n), !(r === o || !(r = r.nextSibling)); )
        ;
    else {
      Zc.innerHTML = Kl(
        s === "svg" ? `<svg>${e}</svg>` : s === "mathml" ? `<math>${e}</math>` : e
      );
      const i = Zc.content;
      if (s === "svg" || s === "mathml") {
        const a = i.firstChild;
        for (; a.firstChild; )
          i.appendChild(a.firstChild);
        i.removeChild(a);
      }
      t.insertBefore(i, n);
    }
    return [
      // first
      c ? c.nextSibling : t.firstChild,
      // last
      n ? n.previousSibling : t.lastChild
    ];
  }
}, zt = "transition", Nn = "animation", Yn = Symbol("_vtc"), Zl = {
  name: String,
  type: String,
  css: {
    type: Boolean,
    default: !0
  },
  duration: [String, Number, Object],
  enterFromClass: String,
  enterActiveClass: String,
  enterToClass: String,
  appearFromClass: String,
  appearActiveClass: String,
  appearToClass: String,
  leaveFromClass: String,
  leaveActiveClass: String,
  leaveToClass: String
}, Jh = /* @__PURE__ */ ze(
  {},
  hl,
  Zl
), Yh = (e) => (e.displayName = "Transition", e.props = Jh, e), Wc = /* @__PURE__ */ Yh(
  (e, { slots: t }) => Gl(Kf, Xh(e), t)
), rn = (e, t = []) => {
  oe(e) ? e.forEach((n) => n(...t)) : e && e(...t);
}, Jc = (e) => e ? oe(e) ? e.some((t) => t.length > 1) : e.length > 1 : !1;
function Xh(e) {
  const t = {};
  for (const I in e)
    I in Zl || (t[I] = e[I]);
  if (e.css === !1)
    return t;
  const {
    name: n = "v",
    type: s,
    duration: r,
    enterFromClass: o = `${n}-enter-from`,
    enterActiveClass: c = `${n}-enter-active`,
    enterToClass: i = `${n}-enter-to`,
    appearFromClass: a = o,
    appearActiveClass: l = c,
    appearToClass: u = i,
    leaveFromClass: f = `${n}-leave-from`,
    leaveActiveClass: d = `${n}-leave-active`,
    leaveToClass: h = `${n}-leave-to`
  } = e, m = Qh(r), x = m && m[0], A = m && m[1], {
    onBeforeEnter: v,
    onEnter: k,
    onEnterCancelled: b,
    onLeave: p,
    onLeaveCancelled: E,
    onBeforeAppear: C = v,
    onAppear: z = k,
    onAppearCancelled: T = b
  } = t, R = (I, se, S, B) => {
    I._enterCancelled = B, on(I, se ? u : i), on(I, se ? l : c), S && S();
  }, M = (I, se) => {
    I._isLeaving = !1, on(I, f), on(I, h), on(I, d), se && se();
  }, q = (I) => (se, S) => {
    const B = I ? z : k, K = () => R(se, I, S);
    rn(B, [se, K]), Yc(() => {
      on(se, I ? a : o), It(se, I ? u : i), Jc(B) || Xc(se, s, x, K);
    });
  };
  return ze(t, {
    onBeforeEnter(I) {
      rn(v, [I]), It(I, o), It(I, c);
    },
    onBeforeAppear(I) {
      rn(C, [I]), It(I, a), It(I, l);
    },
    onEnter: q(!1),
    onAppear: q(!0),
    onLeave(I, se) {
      I._isLeaving = !0;
      const S = () => M(I, se);
      It(I, f), I._enterCancelled ? (It(I, d), ti()) : (ti(), It(I, d)), Yc(() => {
        I._isLeaving && (on(I, f), It(I, h), Jc(p) || Xc(I, s, A, S));
      }), rn(p, [I, S]);
    },
    onEnterCancelled(I) {
      R(I, !1, void 0, !0), rn(b, [I]);
    },
    onAppearCancelled(I) {
      R(I, !0, void 0, !0), rn(T, [I]);
    },
    onLeaveCancelled(I) {
      M(I), rn(E, [I]);
    }
  });
}
function Qh(e) {
  if (e == null)
    return null;
  if (Me(e))
    return [fr(e.enter), fr(e.leave)];
  {
    const t = fr(e);
    return [t, t];
  }
}
function fr(e) {
  return ef(e);
}
function It(e, t) {
  t.split(/\s+/).forEach((n) => n && e.classList.add(n)), (e[Yn] || (e[Yn] = /* @__PURE__ */ new Set())).add(t);
}
function on(e, t) {
  t.split(/\s+/).forEach((s) => s && e.classList.remove(s));
  const n = e[Yn];
  n && (n.delete(t), n.size || (e[Yn] = void 0));
}
function Yc(e) {
  requestAnimationFrame(() => {
    requestAnimationFrame(e);
  });
}
let ed = 0;
function Xc(e, t, n, s) {
  const r = e._endId = ++ed, o = () => {
    r === e._endId && s();
  };
  if (n != null)
    return setTimeout(o, n);
  const { type: c, timeout: i, propCount: a } = td(e, t);
  if (!c)
    return s();
  const l = c + "end";
  let u = 0;
  const f = () => {
    e.removeEventListener(l, d), o();
  }, d = (h) => {
    h.target === e && ++u >= a && f();
  };
  setTimeout(() => {
    u < a && f();
  }, i + 1), e.addEventListener(l, d);
}
function td(e, t) {
  const n = window.getComputedStyle(e), s = (m) => (n[m] || "").split(", "), r = s(`${zt}Delay`), o = s(`${zt}Duration`), c = Qc(r, o), i = s(`${Nn}Delay`), a = s(`${Nn}Duration`), l = Qc(i, a);
  let u = null, f = 0, d = 0;
  t === zt ? c > 0 && (u = zt, f = c, d = o.length) : t === Nn ? l > 0 && (u = Nn, f = l, d = a.length) : (f = Math.max(c, l), u = f > 0 ? c > l ? zt : Nn : null, d = u ? u === zt ? o.length : a.length : 0);
  const h = u === zt && /\b(transform|all)(,|$)/.test(
    s(`${zt}Property`).toString()
  );
  return {
    type: u,
    timeout: f,
    propCount: d,
    hasTransform: h
  };
}
function Qc(e, t) {
  for (; e.length < t.length; )
    e = e.concat(e);
  return Math.max(...t.map((n, s) => ei(n) + ei(e[s])));
}
function ei(e) {
  return e === "auto" ? 0 : Number(e.slice(0, -1).replace(",", ".")) * 1e3;
}
function ti() {
  return document.body.offsetHeight;
}
function nd(e, t, n) {
  const s = e[Yn];
  s && (t = (t ? [t, ...s] : [...s]).join(" ")), t == null ? e.removeAttribute("class") : n ? e.setAttribute("class", t) : e.className = t;
}
const Rs = Symbol("_vod"), Wl = Symbol("_vsh"), sd = {
  beforeMount(e, { value: t }, { transition: n }) {
    e[Rs] = e.style.display === "none" ? "" : e.style.display, n && t ? n.beforeEnter(e) : Ln(e, t);
  },
  mounted(e, { value: t }, { transition: n }) {
    n && t && n.enter(e);
  },
  updated(e, { value: t, oldValue: n }, { transition: s }) {
    !t != !n && (s ? t ? (s.beforeEnter(e), Ln(e, !0), s.enter(e)) : s.leave(e, () => {
      Ln(e, !1);
    }) : Ln(e, t));
  },
  beforeUnmount(e, { value: t }) {
    Ln(e, t);
  }
};
function Ln(e, t) {
  e.style.display = t ? e[Rs] : "none", e[Wl] = !t;
}
const rd = Symbol(""), od = /(^|;)\s*display\s*:/;
function cd(e, t, n) {
  const s = e.style, r = Ie(n);
  let o = !1;
  if (n && !r) {
    if (t)
      if (Ie(t))
        for (const c of t.split(";")) {
          const i = c.slice(0, c.indexOf(":")).trim();
          n[i] == null && ys(s, i, "");
        }
      else
        for (const c in t)
          n[c] == null && ys(s, c, "");
    for (const c in n)
      c === "display" && (o = !0), ys(s, c, n[c]);
  } else if (r) {
    if (t !== n) {
      const c = s[rd];
      c && (n += ";" + c), s.cssText = n, o = od.test(n);
    }
  } else t && e.removeAttribute("style");
  Rs in e && (e[Rs] = o ? s.display : "", e[Wl] && (s.display = "none"));
}
const ni = /\s*!important$/;
function ys(e, t, n) {
  if (oe(n))
    n.forEach((s) => ys(e, t, s));
  else if (n == null && (n = ""), t.startsWith("--"))
    e.setProperty(t, n);
  else {
    const s = id(e, t);
    ni.test(n) ? e.setProperty(
      Wt(s),
      n.replace(ni, ""),
      "important"
    ) : e[s] = n;
  }
}
const si = ["Webkit", "Moz", "ms"], hr = {};
function id(e, t) {
  const n = hr[t];
  if (n)
    return n;
  let s = gt(t);
  if (s !== "filter" && s in e)
    return hr[t] = s;
  s = Ls(s);
  for (let r = 0; r < si.length; r++) {
    const o = si[r] + s;
    if (o in e)
      return hr[t] = o;
  }
  return t;
}
const ri = "http://www.w3.org/1999/xlink";
function oi(e, t, n, s, r, o = cf(t)) {
  s && t.startsWith("xlink:") ? n == null ? e.removeAttributeNS(ri, t.slice(6, t.length)) : e.setAttributeNS(ri, t, n) : n == null || o && !$a(n) ? e.removeAttribute(t) : e.setAttribute(
    t,
    o ? "" : qt(n) ? String(n) : n
  );
}
function ci(e, t, n, s, r) {
  if (t === "innerHTML" || t === "textContent") {
    n != null && (e[t] = t === "innerHTML" ? Kl(n) : n);
    return;
  }
  const o = e.tagName;
  if (t === "value" && o !== "PROGRESS" && // custom elements may use _value internally
  !o.includes("-")) {
    const i = o === "OPTION" ? e.getAttribute("value") || "" : e.value, a = n == null ? (
      // #11647: value should be set as empty string for null and undefined,
      // but <input type="checkbox"> should be set as 'on'.
      e.type === "checkbox" ? "on" : ""
    ) : String(n);
    (i !== a || !("_value" in e)) && (e.value = a), n == null && e.removeAttribute(t), e._value = n;
    return;
  }
  let c = !1;
  if (n === "" || n == null) {
    const i = typeof e[t];
    i === "boolean" ? n = $a(n) : n == null && i === "string" ? (n = "", c = !0) : i === "number" && (n = 0, c = !0);
  }
  try {
    e[t] = n;
  } catch {
  }
  c && e.removeAttribute(r || t);
}
function bn(e, t, n, s) {
  e.addEventListener(t, n, s);
}
function ad(e, t, n, s) {
  e.removeEventListener(t, n, s);
}
const ii = Symbol("_vei");
function ld(e, t, n, s, r = null) {
  const o = e[ii] || (e[ii] = {}), c = o[t];
  if (s && c)
    c.value = s;
  else {
    const [i, a] = ud(t);
    if (s) {
      const l = o[t] = dd(
        s,
        r
      );
      bn(e, i, l, a);
    } else c && (ad(e, i, c, a), o[t] = void 0);
  }
}
const ai = /(?:Once|Passive|Capture)$/;
function ud(e) {
  let t;
  if (ai.test(e)) {
    t = {};
    let s;
    for (; s = e.match(ai); )
      e = e.slice(0, e.length - s[0].length), t[s[0].toLowerCase()] = !0;
  }
  return [e[2] === ":" ? e.slice(3) : Wt(e.slice(2)), t];
}
let dr = 0;
const fd = /* @__PURE__ */ Promise.resolve(), hd = () => dr || (fd.then(() => dr = 0), dr = Date.now());
function dd(e, t) {
  const n = (s) => {
    if (!s._vts)
      s._vts = Date.now();
    else if (s._vts <= n.attached)
      return;
    vt(
      pd(s, n.value),
      t,
      5,
      [s]
    );
  };
  return n.value = e, n.attached = hd(), n;
}
function pd(e, t) {
  if (oe(t)) {
    const n = e.stopImmediatePropagation;
    return e.stopImmediatePropagation = () => {
      n.call(e), e._stopped = !0;
    }, t.map(
      (s) => (r) => !r._stopped && s && s(r)
    );
  } else
    return t;
}
const li = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // lowercase letter
e.charCodeAt(2) > 96 && e.charCodeAt(2) < 123, gd = (e, t, n, s, r, o) => {
  const c = r === "svg";
  t === "class" ? nd(e, s, c) : t === "style" ? cd(e, n, s) : Ms(t) ? Uo(t) || ld(e, t, n, s, o) : (t[0] === "." ? (t = t.slice(1), !0) : t[0] === "^" ? (t = t.slice(1), !1) : _d(e, t, s, c)) ? (ci(e, t, s), !e.tagName.includes("-") && (t === "value" || t === "checked" || t === "selected") && oi(e, t, s, c, o, t !== "value")) : /* #11081 force set props for possible async custom element */ e._isVueCE && (/[A-Z]/.test(t) || !Ie(s)) ? ci(e, gt(t), s, o, t) : (t === "true-value" ? e._trueValue = s : t === "false-value" && (e._falseValue = s), oi(e, t, s, c));
};
function _d(e, t, n, s) {
  if (s)
    return !!(t === "innerHTML" || t === "textContent" || t in e && li(t) && le(n));
  if (t === "spellcheck" || t === "draggable" || t === "translate" || t === "form" || t === "list" && e.tagName === "INPUT" || t === "type" && e.tagName === "TEXTAREA")
    return !1;
  if (t === "width" || t === "height") {
    const r = e.tagName;
    if (r === "IMG" || r === "VIDEO" || r === "CANVAS" || r === "SOURCE")
      return !1;
  }
  return li(t) && Ie(n) ? !1 : t in e;
}
const ui = (e) => {
  const t = e.props["onUpdate:modelValue"] || !1;
  return oe(t) ? (n) => ms(t, n) : t;
};
function md(e) {
  e.target.composing = !0;
}
function fi(e) {
  const t = e.target;
  t.composing && (t.composing = !1, t.dispatchEvent(new Event("input")));
}
const pr = Symbol("_assign"), bd = {
  created(e, { modifiers: { lazy: t, trim: n, number: s } }, r) {
    e[pr] = ui(r);
    const o = s || r.props && r.props.type === "number";
    bn(e, t ? "change" : "input", (c) => {
      if (c.target.composing) return;
      let i = e.value;
      n && (i = i.trim()), o && (i = To(i)), e[pr](i);
    }), n && bn(e, "change", () => {
      e.value = e.value.trim();
    }), t || (bn(e, "compositionstart", md), bn(e, "compositionend", fi), bn(e, "change", fi));
  },
  // set value on mounted so it's after min/max for type="range"
  mounted(e, { value: t }) {
    e.value = t ?? "";
  },
  beforeUpdate(e, { value: t, oldValue: n, modifiers: { lazy: s, trim: r, number: o } }, c) {
    if (e[pr] = ui(c), e.composing) return;
    const i = (o || e.type === "number") && !/^0\d/.test(e.value) ? To(e.value) : e.value, a = t ?? "";
    i !== a && (document.activeElement === e && e.type !== "range" && (s && t === n || r && e.value.trim() === a) || (e.value = a));
  }
}, vd = ["ctrl", "shift", "alt", "meta"], yd = {
  stop: (e) => e.stopPropagation(),
  prevent: (e) => e.preventDefault(),
  self: (e) => e.target !== e.currentTarget,
  ctrl: (e) => !e.ctrlKey,
  shift: (e) => !e.shiftKey,
  alt: (e) => !e.altKey,
  meta: (e) => !e.metaKey,
  left: (e) => "button" in e && e.button !== 0,
  middle: (e) => "button" in e && e.button !== 1,
  right: (e) => "button" in e && e.button !== 2,
  exact: (e, t) => vd.some((n) => e[`${n}Key`] && !t.includes(n))
}, Jl = (e, t) => {
  const n = e._withMods || (e._withMods = {}), s = t.join(".");
  return n[s] || (n[s] = (r, ...o) => {
    for (let c = 0; c < t.length; c++) {
      const i = yd[t[c]];
      if (i && i(r, t)) return;
    }
    return e(r, ...o);
  });
}, xd = {
  esc: "escape",
  space: " ",
  up: "arrow-up",
  left: "arrow-left",
  right: "arrow-right",
  down: "arrow-down",
  delete: "backspace"
}, kd = (e, t) => {
  const n = e._withKeys || (e._withKeys = {}), s = t.join(".");
  return n[s] || (n[s] = (r) => {
    if (!("key" in r))
      return;
    const o = Wt(r.key);
    if (t.some(
      (c) => c === o || xd[c] === o
    ))
      return e(r);
  });
}, Ed = /* @__PURE__ */ ze({ patchProp: gd }, Wh);
let hi;
function Cd() {
  return hi || (hi = yh(Ed));
}
const Ad = (...e) => {
  const t = Cd().createApp(...e), { mount: n } = t;
  return t.mount = (s) => {
    const r = Sd(s);
    if (!r) return;
    const o = t._component;
    !le(o) && !o.render && !o.template && (o.template = r.innerHTML), r.nodeType === 1 && (r.textContent = "");
    const c = n(r, !1, wd(r));
    return r instanceof Element && (r.removeAttribute("v-cloak"), r.setAttribute("data-v-app", "")), c;
  }, t;
};
function wd(e) {
  if (e instanceof SVGElement)
    return "svg";
  if (typeof MathMLElement == "function" && e instanceof MathMLElement)
    return "mathml";
}
function Sd(e) {
  return Ie(e) ? document.querySelector(e) : e;
}
const On = {
  webhookUrl: "http://localhost:5678",
  webhookConfig: {
    method: "POST",
    headers: {}
  },
  target: "#n8n-chat",
  mode: "window",
  loadPreviousSession: !0,
  chatInputKey: "chatInput",
  chatSessionKey: "sessionId",
  defaultLanguage: "en",
  showWelcomeScreen: !1,
  initialMessages: ["Hi there! 👋", "My name is Nathan. How can I assist you today?"],
  i18n: {
    en: {
      title: "Hi there! 👋",
      subtitle: "Start a chat. We're here to help you 24/7.",
      footer: "",
      getStarted: "New Conversation",
      inputPlaceholder: "Type your question..",
      closeButtonTooltip: "Close chat"
    }
  },
  theme: {}
}, Td = "#n8n-chat", Rd = "n8n-chat", di = `${Rd}/sessionId`, Yl = "Chat", Xl = "ChatOptions";
var He = [];
for (var gr = 0; gr < 256; ++gr)
  He.push((gr + 256).toString(16).slice(1));
function Dd(e, t = 0) {
  return (He[e[t + 0]] + He[e[t + 1]] + He[e[t + 2]] + He[e[t + 3]] + "-" + He[e[t + 4]] + He[e[t + 5]] + "-" + He[e[t + 6]] + He[e[t + 7]] + "-" + He[e[t + 8]] + He[e[t + 9]] + "-" + He[e[t + 10]] + He[e[t + 11]] + He[e[t + 12]] + He[e[t + 13]] + He[e[t + 14]] + He[e[t + 15]]).toLowerCase();
}
var ds, Md = new Uint8Array(16);
function Id() {
  if (!ds && (ds = typeof crypto < "u" && crypto.getRandomValues && crypto.getRandomValues.bind(crypto), !ds))
    throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
  return ds(Md);
}
var Nd = typeof crypto < "u" && crypto.randomUUID && crypto.randomUUID.bind(crypto);
const pi = {
  randomUUID: Nd
};
function Fn(e, t, n) {
  if (pi.randomUUID && !e)
    return pi.randomUUID();
  e = e || {};
  var s = e.random || (e.rng || Id)();
  return s[6] = s[6] & 15 | 64, s[8] = s[8] & 63 | 128, Dd(s);
}
async function Ld() {
  return "";
}
async function cc(...e) {
  var o, c;
  const t = await Ld(), n = (o = e[1]) == null ? void 0 : o.body, s = {
    ...t ? { authorization: `Bearer ${t}` } : {},
    ...(c = e[1]) == null ? void 0 : c.headers
  };
  return n instanceof FormData ? delete s["Content-Type"] : s["Content-Type"] = "application/json", await (await fetch(e[0], {
    ...e[1],
    mode: "cors",
    cache: "no-cache",
    headers: s
  })).json();
}
async function Ql(e, t = {}, n = {}) {
  let s = e;
  return Object.keys(t).length > 0 && (s = `${s}?${new URLSearchParams(
    t
  ).toString()}`), await cc(s, { ...n, method: "GET" });
}
async function eu(e, t = {}, n = {}) {
  return await cc(e, {
    ...n,
    method: "POST",
    body: JSON.stringify(t)
  });
}
async function Od(e, t = {}, n = [], s = {}) {
  const r = new FormData();
  for (const o in t)
    r.append(o, t[o]);
  for (const o of n)
    r.append("files", o);
  return await cc(e, {
    ...s,
    method: "POST",
    body: r
  });
}
async function Fd(e, t) {
  var s, r;
  return await (((s = t.webhookConfig) == null ? void 0 : s.method) === "POST" ? eu : Ql)(
    `${t.webhookUrl}`,
    {
      action: "loadPreviousSession",
      [t.chatSessionKey]: e,
      ...t.metadata ? { metadata: t.metadata } : {}
    },
    {
      headers: (r = t.webhookConfig) == null ? void 0 : r.headers
    }
  );
}
async function qd(e, t, n, s) {
  var o, c, i;
  return t.length > 0 ? await Od(
    `${s.webhookUrl}`,
    {
      action: "sendMessage",
      [s.chatSessionKey]: n,
      [s.chatInputKey]: e,
      ...s.metadata ? { metadata: s.metadata } : {}
    },
    t,
    {
      headers: (o = s.webhookConfig) == null ? void 0 : o.headers
    }
  ) : await (((c = s.webhookConfig) == null ? void 0 : c.method) === "POST" ? eu : Ql)(
    `${s.webhookUrl}`,
    {
      action: "sendMessage",
      [s.chatSessionKey]: n,
      [s.chatInputKey]: e,
      ...s.metadata ? { metadata: s.metadata } : {}
    },
    {
      headers: (i = s.webhookConfig) == null ? void 0 : i.headers
    }
  );
}
function Pd() {
  const e = /* @__PURE__ */ new Map();
  function t(r, o) {
    const c = e.get(r);
    c && c.splice(c.indexOf(o) >>> 0, 1);
  }
  function n(r, o) {
    let c = e.get(r);
    return c ? c.push(o) : c = [o], e.set(r, c), () => t(r, o);
  }
  function s(r, o) {
    const c = e.get(r);
    c && c.slice().forEach(async (i) => {
      await i(o);
    });
  }
  return {
    on: n,
    off: t,
    emit: s
  };
}
function Bd(e) {
  if (!document.querySelector(e)) {
    const n = document.createElement("div");
    e.startsWith("#") && (n.id = e.replace("#", "")), e.startsWith(".") && n.classList.add(e.replace(".", "")), document.body.appendChild(n);
  }
}
const ot = Pd(), $d = {
  install(e, t) {
    e.provide(Xl, t);
    const n = Je([]), s = Je(null), r = Je(!1), o = nt(
      () => (t.initialMessages ?? []).map((u) => ({
        id: Fn(),
        text: u,
        sender: "bot"
      }))
    );
    async function c(u, f = []) {
      const d = {
        id: Fn(),
        text: u,
        sender: "user",
        files: f
      };
      n.value.push(d), r.value = !0, Sn(() => {
        ot.emit("scrollToBottom");
      });
      const h = await qd(
        u,
        f,
        s.value,
        t
      );
      let m = h.output ?? h.text ?? "";
      if (m === "" && Object.keys(h).length > 0)
        try {
          m = JSON.stringify(h, null, 2);
        } catch {
        }
      const x = {
        id: Fn(),
        text: m,
        sender: "bot"
      };
      n.value.push(x), r.value = !1, Sn(() => {
        ot.emit("scrollToBottom");
      });
    }
    async function i() {
      if (!t.loadPreviousSession)
        return;
      const u = localStorage.getItem(di) ?? Fn(), f = await Fd(u, t);
      return n.value = ((f == null ? void 0 : f.data) || []).map((d, h) => ({
        id: `${h}`,
        text: d.kwargs.content,
        sender: d.id.includes("HumanMessage") ? "user" : "bot"
      })), n.value.length && (s.value = u), u;
    }
    async function a() {
      s.value = Fn(), localStorage.setItem(di, s.value);
    }
    const l = {
      initialMessages: o,
      messages: n,
      currentSessionId: s,
      waitingForResponse: r,
      loadPreviousSession: i,
      startNewSession: a,
      sendMessage: c
    };
    e.provide(Yl, l), e.config.globalProperties.$chat = l;
  }
};
function ic(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
function zd(e) {
  if (Object.prototype.hasOwnProperty.call(e, "__esModule")) return e;
  var t = e.default;
  if (typeof t == "function") {
    var n = function s() {
      return this instanceof s ? Reflect.construct(t, arguments, this.constructor) : t.apply(this, arguments);
    };
    n.prototype = t.prototype;
  } else n = {};
  return Object.defineProperty(n, "__esModule", { value: !0 }), Object.keys(e).forEach(function(s) {
    var r = Object.getOwnPropertyDescriptor(e, s);
    Object.defineProperty(n, s, r.get ? r : {
      enumerable: !0,
      get: function() {
        return e[s];
      }
    });
  }), n;
}
var _r, gi;
function Ud() {
  if (gi) return _r;
  gi = 1;
  function e(_) {
    return _ instanceof Map ? _.clear = _.delete = _.set = function() {
      throw new Error("map is read-only");
    } : _ instanceof Set && (_.add = _.clear = _.delete = function() {
      throw new Error("set is read-only");
    }), Object.freeze(_), Object.getOwnPropertyNames(_).forEach((D) => {
      const H = _[D], ae = typeof H;
      (ae === "object" || ae === "function") && !Object.isFrozen(H) && e(H);
    }), _;
  }
  class t {
    /**
     * @param {CompiledMode} mode
     */
    constructor(D) {
      D.data === void 0 && (D.data = {}), this.data = D.data, this.isMatchIgnored = !1;
    }
    ignoreMatch() {
      this.isMatchIgnored = !0;
    }
  }
  function n(_) {
    return _.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
  }
  function s(_, ...D) {
    const H = /* @__PURE__ */ Object.create(null);
    for (const ae in _)
      H[ae] = _[ae];
    return D.forEach(function(ae) {
      for (const Ne in ae)
        H[Ne] = ae[Ne];
    }), /** @type {T} */
    H;
  }
  const r = "</span>", o = (_) => !!_.scope, c = (_, { prefix: D }) => {
    if (_.startsWith("language:"))
      return _.replace("language:", "language-");
    if (_.includes(".")) {
      const H = _.split(".");
      return [
        `${D}${H.shift()}`,
        ...H.map((ae, Ne) => `${ae}${"_".repeat(Ne + 1)}`)
      ].join(" ");
    }
    return `${D}${_}`;
  };
  class i {
    /**
     * Creates a new HTMLRenderer
     *
     * @param {Tree} parseTree - the parse tree (must support `walk` API)
     * @param {{classPrefix: string}} options
     */
    constructor(D, H) {
      this.buffer = "", this.classPrefix = H.classPrefix, D.walk(this);
    }
    /**
     * Adds texts to the output stream
     *
     * @param {string} text */
    addText(D) {
      this.buffer += n(D);
    }
    /**
     * Adds a node open to the output stream (if needed)
     *
     * @param {Node} node */
    openNode(D) {
      if (!o(D)) return;
      const H = c(
        D.scope,
        { prefix: this.classPrefix }
      );
      this.span(H);
    }
    /**
     * Adds a node close to the output stream (if needed)
     *
     * @param {Node} node */
    closeNode(D) {
      o(D) && (this.buffer += r);
    }
    /**
     * returns the accumulated buffer
    */
    value() {
      return this.buffer;
    }
    // helpers
    /**
     * Builds a span element
     *
     * @param {string} className */
    span(D) {
      this.buffer += `<span class="${D}">`;
    }
  }
  const a = (_ = {}) => {
    const D = { children: [] };
    return Object.assign(D, _), D;
  };
  class l {
    constructor() {
      this.rootNode = a(), this.stack = [this.rootNode];
    }
    get top() {
      return this.stack[this.stack.length - 1];
    }
    get root() {
      return this.rootNode;
    }
    /** @param {Node} node */
    add(D) {
      this.top.children.push(D);
    }
    /** @param {string} scope */
    openNode(D) {
      const H = a({ scope: D });
      this.add(H), this.stack.push(H);
    }
    closeNode() {
      if (this.stack.length > 1)
        return this.stack.pop();
    }
    closeAllNodes() {
      for (; this.closeNode(); ) ;
    }
    toJSON() {
      return JSON.stringify(this.rootNode, null, 4);
    }
    /**
     * @typedef { import("./html_renderer").Renderer } Renderer
     * @param {Renderer} builder
     */
    walk(D) {
      return this.constructor._walk(D, this.rootNode);
    }
    /**
     * @param {Renderer} builder
     * @param {Node} node
     */
    static _walk(D, H) {
      return typeof H == "string" ? D.addText(H) : H.children && (D.openNode(H), H.children.forEach((ae) => this._walk(D, ae)), D.closeNode(H)), D;
    }
    /**
     * @param {Node} node
     */
    static _collapse(D) {
      typeof D != "string" && D.children && (D.children.every((H) => typeof H == "string") ? D.children = [D.children.join("")] : D.children.forEach((H) => {
        l._collapse(H);
      }));
    }
  }
  class u extends l {
    /**
     * @param {*} options
     */
    constructor(D) {
      super(), this.options = D;
    }
    /**
     * @param {string} text
     */
    addText(D) {
      D !== "" && this.add(D);
    }
    /** @param {string} scope */
    startScope(D) {
      this.openNode(D);
    }
    endScope() {
      this.closeNode();
    }
    /**
     * @param {Emitter & {root: DataNode}} emitter
     * @param {string} name
     */
    __addSublanguage(D, H) {
      const ae = D.root;
      H && (ae.scope = `language:${H}`), this.add(ae);
    }
    toHTML() {
      return new i(this, this.options).value();
    }
    finalize() {
      return this.closeAllNodes(), !0;
    }
  }
  function f(_) {
    return _ ? typeof _ == "string" ? _ : _.source : null;
  }
  function d(_) {
    return x("(?=", _, ")");
  }
  function h(_) {
    return x("(?:", _, ")*");
  }
  function m(_) {
    return x("(?:", _, ")?");
  }
  function x(..._) {
    return _.map((H) => f(H)).join("");
  }
  function A(_) {
    const D = _[_.length - 1];
    return typeof D == "object" && D.constructor === Object ? (_.splice(_.length - 1, 1), D) : {};
  }
  function v(..._) {
    return "(" + (A(_).capture ? "" : "?:") + _.map((ae) => f(ae)).join("|") + ")";
  }
  function k(_) {
    return new RegExp(_.toString() + "|").exec("").length - 1;
  }
  function b(_, D) {
    const H = _ && _.exec(D);
    return H && H.index === 0;
  }
  const p = /\[(?:[^\\\]]|\\.)*\]|\(\??|\\([1-9][0-9]*)|\\./;
  function E(_, { joinWith: D }) {
    let H = 0;
    return _.map((ae) => {
      H += 1;
      const Ne = H;
      let Le = f(ae), X = "";
      for (; Le.length > 0; ) {
        const W = p.exec(Le);
        if (!W) {
          X += Le;
          break;
        }
        X += Le.substring(0, W.index), Le = Le.substring(W.index + W[0].length), W[0][0] === "\\" && W[1] ? X += "\\" + String(Number(W[1]) + Ne) : (X += W[0], W[0] === "(" && H++);
      }
      return X;
    }).map((ae) => `(${ae})`).join(D);
  }
  const C = /\b\B/, z = "[a-zA-Z]\\w*", T = "[a-zA-Z_]\\w*", R = "\\b\\d+(\\.\\d+)?", M = "(-?)(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)", q = "\\b(0b[01]+)", I = "!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~", se = (_ = {}) => {
    const D = /^#![ ]*\//;
    return _.binary && (_.begin = x(
      D,
      /.*\b/,
      _.binary,
      /\b.*/
    )), s({
      scope: "meta",
      begin: D,
      end: /$/,
      relevance: 0,
      /** @type {ModeCallback} */
      "on:begin": (H, ae) => {
        H.index !== 0 && ae.ignoreMatch();
      }
    }, _);
  }, S = {
    begin: "\\\\[\\s\\S]",
    relevance: 0
  }, B = {
    scope: "string",
    begin: "'",
    end: "'",
    illegal: "\\n",
    contains: [S]
  }, K = {
    scope: "string",
    begin: '"',
    end: '"',
    illegal: "\\n",
    contains: [S]
  }, ee = {
    begin: /\b(a|an|the|are|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such|will|you|your|they|like|more)\b/
  }, Z = function(_, D, H = {}) {
    const ae = s(
      {
        scope: "comment",
        begin: _,
        end: D,
        contains: []
      },
      H
    );
    ae.contains.push({
      scope: "doctag",
      // hack to avoid the space from being included. the space is necessary to
      // match here to prevent the plain text rule below from gobbling up doctags
      begin: "[ ]*(?=(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):)",
      end: /(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):/,
      excludeBegin: !0,
      relevance: 0
    });
    const Ne = v(
      // list of common 1 and 2 letter words in English
      "I",
      "a",
      "is",
      "so",
      "us",
      "to",
      "at",
      "if",
      "in",
      "it",
      "on",
      // note: this is not an exhaustive list of contractions, just popular ones
      /[A-Za-z]+['](d|ve|re|ll|t|s|n)/,
      // contractions - can't we'd they're let's, etc
      /[A-Za-z]+[-][a-z]+/,
      // `no-way`, etc.
      /[A-Za-z][a-z]{2,}/
      // allow capitalized words at beginning of sentences
    );
    return ae.contains.push(
      {
        // TODO: how to include ", (, ) without breaking grammars that use these for
        // comment delimiters?
        // begin: /[ ]+([()"]?([A-Za-z'-]{3,}|is|a|I|so|us|[tT][oO]|at|if|in|it|on)[.]?[()":]?([.][ ]|[ ]|\))){3}/
        // ---
        // this tries to find sequences of 3 english words in a row (without any
        // "programming" type syntax) this gives us a strong signal that we've
        // TRULY found a comment - vs perhaps scanning with the wrong language.
        // It's possible to find something that LOOKS like the start of the
        // comment - but then if there is no readable text - good chance it is a
        // false match and not a comment.
        //
        // for a visual example please see:
        // https://github.com/highlightjs/highlight.js/issues/2827
        begin: x(
          /[ ]+/,
          // necessary to prevent us gobbling up doctags like /* @author Bob Mcgill */
          "(",
          Ne,
          /[.]?[:]?([.][ ]|[ ])/,
          "){3}"
        )
        // look for 3 words in a row
      }
    ), ae;
  }, fe = Z("//", "$"), J = Z("/\\*", "\\*/"), Ce = Z("#", "$"), Ae = {
    scope: "number",
    begin: R,
    relevance: 0
  }, rt = {
    scope: "number",
    begin: M,
    relevance: 0
  }, Gs = {
    scope: "number",
    begin: q,
    relevance: 0
  }, Ks = {
    scope: "regexp",
    begin: /\/(?=[^/\n]*\/)/,
    end: /\/[gimuy]*/,
    contains: [
      S,
      {
        begin: /\[/,
        end: /\]/,
        relevance: 0,
        contains: [S]
      }
    ]
  }, Qt = {
    scope: "title",
    begin: z,
    relevance: 0
  }, dn = {
    scope: "title",
    begin: T,
    relevance: 0
  }, Rn = {
    // excludes method names from keyword processing
    begin: "\\.\\s*" + T,
    relevance: 0
  };
  var yt = /* @__PURE__ */ Object.freeze({
    __proto__: null,
    APOS_STRING_MODE: B,
    BACKSLASH_ESCAPE: S,
    BINARY_NUMBER_MODE: Gs,
    BINARY_NUMBER_RE: q,
    COMMENT: Z,
    C_BLOCK_COMMENT_MODE: J,
    C_LINE_COMMENT_MODE: fe,
    C_NUMBER_MODE: rt,
    C_NUMBER_RE: M,
    END_SAME_AS_BEGIN: function(_) {
      return Object.assign(
        _,
        {
          /** @type {ModeCallback} */
          "on:begin": (D, H) => {
            H.data._beginMatch = D[1];
          },
          /** @type {ModeCallback} */
          "on:end": (D, H) => {
            H.data._beginMatch !== D[1] && H.ignoreMatch();
          }
        }
      );
    },
    HASH_COMMENT_MODE: Ce,
    IDENT_RE: z,
    MATCH_NOTHING_RE: C,
    METHOD_GUARD: Rn,
    NUMBER_MODE: Ae,
    NUMBER_RE: R,
    PHRASAL_WORDS_MODE: ee,
    QUOTE_STRING_MODE: K,
    REGEXP_MODE: Ks,
    RE_STARTERS_RE: I,
    SHEBANG: se,
    TITLE_MODE: Qt,
    UNDERSCORE_IDENT_RE: T,
    UNDERSCORE_TITLE_MODE: dn
  });
  function _c(_, D) {
    _.input[_.index - 1] === "." && D.ignoreMatch();
  }
  function g(_, D) {
    _.className !== void 0 && (_.scope = _.className, delete _.className);
  }
  function y(_, D) {
    D && _.beginKeywords && (_.begin = "\\b(" + _.beginKeywords.split(" ").join("|") + ")(?!\\.)(?=\\b|\\s)", _.__beforeBegin = _c, _.keywords = _.keywords || _.beginKeywords, delete _.beginKeywords, _.relevance === void 0 && (_.relevance = 0));
  }
  function w(_, D) {
    Array.isArray(_.illegal) && (_.illegal = v(..._.illegal));
  }
  function O(_, D) {
    if (_.match) {
      if (_.begin || _.end) throw new Error("begin & end are not supported with match");
      _.begin = _.match, delete _.match;
    }
  }
  function N(_, D) {
    _.relevance === void 0 && (_.relevance = 1);
  }
  const L = (_, D) => {
    if (!_.beforeMatch) return;
    if (_.starts) throw new Error("beforeMatch cannot be used with starts");
    const H = Object.assign({}, _);
    Object.keys(_).forEach((ae) => {
      delete _[ae];
    }), _.keywords = H.keywords, _.begin = x(H.beforeMatch, d(H.begin)), _.starts = {
      relevance: 0,
      contains: [
        Object.assign(H, { endsParent: !0 })
      ]
    }, _.relevance = 0, delete H.beforeMatch;
  }, V = [
    "of",
    "and",
    "for",
    "in",
    "not",
    "or",
    "if",
    "then",
    "parent",
    // common variable name
    "list",
    // common variable name
    "value"
    // common variable name
  ], U = "keyword";
  function $(_, D, H = U) {
    const ae = /* @__PURE__ */ Object.create(null);
    return typeof _ == "string" ? Ne(H, _.split(" ")) : Array.isArray(_) ? Ne(H, _) : Object.keys(_).forEach(function(Le) {
      Object.assign(
        ae,
        $(_[Le], D, Le)
      );
    }), ae;
    function Ne(Le, X) {
      D && (X = X.map((W) => W.toLowerCase())), X.forEach(function(W) {
        const ie = W.split("|");
        ae[ie[0]] = [Le, F(ie[0], ie[1])];
      });
    }
  }
  function F(_, D) {
    return D ? Number(D) : re(_) ? 0 : 1;
  }
  function re(_) {
    return V.includes(_.toLowerCase());
  }
  const G = {}, Y = (_) => {
    console.error(_);
  }, ce = (_, ...D) => {
    console.log(`WARN: ${_}`, ...D);
  }, he = (_, D) => {
    G[`${_}/${D}`] || (console.log(`Deprecated as of ${_}. ${D}`), G[`${_}/${D}`] = !0);
  }, ve = new Error();
  function me(_, D, { key: H }) {
    let ae = 0;
    const Ne = _[H], Le = {}, X = {};
    for (let W = 1; W <= D.length; W++)
      X[W + ae] = Ne[W], Le[W + ae] = !0, ae += k(D[W - 1]);
    _[H] = X, _[H]._emit = Le, _[H]._multi = !0;
  }
  function Ye(_) {
    if (Array.isArray(_.begin)) {
      if (_.skip || _.excludeBegin || _.returnBegin)
        throw Y("skip, excludeBegin, returnBegin not compatible with beginScope: {}"), ve;
      if (typeof _.beginScope != "object" || _.beginScope === null)
        throw Y("beginScope must be object"), ve;
      me(_, _.begin, { key: "beginScope" }), _.begin = E(_.begin, { joinWith: "" });
    }
  }
  function Ge(_) {
    if (Array.isArray(_.end)) {
      if (_.skip || _.excludeEnd || _.returnEnd)
        throw Y("skip, excludeEnd, returnEnd not compatible with endScope: {}"), ve;
      if (typeof _.endScope != "object" || _.endScope === null)
        throw Y("endScope must be object"), ve;
      me(_, _.end, { key: "endScope" }), _.end = E(_.end, { joinWith: "" });
    }
  }
  function ut(_) {
    _.scope && typeof _.scope == "object" && _.scope !== null && (_.beginScope = _.scope, delete _.scope);
  }
  function ft(_) {
    ut(_), typeof _.beginScope == "string" && (_.beginScope = { _wrap: _.beginScope }), typeof _.endScope == "string" && (_.endScope = { _wrap: _.endScope }), Ye(_), Ge(_);
  }
  function en(_) {
    function D(X, W) {
      return new RegExp(
        f(X),
        "m" + (_.case_insensitive ? "i" : "") + (_.unicodeRegex ? "u" : "") + (W ? "g" : "")
      );
    }
    class H {
      constructor() {
        this.matchIndexes = {}, this.regexes = [], this.matchAt = 1, this.position = 0;
      }
      // @ts-ignore
      addRule(W, ie) {
        ie.position = this.position++, this.matchIndexes[this.matchAt] = ie, this.regexes.push([ie, W]), this.matchAt += k(W) + 1;
      }
      compile() {
        this.regexes.length === 0 && (this.exec = () => null);
        const W = this.regexes.map((ie) => ie[1]);
        this.matcherRe = D(E(W, { joinWith: "|" }), !0), this.lastIndex = 0;
      }
      /** @param {string} s */
      exec(W) {
        this.matcherRe.lastIndex = this.lastIndex;
        const ie = this.matcherRe.exec(W);
        if (!ie)
          return null;
        const Pe = ie.findIndex((Mn, Js) => Js > 0 && Mn !== void 0), Oe = this.matchIndexes[Pe];
        return ie.splice(0, Pe), Object.assign(ie, Oe);
      }
    }
    class ae {
      constructor() {
        this.rules = [], this.multiRegexes = [], this.count = 0, this.lastIndex = 0, this.regexIndex = 0;
      }
      // @ts-ignore
      getMatcher(W) {
        if (this.multiRegexes[W]) return this.multiRegexes[W];
        const ie = new H();
        return this.rules.slice(W).forEach(([Pe, Oe]) => ie.addRule(Pe, Oe)), ie.compile(), this.multiRegexes[W] = ie, ie;
      }
      resumingScanAtSamePosition() {
        return this.regexIndex !== 0;
      }
      considerAll() {
        this.regexIndex = 0;
      }
      // @ts-ignore
      addRule(W, ie) {
        this.rules.push([W, ie]), ie.type === "begin" && this.count++;
      }
      /** @param {string} s */
      exec(W) {
        const ie = this.getMatcher(this.regexIndex);
        ie.lastIndex = this.lastIndex;
        let Pe = ie.exec(W);
        if (this.resumingScanAtSamePosition() && !(Pe && Pe.index === this.lastIndex)) {
          const Oe = this.getMatcher(0);
          Oe.lastIndex = this.lastIndex + 1, Pe = Oe.exec(W);
        }
        return Pe && (this.regexIndex += Pe.position + 1, this.regexIndex === this.count && this.considerAll()), Pe;
      }
    }
    function Ne(X) {
      const W = new ae();
      return X.contains.forEach((ie) => W.addRule(ie.begin, { rule: ie, type: "begin" })), X.terminatorEnd && W.addRule(X.terminatorEnd, { type: "end" }), X.illegal && W.addRule(X.illegal, { type: "illegal" }), W;
    }
    function Le(X, W) {
      const ie = (
        /** @type CompiledMode */
        X
      );
      if (X.isCompiled) return ie;
      [
        g,
        // do this early so compiler extensions generally don't have to worry about
        // the distinction between match/begin
        O,
        ft,
        L
      ].forEach((Oe) => Oe(X, W)), _.compilerExtensions.forEach((Oe) => Oe(X, W)), X.__beforeBegin = null, [
        y,
        // do this later so compiler extensions that come earlier have access to the
        // raw array if they wanted to perhaps manipulate it, etc.
        w,
        // default to 1 relevance if not specified
        N
      ].forEach((Oe) => Oe(X, W)), X.isCompiled = !0;
      let Pe = null;
      return typeof X.keywords == "object" && X.keywords.$pattern && (X.keywords = Object.assign({}, X.keywords), Pe = X.keywords.$pattern, delete X.keywords.$pattern), Pe = Pe || /\w+/, X.keywords && (X.keywords = $(X.keywords, _.case_insensitive)), ie.keywordPatternRe = D(Pe, !0), W && (X.begin || (X.begin = /\B|\b/), ie.beginRe = D(ie.begin), !X.end && !X.endsWithParent && (X.end = /\B|\b/), X.end && (ie.endRe = D(ie.end)), ie.terminatorEnd = f(ie.end) || "", X.endsWithParent && W.terminatorEnd && (ie.terminatorEnd += (X.end ? "|" : "") + W.terminatorEnd)), X.illegal && (ie.illegalRe = D(
        /** @type {RegExp | string} */
        X.illegal
      )), X.contains || (X.contains = []), X.contains = [].concat(...X.contains.map(function(Oe) {
        return Xe(Oe === "self" ? X : Oe);
      })), X.contains.forEach(function(Oe) {
        Le(
          /** @type Mode */
          Oe,
          ie
        );
      }), X.starts && Le(X.starts, W), ie.matcher = Ne(ie), ie;
    }
    if (_.compilerExtensions || (_.compilerExtensions = []), _.contains && _.contains.includes("self"))
      throw new Error("ERR: contains `self` is not supported at the top-level of a language.  See documentation.");
    return _.classNameAliases = s(_.classNameAliases || {}), Le(
      /** @type Mode */
      _
    );
  }
  function Dn(_) {
    return _ ? _.endsWithParent || Dn(_.starts) : !1;
  }
  function Xe(_) {
    return _.variants && !_.cachedVariants && (_.cachedVariants = _.variants.map(function(D) {
      return s(_, { variants: null }, D);
    })), _.cachedVariants ? _.cachedVariants : Dn(_) ? s(_, { starts: _.starts ? s(_.starts) : null }) : Object.isFrozen(_) ? s(_) : _;
  }
  var ht = "11.9.0";
  class ss extends Error {
    constructor(D, H) {
      super(D), this.name = "HTMLInjectionError", this.html = H;
    }
  }
  const Ws = n, mc = s, bc = Symbol("nomatch"), Ru = 7, vc = function(_) {
    const D = /* @__PURE__ */ Object.create(null), H = /* @__PURE__ */ Object.create(null), ae = [];
    let Ne = !0;
    const Le = "Could not find the language '{}', did you forget to load/include a language module?", X = { disableAutodetect: !0, name: "Plain text", contains: [] };
    let W = {
      ignoreUnescapedHTML: !1,
      throwUnescapedHTML: !1,
      noHighlightRe: /^(no-?highlight)$/i,
      languageDetectRe: /\blang(?:uage)?-([\w-]+)\b/i,
      classPrefix: "hljs-",
      cssSelector: "pre code",
      languages: null,
      // beta configuration options, subject to change, welcome to discuss
      // https://github.com/highlightjs/highlight.js/issues/1086
      __emitter: u
    };
    function ie(P) {
      return W.noHighlightRe.test(P);
    }
    function Pe(P) {
      let ne = P.className + " ";
      ne += P.parentNode ? P.parentNode.className : "";
      const _e = W.languageDetectRe.exec(ne);
      if (_e) {
        const Te = Bt(_e[1]);
        return Te || (ce(Le.replace("{}", _e[1])), ce("Falling back to no-highlight mode for this block.", P)), Te ? _e[1] : "no-highlight";
      }
      return ne.split(/\s+/).find((Te) => ie(Te) || Bt(Te));
    }
    function Oe(P, ne, _e) {
      let Te = "", qe = "";
      typeof ne == "object" ? (Te = P, _e = ne.ignoreIllegals, qe = ne.language) : (he("10.7.0", "highlight(lang, code, ...args) has been deprecated."), he("10.7.0", `Please use highlight(code, options) instead.
https://github.com/highlightjs/highlight.js/issues/2277`), qe = P, Te = ne), _e === void 0 && (_e = !0);
      const mt = {
        code: Te,
        language: qe
      };
      os("before:highlight", mt);
      const $t = mt.result ? mt.result : Mn(mt.language, mt.code, _e);
      return $t.code = mt.code, os("after:highlight", $t), $t;
    }
    function Mn(P, ne, _e, Te) {
      const qe = /* @__PURE__ */ Object.create(null);
      function mt(j, te) {
        return j.keywords[te];
      }
      function $t() {
        if (!ue.keywords) {
          Ue.addText(De);
          return;
        }
        let j = 0;
        ue.keywordPatternRe.lastIndex = 0;
        let te = ue.keywordPatternRe.exec(De), pe = "";
        for (; te; ) {
          pe += De.substring(j, te.index);
          const ke = kt.case_insensitive ? te[0].toLowerCase() : te[0], Ke = mt(ue, ke);
          if (Ke) {
            const [Dt, Ku] = Ke;
            if (Ue.addText(pe), pe = "", qe[ke] = (qe[ke] || 0) + 1, qe[ke] <= Ru && (as += Ku), Dt.startsWith("_"))
              pe += te[0];
            else {
              const Zu = kt.classNameAliases[Dt] || Dt;
              xt(te[0], Zu);
            }
          } else
            pe += te[0];
          j = ue.keywordPatternRe.lastIndex, te = ue.keywordPatternRe.exec(De);
        }
        pe += De.substring(j), Ue.addText(pe);
      }
      function cs() {
        if (De === "") return;
        let j = null;
        if (typeof ue.subLanguage == "string") {
          if (!D[ue.subLanguage]) {
            Ue.addText(De);
            return;
          }
          j = Mn(ue.subLanguage, De, !0, Sc[ue.subLanguage]), Sc[ue.subLanguage] = /** @type {CompiledMode} */
          j._top;
        } else
          j = Ys(De, ue.subLanguage.length ? ue.subLanguage : null);
        ue.relevance > 0 && (as += j.relevance), Ue.__addSublanguage(j._emitter, j.language);
      }
      function ct() {
        ue.subLanguage != null ? cs() : $t(), De = "";
      }
      function xt(j, te) {
        j !== "" && (Ue.startScope(te), Ue.addText(j), Ue.endScope());
      }
      function Ec(j, te) {
        let pe = 1;
        const ke = te.length - 1;
        for (; pe <= ke; ) {
          if (!j._emit[pe]) {
            pe++;
            continue;
          }
          const Ke = kt.classNameAliases[j[pe]] || j[pe], Dt = te[pe];
          Ke ? xt(Dt, Ke) : (De = Dt, $t(), De = ""), pe++;
        }
      }
      function Cc(j, te) {
        return j.scope && typeof j.scope == "string" && Ue.openNode(kt.classNameAliases[j.scope] || j.scope), j.beginScope && (j.beginScope._wrap ? (xt(De, kt.classNameAliases[j.beginScope._wrap] || j.beginScope._wrap), De = "") : j.beginScope._multi && (Ec(j.beginScope, te), De = "")), ue = Object.create(j, { parent: { value: ue } }), ue;
      }
      function Ac(j, te, pe) {
        let ke = b(j.endRe, pe);
        if (ke) {
          if (j["on:end"]) {
            const Ke = new t(j);
            j["on:end"](te, Ke), Ke.isMatchIgnored && (ke = !1);
          }
          if (ke) {
            for (; j.endsParent && j.parent; )
              j = j.parent;
            return j;
          }
        }
        if (j.endsWithParent)
          return Ac(j.parent, te, pe);
      }
      function Uu(j) {
        return ue.matcher.regexIndex === 0 ? (De += j[0], 1) : (tr = !0, 0);
      }
      function Hu(j) {
        const te = j[0], pe = j.rule, ke = new t(pe), Ke = [pe.__beforeBegin, pe["on:begin"]];
        for (const Dt of Ke)
          if (Dt && (Dt(j, ke), ke.isMatchIgnored))
            return Uu(te);
        return pe.skip ? De += te : (pe.excludeBegin && (De += te), ct(), !pe.returnBegin && !pe.excludeBegin && (De = te)), Cc(pe, j), pe.returnBegin ? 0 : te.length;
      }
      function Vu(j) {
        const te = j[0], pe = ne.substring(j.index), ke = Ac(ue, j, pe);
        if (!ke)
          return bc;
        const Ke = ue;
        ue.endScope && ue.endScope._wrap ? (ct(), xt(te, ue.endScope._wrap)) : ue.endScope && ue.endScope._multi ? (ct(), Ec(ue.endScope, j)) : Ke.skip ? De += te : (Ke.returnEnd || Ke.excludeEnd || (De += te), ct(), Ke.excludeEnd && (De = te));
        do
          ue.scope && Ue.closeNode(), !ue.skip && !ue.subLanguage && (as += ue.relevance), ue = ue.parent;
        while (ue !== ke.parent);
        return ke.starts && Cc(ke.starts, j), Ke.returnEnd ? 0 : te.length;
      }
      function ju() {
        const j = [];
        for (let te = ue; te !== kt; te = te.parent)
          te.scope && j.unshift(te.scope);
        j.forEach((te) => Ue.openNode(te));
      }
      let is = {};
      function wc(j, te) {
        const pe = te && te[0];
        if (De += j, pe == null)
          return ct(), 0;
        if (is.type === "begin" && te.type === "end" && is.index === te.index && pe === "") {
          if (De += ne.slice(te.index, te.index + 1), !Ne) {
            const ke = new Error(`0 width match regex (${P})`);
            throw ke.languageName = P, ke.badRule = is.rule, ke;
          }
          return 1;
        }
        if (is = te, te.type === "begin")
          return Hu(te);
        if (te.type === "illegal" && !_e) {
          const ke = new Error('Illegal lexeme "' + pe + '" for mode "' + (ue.scope || "<unnamed>") + '"');
          throw ke.mode = ue, ke;
        } else if (te.type === "end") {
          const ke = Vu(te);
          if (ke !== bc)
            return ke;
        }
        if (te.type === "illegal" && pe === "")
          return 1;
        if (er > 1e5 && er > te.index * 3)
          throw new Error("potential infinite loop, way more iterations than matches");
        return De += pe, pe.length;
      }
      const kt = Bt(P);
      if (!kt)
        throw Y(Le.replace("{}", P)), new Error('Unknown language: "' + P + '"');
      const Gu = en(kt);
      let Qs = "", ue = Te || Gu;
      const Sc = {}, Ue = new W.__emitter(W);
      ju();
      let De = "", as = 0, tn = 0, er = 0, tr = !1;
      try {
        if (kt.__emitTokens)
          kt.__emitTokens(ne, Ue);
        else {
          for (ue.matcher.considerAll(); ; ) {
            er++, tr ? tr = !1 : ue.matcher.considerAll(), ue.matcher.lastIndex = tn;
            const j = ue.matcher.exec(ne);
            if (!j) break;
            const te = ne.substring(tn, j.index), pe = wc(te, j);
            tn = j.index + pe;
          }
          wc(ne.substring(tn));
        }
        return Ue.finalize(), Qs = Ue.toHTML(), {
          language: P,
          value: Qs,
          relevance: as,
          illegal: !1,
          _emitter: Ue,
          _top: ue
        };
      } catch (j) {
        if (j.message && j.message.includes("Illegal"))
          return {
            language: P,
            value: Ws(ne),
            illegal: !0,
            relevance: 0,
            _illegalBy: {
              message: j.message,
              index: tn,
              context: ne.slice(tn - 100, tn + 100),
              mode: j.mode,
              resultSoFar: Qs
            },
            _emitter: Ue
          };
        if (Ne)
          return {
            language: P,
            value: Ws(ne),
            illegal: !1,
            relevance: 0,
            errorRaised: j,
            _emitter: Ue,
            _top: ue
          };
        throw j;
      }
    }
    function Js(P) {
      const ne = {
        value: Ws(P),
        illegal: !1,
        relevance: 0,
        _top: X,
        _emitter: new W.__emitter(W)
      };
      return ne._emitter.addText(P), ne;
    }
    function Ys(P, ne) {
      ne = ne || W.languages || Object.keys(D);
      const _e = Js(P), Te = ne.filter(Bt).filter(kc).map(
        (ct) => Mn(ct, P, !1)
      );
      Te.unshift(_e);
      const qe = Te.sort((ct, xt) => {
        if (ct.relevance !== xt.relevance) return xt.relevance - ct.relevance;
        if (ct.language && xt.language) {
          if (Bt(ct.language).supersetOf === xt.language)
            return 1;
          if (Bt(xt.language).supersetOf === ct.language)
            return -1;
        }
        return 0;
      }), [mt, $t] = qe, cs = mt;
      return cs.secondBest = $t, cs;
    }
    function Du(P, ne, _e) {
      const Te = ne && H[ne] || _e;
      P.classList.add("hljs"), P.classList.add(`language-${Te}`);
    }
    function Xs(P) {
      let ne = null;
      const _e = Pe(P);
      if (ie(_e)) return;
      if (os(
        "before:highlightElement",
        { el: P, language: _e }
      ), P.dataset.highlighted) {
        console.log("Element previously highlighted. To highlight again, first unset `dataset.highlighted`.", P);
        return;
      }
      if (P.children.length > 0 && (W.ignoreUnescapedHTML || (console.warn("One of your code blocks includes unescaped HTML. This is a potentially serious security risk."), console.warn("https://github.com/highlightjs/highlight.js/wiki/security"), console.warn("The element with unescaped HTML:"), console.warn(P)), W.throwUnescapedHTML))
        throw new ss(
          "One of your code blocks includes unescaped HTML.",
          P.innerHTML
        );
      ne = P;
      const Te = ne.textContent, qe = _e ? Oe(Te, { language: _e, ignoreIllegals: !0 }) : Ys(Te);
      P.innerHTML = qe.value, P.dataset.highlighted = "yes", Du(P, _e, qe.language), P.result = {
        language: qe.language,
        // TODO: remove with version 11.0
        re: qe.relevance,
        relevance: qe.relevance
      }, qe.secondBest && (P.secondBest = {
        language: qe.secondBest.language,
        relevance: qe.secondBest.relevance
      }), os("after:highlightElement", { el: P, result: qe, text: Te });
    }
    function Mu(P) {
      W = mc(W, P);
    }
    const Iu = () => {
      rs(), he("10.6.0", "initHighlighting() deprecated.  Use highlightAll() now.");
    };
    function Nu() {
      rs(), he("10.6.0", "initHighlightingOnLoad() deprecated.  Use highlightAll() now.");
    }
    let yc = !1;
    function rs() {
      if (document.readyState === "loading") {
        yc = !0;
        return;
      }
      document.querySelectorAll(W.cssSelector).forEach(Xs);
    }
    function Lu() {
      yc && rs();
    }
    typeof window < "u" && window.addEventListener && window.addEventListener("DOMContentLoaded", Lu, !1);
    function Ou(P, ne) {
      let _e = null;
      try {
        _e = ne(_);
      } catch (Te) {
        if (Y("Language definition for '{}' could not be registered.".replace("{}", P)), Ne)
          Y(Te);
        else
          throw Te;
        _e = X;
      }
      _e.name || (_e.name = P), D[P] = _e, _e.rawDefinition = ne.bind(null, _), _e.aliases && xc(_e.aliases, { languageName: P });
    }
    function Fu(P) {
      delete D[P];
      for (const ne of Object.keys(H))
        H[ne] === P && delete H[ne];
    }
    function qu() {
      return Object.keys(D);
    }
    function Bt(P) {
      return P = (P || "").toLowerCase(), D[P] || D[H[P]];
    }
    function xc(P, { languageName: ne }) {
      typeof P == "string" && (P = [P]), P.forEach((_e) => {
        H[_e.toLowerCase()] = ne;
      });
    }
    function kc(P) {
      const ne = Bt(P);
      return ne && !ne.disableAutodetect;
    }
    function Pu(P) {
      P["before:highlightBlock"] && !P["before:highlightElement"] && (P["before:highlightElement"] = (ne) => {
        P["before:highlightBlock"](
          Object.assign({ block: ne.el }, ne)
        );
      }), P["after:highlightBlock"] && !P["after:highlightElement"] && (P["after:highlightElement"] = (ne) => {
        P["after:highlightBlock"](
          Object.assign({ block: ne.el }, ne)
        );
      });
    }
    function Bu(P) {
      Pu(P), ae.push(P);
    }
    function $u(P) {
      const ne = ae.indexOf(P);
      ne !== -1 && ae.splice(ne, 1);
    }
    function os(P, ne) {
      const _e = P;
      ae.forEach(function(Te) {
        Te[_e] && Te[_e](ne);
      });
    }
    function zu(P) {
      return he("10.7.0", "highlightBlock will be removed entirely in v12.0"), he("10.7.0", "Please use highlightElement now."), Xs(P);
    }
    Object.assign(_, {
      highlight: Oe,
      highlightAuto: Ys,
      highlightAll: rs,
      highlightElement: Xs,
      // TODO: Remove with v12 API
      highlightBlock: zu,
      configure: Mu,
      initHighlighting: Iu,
      initHighlightingOnLoad: Nu,
      registerLanguage: Ou,
      unregisterLanguage: Fu,
      listLanguages: qu,
      getLanguage: Bt,
      registerAliases: xc,
      autoDetection: kc,
      inherit: mc,
      addPlugin: Bu,
      removePlugin: $u
    }), _.debugMode = function() {
      Ne = !1;
    }, _.safeMode = function() {
      Ne = !0;
    }, _.versionString = ht, _.regex = {
      concat: x,
      lookahead: d,
      either: v,
      optional: m,
      anyNumberOfTimes: h
    };
    for (const P in yt)
      typeof yt[P] == "object" && e(yt[P]);
    return Object.assign(_, yt), _;
  }, pn = vc({});
  return pn.newInstance = () => vc({}), _r = pn, pn.HighlightJS = pn, pn.default = pn, _r;
}
var Hd = /* @__PURE__ */ Ud();
const Lt = /* @__PURE__ */ ic(Hd), _i = "[A-Za-z$_][0-9A-Za-z$_]*", Vd = [
  "as",
  // for exports
  "in",
  "of",
  "if",
  "for",
  "while",
  "finally",
  "var",
  "new",
  "function",
  "do",
  "return",
  "void",
  "else",
  "break",
  "catch",
  "instanceof",
  "with",
  "throw",
  "case",
  "default",
  "try",
  "switch",
  "continue",
  "typeof",
  "delete",
  "let",
  "yield",
  "const",
  "class",
  // JS handles these with a special rule
  // "get",
  // "set",
  "debugger",
  "async",
  "await",
  "static",
  "import",
  "from",
  "export",
  "extends"
], jd = [
  "true",
  "false",
  "null",
  "undefined",
  "NaN",
  "Infinity"
], tu = [
  // Fundamental objects
  "Object",
  "Function",
  "Boolean",
  "Symbol",
  // numbers and dates
  "Math",
  "Date",
  "Number",
  "BigInt",
  // text
  "String",
  "RegExp",
  // Indexed collections
  "Array",
  "Float32Array",
  "Float64Array",
  "Int8Array",
  "Uint8Array",
  "Uint8ClampedArray",
  "Int16Array",
  "Int32Array",
  "Uint16Array",
  "Uint32Array",
  "BigInt64Array",
  "BigUint64Array",
  // Keyed collections
  "Set",
  "Map",
  "WeakSet",
  "WeakMap",
  // Structured data
  "ArrayBuffer",
  "SharedArrayBuffer",
  "Atomics",
  "DataView",
  "JSON",
  // Control abstraction objects
  "Promise",
  "Generator",
  "GeneratorFunction",
  "AsyncFunction",
  // Reflection
  "Reflect",
  "Proxy",
  // Internationalization
  "Intl",
  // WebAssembly
  "WebAssembly"
], nu = [
  "Error",
  "EvalError",
  "InternalError",
  "RangeError",
  "ReferenceError",
  "SyntaxError",
  "TypeError",
  "URIError"
], su = [
  "setInterval",
  "setTimeout",
  "clearInterval",
  "clearTimeout",
  "require",
  "exports",
  "eval",
  "isFinite",
  "isNaN",
  "parseFloat",
  "parseInt",
  "decodeURI",
  "decodeURIComponent",
  "encodeURI",
  "encodeURIComponent",
  "escape",
  "unescape"
], Gd = [
  "arguments",
  "this",
  "super",
  "console",
  "window",
  "document",
  "localStorage",
  "sessionStorage",
  "module",
  "global"
  // Node.js
], Kd = [].concat(
  su,
  tu,
  nu
);
function ru(e) {
  const t = e.regex, n = (Z, { after: fe }) => {
    const J = "</" + Z[0].slice(1);
    return Z.input.indexOf(J, fe) !== -1;
  }, s = _i, r = {
    begin: "<>",
    end: "</>"
  }, o = /<[A-Za-z0-9\\._:-]+\s*\/>/, c = {
    begin: /<[A-Za-z0-9\\._:-]+/,
    end: /\/[A-Za-z0-9\\._:-]+>|\/>/,
    /**
     * @param {RegExpMatchArray} match
     * @param {CallbackResponse} response
     */
    isTrulyOpeningTag: (Z, fe) => {
      const J = Z[0].length + Z.index, Ce = Z.input[J];
      if (
        // HTML should not include another raw `<` inside a tag
        // nested type?
        // `<Array<Array<number>>`, etc.
        Ce === "<" || // the , gives away that this is not HTML
        // `<T, A extends keyof T, V>`
        Ce === ","
      ) {
        fe.ignoreMatch();
        return;
      }
      Ce === ">" && (n(Z, { after: J }) || fe.ignoreMatch());
      let Ae;
      const rt = Z.input.substring(J);
      if (Ae = rt.match(/^\s*=/)) {
        fe.ignoreMatch();
        return;
      }
      if ((Ae = rt.match(/^\s+extends\s+/)) && Ae.index === 0) {
        fe.ignoreMatch();
        return;
      }
    }
  }, i = {
    $pattern: _i,
    keyword: Vd,
    literal: jd,
    built_in: Kd,
    "variable.language": Gd
  }, a = "[0-9](_?[0-9])*", l = `\\.(${a})`, u = "0|[1-9](_?[0-9])*|0[0-7]*[89][0-9]*", f = {
    className: "number",
    variants: [
      // DecimalLiteral
      { begin: `(\\b(${u})((${l})|\\.)?|(${l}))[eE][+-]?(${a})\\b` },
      { begin: `\\b(${u})\\b((${l})\\b|\\.)?|(${l})\\b` },
      // DecimalBigIntegerLiteral
      { begin: "\\b(0|[1-9](_?[0-9])*)n\\b" },
      // NonDecimalIntegerLiteral
      { begin: "\\b0[xX][0-9a-fA-F](_?[0-9a-fA-F])*n?\\b" },
      { begin: "\\b0[bB][0-1](_?[0-1])*n?\\b" },
      { begin: "\\b0[oO][0-7](_?[0-7])*n?\\b" },
      // LegacyOctalIntegerLiteral (does not include underscore separators)
      // https://tc39.es/ecma262/#sec-additional-syntax-numeric-literals
      { begin: "\\b0[0-7]+n?\\b" }
    ],
    relevance: 0
  }, d = {
    className: "subst",
    begin: "\\$\\{",
    end: "\\}",
    keywords: i,
    contains: []
    // defined later
  }, h = {
    begin: "html`",
    end: "",
    starts: {
      end: "`",
      returnEnd: !1,
      contains: [
        e.BACKSLASH_ESCAPE,
        d
      ],
      subLanguage: "xml"
    }
  }, m = {
    begin: "css`",
    end: "",
    starts: {
      end: "`",
      returnEnd: !1,
      contains: [
        e.BACKSLASH_ESCAPE,
        d
      ],
      subLanguage: "css"
    }
  }, x = {
    begin: "gql`",
    end: "",
    starts: {
      end: "`",
      returnEnd: !1,
      contains: [
        e.BACKSLASH_ESCAPE,
        d
      ],
      subLanguage: "graphql"
    }
  }, A = {
    className: "string",
    begin: "`",
    end: "`",
    contains: [
      e.BACKSLASH_ESCAPE,
      d
    ]
  }, k = {
    className: "comment",
    variants: [
      e.COMMENT(
        /\/\*\*(?!\/)/,
        "\\*/",
        {
          relevance: 0,
          contains: [
            {
              begin: "(?=@[A-Za-z]+)",
              relevance: 0,
              contains: [
                {
                  className: "doctag",
                  begin: "@[A-Za-z]+"
                },
                {
                  className: "type",
                  begin: "\\{",
                  end: "\\}",
                  excludeEnd: !0,
                  excludeBegin: !0,
                  relevance: 0
                },
                {
                  className: "variable",
                  begin: s + "(?=\\s*(-)|$)",
                  endsParent: !0,
                  relevance: 0
                },
                // eat spaces (not newlines) so we can find
                // types or variables
                {
                  begin: /(?=[^\n])\s/,
                  relevance: 0
                }
              ]
            }
          ]
        }
      ),
      e.C_BLOCK_COMMENT_MODE,
      e.C_LINE_COMMENT_MODE
    ]
  }, b = [
    e.APOS_STRING_MODE,
    e.QUOTE_STRING_MODE,
    h,
    m,
    x,
    A,
    // Skip numbers when they are part of a variable name
    { match: /\$\d+/ },
    f
    // This is intentional:
    // See https://github.com/highlightjs/highlight.js/issues/3288
    // hljs.REGEXP_MODE
  ];
  d.contains = b.concat({
    // we need to pair up {} inside our subst to prevent
    // it from ending too early by matching another }
    begin: /\{/,
    end: /\}/,
    keywords: i,
    contains: [
      "self"
    ].concat(b)
  });
  const p = [].concat(k, d.contains), E = p.concat([
    // eat recursive parens in sub expressions
    {
      begin: /\(/,
      end: /\)/,
      keywords: i,
      contains: ["self"].concat(p)
    }
  ]), C = {
    className: "params",
    begin: /\(/,
    end: /\)/,
    excludeBegin: !0,
    excludeEnd: !0,
    keywords: i,
    contains: E
  }, z = {
    variants: [
      // class Car extends vehicle
      {
        match: [
          /class/,
          /\s+/,
          s,
          /\s+/,
          /extends/,
          /\s+/,
          t.concat(s, "(", t.concat(/\./, s), ")*")
        ],
        scope: {
          1: "keyword",
          3: "title.class",
          5: "keyword",
          7: "title.class.inherited"
        }
      },
      // class Car
      {
        match: [
          /class/,
          /\s+/,
          s
        ],
        scope: {
          1: "keyword",
          3: "title.class"
        }
      }
    ]
  }, T = {
    relevance: 0,
    match: t.either(
      // Hard coded exceptions
      /\bJSON/,
      // Float32Array, OutT
      /\b[A-Z][a-z]+([A-Z][a-z]*|\d)*/,
      // CSSFactory, CSSFactoryT
      /\b[A-Z]{2,}([A-Z][a-z]+|\d)+([A-Z][a-z]*)*/,
      // FPs, FPsT
      /\b[A-Z]{2,}[a-z]+([A-Z][a-z]+|\d)*([A-Z][a-z]*)*/
      // P
      // single letters are not highlighted
      // BLAH
      // this will be flagged as a UPPER_CASE_CONSTANT instead
    ),
    className: "title.class",
    keywords: {
      _: [
        // se we still get relevance credit for JS library classes
        ...tu,
        ...nu
      ]
    }
  }, R = {
    label: "use_strict",
    className: "meta",
    relevance: 10,
    begin: /^\s*['"]use (strict|asm)['"]/
  }, M = {
    variants: [
      {
        match: [
          /function/,
          /\s+/,
          s,
          /(?=\s*\()/
        ]
      },
      // anonymous function
      {
        match: [
          /function/,
          /\s*(?=\()/
        ]
      }
    ],
    className: {
      1: "keyword",
      3: "title.function"
    },
    label: "func.def",
    contains: [C],
    illegal: /%/
  }, q = {
    relevance: 0,
    match: /\b[A-Z][A-Z_0-9]+\b/,
    className: "variable.constant"
  };
  function I(Z) {
    return t.concat("(?!", Z.join("|"), ")");
  }
  const se = {
    match: t.concat(
      /\b/,
      I([
        ...su,
        "super",
        "import"
      ]),
      s,
      t.lookahead(/\(/)
    ),
    className: "title.function",
    relevance: 0
  }, S = {
    begin: t.concat(/\./, t.lookahead(
      t.concat(s, /(?![0-9A-Za-z$_(])/)
    )),
    end: s,
    excludeBegin: !0,
    keywords: "prototype",
    className: "property",
    relevance: 0
  }, B = {
    match: [
      /get|set/,
      /\s+/,
      s,
      /(?=\()/
    ],
    className: {
      1: "keyword",
      3: "title.function"
    },
    contains: [
      {
        // eat to avoid empty params
        begin: /\(\)/
      },
      C
    ]
  }, K = "(\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)|" + e.UNDERSCORE_IDENT_RE + ")\\s*=>", ee = {
    match: [
      /const|var|let/,
      /\s+/,
      s,
      /\s*/,
      /=\s*/,
      /(async\s*)?/,
      // async is optional
      t.lookahead(K)
    ],
    keywords: "async",
    className: {
      1: "keyword",
      3: "title.function"
    },
    contains: [
      C
    ]
  };
  return {
    name: "JavaScript",
    aliases: ["js", "jsx", "mjs", "cjs"],
    keywords: i,
    // this will be extended by TypeScript
    exports: { PARAMS_CONTAINS: E, CLASS_REFERENCE: T },
    illegal: /#(?![$_A-z])/,
    contains: [
      e.SHEBANG({
        label: "shebang",
        binary: "node",
        relevance: 5
      }),
      R,
      e.APOS_STRING_MODE,
      e.QUOTE_STRING_MODE,
      h,
      m,
      x,
      A,
      k,
      // Skip numbers when they are part of a variable name
      { match: /\$\d+/ },
      f,
      T,
      {
        className: "attr",
        begin: s + t.lookahead(":"),
        relevance: 0
      },
      ee,
      {
        // "value" container
        begin: "(" + e.RE_STARTERS_RE + "|\\b(case|return|throw)\\b)\\s*",
        keywords: "return throw case",
        relevance: 0,
        contains: [
          k,
          e.REGEXP_MODE,
          {
            className: "function",
            // we have to count the parens to make sure we actually have the
            // correct bounding ( ) before the =>.  There could be any number of
            // sub-expressions inside also surrounded by parens.
            begin: K,
            returnBegin: !0,
            end: "\\s*=>",
            contains: [
              {
                className: "params",
                variants: [
                  {
                    begin: e.UNDERSCORE_IDENT_RE,
                    relevance: 0
                  },
                  {
                    className: null,
                    begin: /\(\s*\)/,
                    skip: !0
                  },
                  {
                    begin: /\(/,
                    end: /\)/,
                    excludeBegin: !0,
                    excludeEnd: !0,
                    keywords: i,
                    contains: E
                  }
                ]
              }
            ]
          },
          {
            // could be a comma delimited list of params to a function call
            begin: /,/,
            relevance: 0
          },
          {
            match: /\s+/,
            relevance: 0
          },
          {
            // JSX
            variants: [
              { begin: r.begin, end: r.end },
              { match: o },
              {
                begin: c.begin,
                // we carefully check the opening tag to see if it truly
                // is a tag and not a false positive
                "on:begin": c.isTrulyOpeningTag,
                end: c.end
              }
            ],
            subLanguage: "xml",
            contains: [
              {
                begin: c.begin,
                end: c.end,
                skip: !0,
                contains: ["self"]
              }
            ]
          }
        ]
      },
      M,
      {
        // prevent this from getting swallowed up by function
        // since they appear "function like"
        beginKeywords: "while if switch catch for"
      },
      {
        // we have to count the parens to make sure we actually have the correct
        // bounding ( ).  There could be any number of sub-expressions inside
        // also surrounded by parens.
        begin: "\\b(?!function)" + e.UNDERSCORE_IDENT_RE + "\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)\\s*\\{",
        // end parens
        returnBegin: !0,
        label: "func.def",
        contains: [
          C,
          e.inherit(e.TITLE_MODE, { begin: s, className: "title.function" })
        ]
      },
      // catch ... so it won't trigger the property rule below
      {
        match: /\.\.\./,
        relevance: 0
      },
      S,
      // hack: prevents detection of keywords in some circumstances
      // .keyword()
      // $keyword = x
      {
        match: "\\$" + s,
        relevance: 0
      },
      {
        match: [/\bconstructor(?=\s*\()/],
        className: { 1: "title.function" },
        contains: [C]
      },
      se,
      q,
      z,
      B,
      {
        match: /\$[(.]/
        // relevance booster for a pattern common to JS libs: `$(something)` and `$.something`
      }
    ]
  };
}
function ou(e) {
  const t = e.regex, n = t.concat(/[\p{L}_]/u, t.optional(/[\p{L}0-9_.-]*:/u), /[\p{L}0-9_.-]*/u), s = /[\p{L}0-9._:-]+/u, r = {
    className: "symbol",
    begin: /&[a-z]+;|&#[0-9]+;|&#x[a-f0-9]+;/
  }, o = {
    begin: /\s/,
    contains: [
      {
        className: "keyword",
        begin: /#?[a-z_][a-z1-9_-]+/,
        illegal: /\n/
      }
    ]
  }, c = e.inherit(o, {
    begin: /\(/,
    end: /\)/
  }), i = e.inherit(e.APOS_STRING_MODE, { className: "string" }), a = e.inherit(e.QUOTE_STRING_MODE, { className: "string" }), l = {
    endsWithParent: !0,
    illegal: /</,
    relevance: 0,
    contains: [
      {
        className: "attr",
        begin: s,
        relevance: 0
      },
      {
        begin: /=\s*/,
        relevance: 0,
        contains: [
          {
            className: "string",
            endsParent: !0,
            variants: [
              {
                begin: /"/,
                end: /"/,
                contains: [r]
              },
              {
                begin: /'/,
                end: /'/,
                contains: [r]
              },
              { begin: /[^\s"'=<>`]+/ }
            ]
          }
        ]
      }
    ]
  };
  return {
    name: "HTML, XML",
    aliases: [
      "html",
      "xhtml",
      "rss",
      "atom",
      "xjb",
      "xsd",
      "xsl",
      "plist",
      "wsf",
      "svg"
    ],
    case_insensitive: !0,
    unicodeRegex: !0,
    contains: [
      {
        className: "meta",
        begin: /<![a-z]/,
        end: />/,
        relevance: 10,
        contains: [
          o,
          a,
          i,
          c,
          {
            begin: /\[/,
            end: /\]/,
            contains: [
              {
                className: "meta",
                begin: /<![a-z]/,
                end: />/,
                contains: [
                  o,
                  c,
                  a,
                  i
                ]
              }
            ]
          }
        ]
      },
      e.COMMENT(
        /<!--/,
        /-->/,
        { relevance: 10 }
      ),
      {
        begin: /<!\[CDATA\[/,
        end: /\]\]>/,
        relevance: 10
      },
      r,
      // xml processing instructions
      {
        className: "meta",
        end: /\?>/,
        variants: [
          {
            begin: /<\?xml/,
            relevance: 10,
            contains: [
              a
            ]
          },
          {
            begin: /<\?[a-z][a-z0-9]+/
          }
        ]
      },
      {
        className: "tag",
        /*
        The lookahead pattern (?=...) ensures that 'begin' only matches
        '<style' as a single word, followed by a whitespace or an
        ending bracket.
        */
        begin: /<style(?=\s|>)/,
        end: />/,
        keywords: { name: "style" },
        contains: [l],
        starts: {
          end: /<\/style>/,
          returnEnd: !0,
          subLanguage: [
            "css",
            "xml"
          ]
        }
      },
      {
        className: "tag",
        // See the comment in the <style tag about the lookahead pattern
        begin: /<script(?=\s|>)/,
        end: />/,
        keywords: { name: "script" },
        contains: [l],
        starts: {
          end: /<\/script>/,
          returnEnd: !0,
          subLanguage: [
            "javascript",
            "handlebars",
            "xml"
          ]
        }
      },
      // we need this for now for jSX
      {
        className: "tag",
        begin: /<>|<\/>/
      },
      // open tag
      {
        className: "tag",
        begin: t.concat(
          /</,
          t.lookahead(t.concat(
            n,
            // <tag/>
            // <tag>
            // <tag ...
            t.either(/\/>/, />/, /\s/)
          ))
        ),
        end: /\/?>/,
        contains: [
          {
            className: "name",
            begin: n,
            relevance: 0,
            starts: l
          }
        ]
      },
      // close tag
      {
        className: "tag",
        begin: t.concat(
          /<\//,
          t.lookahead(t.concat(
            n,
            />/
          ))
        ),
        contains: [
          {
            className: "name",
            begin: n,
            relevance: 0
          },
          {
            begin: />/,
            relevance: 0,
            endsParent: !0
          }
        ]
      }
    ]
  };
}
const Vs = (e, t) => {
  const n = e.__vccOpts || e;
  for (const [s, r] of t)
    n[s] = r;
  return n;
}, Zd = {}, Wd = { class: "chat-button" };
function Jd(e, t) {
  return Q(), ge("button", Wd, [
    Kt(e.$slots, "default")
  ]);
}
const Yd = /* @__PURE__ */ Vs(Zd, [["render", Jd]]), Xd = {
  viewBox: "0 0 24 24",
  width: "1.2em",
  height: "1.2em"
};
function Qd(e, t) {
  return Q(), ge("svg", Xd, t[0] || (t[0] = [
    Ee("path", {
      fill: "currentColor",
      d: "M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z"
    }, null, -1)
  ]));
}
const ep = { name: "mdi-close", render: Qd };
function ac() {
  return An(Yl);
}
function ns() {
  return {
    options: An(Xl)
  };
}
function js() {
  const { options: e } = ns(), t = (e == null ? void 0 : e.defaultLanguage) ?? "en";
  function n(r) {
    var c, i;
    const o = (i = (c = e == null ? void 0 : e.i18n) == null ? void 0 : c[t]) == null ? void 0 : i[r];
    return $e(o) ? o.value : o ?? r;
  }
  function s(r) {
    var o, c;
    return !!((c = (o = e == null ? void 0 : e.i18n) == null ? void 0 : o[t]) != null && c[r]);
  }
  return { t: n, te: s };
}
const tp = { class: "chat-get-started" }, np = /* @__PURE__ */ _t({
  __name: "GetStarted",
  setup(e) {
    const { t } = js();
    return (n, s) => (Q(), ge("div", tp, [
      Se(Yd, {
        onClick: s[0] || (s[0] = (r) => n.$emit("click:button"))
      }, {
        default: Rt(() => [
          Us(fn(de(t)("getStarted")), 1)
        ]),
        _: 1
      })
    ]));
  }
}), sp = {}, rp = { class: "chat-powered-by" };
function op(e, t) {
  return Q(), ge("div", rp, t[0] || (t[0] = [
    Us(" Powered by "),
    Ee("a", { href: "https://n8n.io?utm_source=n8n-external&utm_medium=widget-powered-by" }, "n8n", -1)
  ]));
}
const cp = /* @__PURE__ */ Vs(sp, [["render", op]]), ip = { class: "chat-get-started-footer" }, ap = { key: 0 }, lp = /* @__PURE__ */ _t({
  __name: "GetStartedFooter",
  setup(e) {
    const { t, te: n } = js();
    return (s, r) => (Q(), ge("div", ip, [
      de(n)("footer") ? (Q(), ge("div", ap, fn(de(t)("footer")), 1)) : lt("", !0),
      Se(cp)
    ]));
  }
});
function up(e) {
  return Ha() ? (lf(e), !0) : !1;
}
function fp() {
  const e = /* @__PURE__ */ new Set(), t = (r) => {
    e.delete(r);
  };
  return {
    on: (r) => {
      e.add(r);
      const o = () => t(r);
      return up(o), {
        off: o
      };
    },
    off: t,
    trigger: (...r) => Promise.all(Array.from(e).map((o) => o(...r)))
  };
}
const hp = typeof window < "u" && typeof document < "u";
typeof WorkerGlobalScope < "u" && globalThis instanceof WorkerGlobalScope;
const dp = (e, t) => Object.prototype.hasOwnProperty.call(e, t), pp = hp ? window.document : void 0, gp = {
  multiple: !0,
  accept: "*",
  reset: !1,
  directory: !1
};
function _p(e = {}) {
  const {
    document: t = pp
  } = e, n = Je(null), { on: s, trigger: r } = fp();
  let o;
  t && (o = t.createElement("input"), o.type = "file", o.onchange = (a) => {
    const l = a.target;
    n.value = l.files, r(n.value);
  });
  const c = () => {
    n.value = null, o && o.value && (o.value = "", r(null));
  }, i = (a) => {
    if (!o)
      return;
    const l = {
      ...gp,
      ...e,
      ...a
    };
    o.multiple = l.multiple, o.accept = l.accept, o.webkitdirectory = l.directory, dp(l, "capture") && (o.capture = l.capture), l.reset && c(), o.click();
  };
  return {
    files: Yo(n),
    open: i,
    reset: c,
    onChange: s
  };
}
const mp = {
  viewBox: "0 0 24 24",
  width: "1.2em",
  height: "1.2em"
};
function bp(e, t) {
  return Q(), ge("svg", mp, t[0] || (t[0] = [
    Ee("path", {
      fill: "currentColor",
      d: "M16.5 6v11.5a4 4 0 0 1-4 4a4 4 0 0 1-4-4V5A2.5 2.5 0 0 1 11 2.5A2.5 2.5 0 0 1 13.5 5v10.5a1 1 0 0 1-1 1a1 1 0 0 1-1-1V6H10v9.5a2.5 2.5 0 0 0 2.5 2.5a2.5 2.5 0 0 0 2.5-2.5V5a4 4 0 0 0-4-4a4 4 0 0 0-4 4v12.5a5.5 5.5 0 0 0 5.5 5.5a5.5 5.5 0 0 0 5.5-5.5V6z"
    }, null, -1)
  ]));
}
const vp = { name: "mdi-paperclip", render: bp }, yp = {
  viewBox: "0 0 24 24",
  width: "1.2em",
  height: "1.2em"
};
function xp(e, t) {
  return Q(), ge("svg", yp, t[0] || (t[0] = [
    Ee("path", {
      fill: "currentColor",
      d: "m2 21l21-9L2 3v7l15 2l-15 2z"
    }, null, -1)
  ]));
}
const kp = { name: "mdi-send", render: xp }, Ep = {
  viewBox: "0 0 24 24",
  width: "1.2em",
  height: "1.2em"
};
function Cp(e, t) {
  return Q(), ge("svg", Ep, t[0] || (t[0] = [
    Ee("path", {
      fill: "currentColor",
      d: "M20 6.91L17.09 4L12 9.09L6.91 4L4 6.91L9.09 12L4 17.09L6.91 20L12 14.91L17.09 20L20 17.09L14.91 12z"
    }, null, -1)
  ]));
}
const Ap = { name: "mdi-closeThick", render: Cp }, wp = {
  viewBox: "0 0 24 24",
  width: "1.2em",
  height: "1.2em"
};
function Sp(e, t) {
  return Q(), ge("svg", wp, t[0] || (t[0] = [
    Ee("path", {
      fill: "currentColor",
      d: "M13 9h5.5L13 3.5zM6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4c0-1.11.89-2 2-2m0 18h12v-8l-4 4l-2-2zM8 9a2 2 0 0 0-2 2a2 2 0 0 0 2 2a2 2 0 0 0 2-2a2 2 0 0 0-2-2"
    }, null, -1)
  ]));
}
const Tp = { name: "mdi-fileImage", render: Sp }, Rp = {
  viewBox: "0 0 24 24",
  width: "1.2em",
  height: "1.2em"
};
function Dp(e, t) {
  return Q(), ge("svg", Rp, t[0] || (t[0] = [
    Ee("path", {
      fill: "currentColor",
      d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zm-1 11h-2v5a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2c.4 0 .7.1 1 .3V11h3zm0-4V3.5L18.5 9z"
    }, null, -1)
  ]));
}
const Mp = { name: "mdi-fileMusic", render: Dp }, Ip = {
  viewBox: "0 0 24 24",
  width: "1.2em",
  height: "1.2em"
};
function Np(e, t) {
  return Q(), ge("svg", Ip, t[0] || (t[0] = [
    Ee("path", {
      fill: "currentColor",
      d: "M13 9h5.5L13 3.5zM6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4c0-1.11.89-2 2-2m9 16v-2H6v2zm3-4v-2H6v2z"
    }, null, -1)
  ]));
}
const mi = { name: "mdi-fileText", render: Np }, Lp = {
  viewBox: "0 0 24 24",
  width: "1.2em",
  height: "1.2em"
};
function Op(e, t) {
  return Q(), ge("svg", Lp, t[0] || (t[0] = [
    Ee("path", {
      fill: "currentColor",
      d: "M13 9h5.5L13 3.5zM6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4c0-1.11.89-2 2-2m11 17v-6l-3 2.2V13H7v6h7v-2.2z"
    }, null, -1)
  ]));
}
const Fp = { name: "mdi-fileVideo", render: Op }, qp = {
  viewBox: "0 0 24 24",
  width: "1.2em",
  height: "1.2em"
};
function Pp(e, t) {
  return Q(), ge("svg", qp, t[0] || (t[0] = [
    Ee("path", {
      fill: "currentColor",
      d: "M14 3v2h3.59l-9.83 9.83l1.41 1.41L19 6.41V10h2V3m-2 16H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2z"
    }, null, -1)
  ]));
}
const Bp = { name: "mdi-openInNew", render: Pp }, $p = { class: "chat-file-name" }, zp = /* @__PURE__ */ _t({
  __name: "ChatFile",
  props: {
    file: {},
    isRemovable: { type: Boolean },
    isPreviewable: { type: Boolean }
  },
  emits: ["remove"],
  setup(e, { emit: t }) {
    const n = e, s = t, r = {
      document: mi,
      audio: Mp,
      image: Tp,
      video: Fp
    }, o = nt(() => {
      var l;
      const a = (l = n.file) == null ? void 0 : l.type.split("/")[0];
      return r[a] || mi;
    });
    function c() {
      n.isPreviewable && window.open(URL.createObjectURL(n.file));
    }
    function i() {
      s("remove", n.file);
    }
    return (a, l) => (Q(), ge("div", {
      class: "chat-file",
      onClick: c
    }, [
      Se(de(o)),
      Ee("p", $p, fn(a.file.name), 1),
      a.isRemovable ? (Q(), ge("span", {
        key: 0,
        class: "chat-file-delete",
        onClick: Jl(i, ["stop"])
      }, [
        Se(de(Ap))
      ])) : a.isPreviewable ? (Q(), Fe(de(Bp), {
        key: 1,
        class: "chat-file-preview"
      })) : lt("", !0)
    ]));
  }
}), cu = /* @__PURE__ */ Vs(zp, [["__scopeId", "data-v-e0d57af7"]]), Up = { class: "chat-inputs" }, Hp = {
  key: 0,
  class: "chat-input-left-panel"
}, Vp = ["disabled", "placeholder"], jp = { class: "chat-inputs-controls" }, Gp = ["disabled"], Kp = ["disabled"], Zp = {
  key: 0,
  class: "chat-files"
}, Wp = /* @__PURE__ */ _t({
  __name: "Input",
  props: {
    placeholder: { default: "inputPlaceholder" }
  },
  emits: ["arrowKeyDown"],
  setup(e, { emit: t }) {
    const n = e, { t: s } = js(), r = t, { options: o } = ns(), c = ac(), { waitingForResponse: i } = c, a = Je(null), l = Je(null), u = Je(""), f = Je(!1), d = Je(null), h = nt(() => {
      var B;
      return u.value === "" || de(i) || ((B = o.disabled) == null ? void 0 : B.value) === !0;
    }), m = nt(() => {
      var B;
      return ((B = o.disabled) == null ? void 0 : B.value) === !0;
    }), x = nt(
      () => {
        var B;
        return A.value && de(i) && !((B = o.disabled) != null && B.value);
      }
    ), A = nt(() => de(o.allowFileUploads) === !0), v = nt(() => de(o.allowedFilesMimeTypes)), k = nt(() => ({
      "--controls-count": A.value ? 2 : 1
    })), {
      open: b,
      reset: p,
      onChange: E
    } = _p({
      multiple: !0,
      reset: !1
    });
    E((B) => {
      if (!B) return;
      const K = new DataTransfer();
      if (a.value)
        for (let ee = 0; ee < a.value.length; ee++)
          K.items.add(a.value[ee]);
      for (let ee = 0; ee < B.length; ee++)
        K.items.add(B[ee]);
      a.value = K.files;
    }), Xt(() => {
      ot.on("focusInput", z), ot.on("blurInput", C), ot.on("setInputValue", T), l.value && (d.value = new ResizeObserver((B) => {
        for (const K of B)
          K.target === l.value && S();
      }), d.value.observe(l.value));
    }), nc(() => {
      ot.off("focusInput", z), ot.off("blurInput", C), ot.off("setInputValue", T), d.value && (d.value.disconnect(), d.value = null);
    });
    function C() {
      l.value && l.value.blur();
    }
    function z() {
      l.value && l.value.focus();
    }
    function T(B) {
      u.value = B, z();
    }
    async function R(B) {
      if (B.preventDefault(), h.value)
        return;
      const K = u.value;
      u.value = "", f.value = !0, await c.sendMessage(K, Array.from(a.value ?? [])), f.value = !1, p(), a.value = null;
    }
    async function M(B) {
      B.shiftKey || (await R(B), S());
    }
    function q(B) {
      if (!a.value) return;
      const K = new DataTransfer();
      for (let ee = 0; ee < a.value.length; ee++) {
        const Z = a.value[ee];
        B.name !== Z.name && K.items.add(Z);
      }
      p(), a.value = K.files;
    }
    function I(B) {
      (B.key === "ArrowUp" || B.key === "ArrowDown") && (B.preventDefault(), r("arrowKeyDown", {
        key: B.key,
        currentInputValue: u.value
      }));
    }
    function se() {
      x.value || b({ accept: de(v) });
    }
    function S() {
      const B = l.value;
      if (!B) return;
      B.style.height = "var(--chat--textarea--height)";
      const K = Math.min(B.scrollHeight, 480);
      B.style.height = `${K}px`;
    }
    return (B, K) => {
      var ee;
      return Q(), ge("div", {
        class: "chat-input",
        style: Qn(k.value),
        onKeydown: Jl(I, ["stop"])
      }, [
        Ee("div", Up, [
          B.$slots.leftPanel ? (Q(), ge("div", Hp, [
            Kt(B.$slots, "leftPanel", {}, void 0, !0)
          ])) : lt("", !0),
          ul(Ee("textarea", {
            ref_key: "chatTextArea",
            ref: l,
            "onUpdate:modelValue": K[0] || (K[0] = (Z) => u.value = Z),
            "data-test-id": "chat-input",
            disabled: m.value,
            placeholder: de(s)(n.placeholder),
            onKeydown: kd(M, ["enter"]),
            onInput: S,
            onMousedown: S,
            onFocus: S
          }, null, 40, Vp), [
            [bd, u.value]
          ]),
          Ee("div", jp, [
            A.value ? (Q(), ge("button", {
              key: 0,
              disabled: x.value,
              class: "chat-input-file-button",
              "data-test-id": "chat-attach-file-button",
              onClick: se
            }, [
              Se(de(vp), {
                height: "24",
                width: "24"
              })
            ], 8, Gp)) : lt("", !0),
            Ee("button", {
              disabled: h.value,
              class: "chat-input-send-button",
              onClick: R
            }, [
              Se(de(kp), {
                height: "24",
                width: "24"
              })
            ], 8, Kp)
          ])
        ]),
        (ee = a.value) != null && ee.length && !f.value ? (Q(), ge("div", Zp, [
          (Q(!0), ge(Ve, null, ws(a.value, (Z) => (Q(), Fe(cu, {
            key: Z.name,
            file: Z,
            "is-removable": !0,
            "is-previewable": !0,
            onRemove: q
          }, null, 8, ["file"]))), 128))
        ])) : lt("", !0)
      ], 36);
    };
  }
}), Jp = /* @__PURE__ */ Vs(Wp, [["__scopeId", "data-v-31e29ba2"]]), Yp = { class: "chat-layout" }, Xp = {
  key: 0,
  class: "chat-header"
}, Qp = {
  key: 2,
  class: "chat-footer"
}, eg = /* @__PURE__ */ _t({
  __name: "Layout",
  setup(e) {
    const t = Je(null);
    function n() {
      const s = t.value;
      s && (s.scrollTop = s.scrollHeight);
    }
    return Xt(() => {
      ot.on("scrollToBottom", n), window.addEventListener("resize", n);
    }), tc(() => {
      ot.off("scrollToBottom", n), window.removeEventListener("resize", n);
    }), (s, r) => (Q(), ge("main", Yp, [
      s.$slots.header ? (Q(), ge("div", Xp, [
        Kt(s.$slots, "header")
      ])) : lt("", !0),
      s.$slots.default ? (Q(), ge("div", {
        key: 1,
        ref_key: "chatBodyRef",
        ref: t,
        class: "chat-body"
      }, [
        Kt(s.$slots, "default")
      ], 512)) : lt("", !0),
      s.$slots.footer ? (Q(), ge("div", Qp, [
        Kt(s.$slots, "footer")
      ])) : lt("", !0)
    ]));
  }
});
function tg(e) {
  const t = e.regex, n = {}, s = {
    begin: /\$\{/,
    end: /\}/,
    contains: [
      "self",
      {
        begin: /:-/,
        contains: [n]
      }
      // default values
    ]
  };
  Object.assign(n, {
    className: "variable",
    variants: [
      { begin: t.concat(
        /\$[\w\d#@][\w\d_]*/,
        // negative look-ahead tries to avoid matching patterns that are not
        // Perl at all like $ident$, @ident@, etc.
        "(?![\\w\\d])(?![$])"
      ) },
      s
    ]
  });
  const r = {
    className: "subst",
    begin: /\$\(/,
    end: /\)/,
    contains: [e.BACKSLASH_ESCAPE]
  }, o = {
    begin: /<<-?\s*(?=\w+)/,
    starts: { contains: [
      e.END_SAME_AS_BEGIN({
        begin: /(\w+)/,
        end: /(\w+)/,
        className: "string"
      })
    ] }
  }, c = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [
      e.BACKSLASH_ESCAPE,
      n,
      r
    ]
  };
  r.contains.push(c);
  const i = {
    match: /\\"/
  }, a = {
    className: "string",
    begin: /'/,
    end: /'/
  }, l = {
    match: /\\'/
  }, u = {
    begin: /\$?\(\(/,
    end: /\)\)/,
    contains: [
      {
        begin: /\d+#[0-9a-f]+/,
        className: "number"
      },
      e.NUMBER_MODE,
      n
    ]
  }, f = [
    "fish",
    "bash",
    "zsh",
    "sh",
    "csh",
    "ksh",
    "tcsh",
    "dash",
    "scsh"
  ], d = e.SHEBANG({
    binary: `(${f.join("|")})`,
    relevance: 10
  }), h = {
    className: "function",
    begin: /\w[\w\d_]*\s*\(\s*\)\s*\{/,
    returnBegin: !0,
    contains: [e.inherit(e.TITLE_MODE, { begin: /\w[\w\d_]*/ })],
    relevance: 0
  }, m = [
    "if",
    "then",
    "else",
    "elif",
    "fi",
    "for",
    "while",
    "until",
    "in",
    "do",
    "done",
    "case",
    "esac",
    "function",
    "select"
  ], x = [
    "true",
    "false"
  ], A = { match: /(\/[a-z._-]+)+/ }, v = [
    "break",
    "cd",
    "continue",
    "eval",
    "exec",
    "exit",
    "export",
    "getopts",
    "hash",
    "pwd",
    "readonly",
    "return",
    "shift",
    "test",
    "times",
    "trap",
    "umask",
    "unset"
  ], k = [
    "alias",
    "bind",
    "builtin",
    "caller",
    "command",
    "declare",
    "echo",
    "enable",
    "help",
    "let",
    "local",
    "logout",
    "mapfile",
    "printf",
    "read",
    "readarray",
    "source",
    "type",
    "typeset",
    "ulimit",
    "unalias"
  ], b = [
    "autoload",
    "bg",
    "bindkey",
    "bye",
    "cap",
    "chdir",
    "clone",
    "comparguments",
    "compcall",
    "compctl",
    "compdescribe",
    "compfiles",
    "compgroups",
    "compquote",
    "comptags",
    "comptry",
    "compvalues",
    "dirs",
    "disable",
    "disown",
    "echotc",
    "echoti",
    "emulate",
    "fc",
    "fg",
    "float",
    "functions",
    "getcap",
    "getln",
    "history",
    "integer",
    "jobs",
    "kill",
    "limit",
    "log",
    "noglob",
    "popd",
    "print",
    "pushd",
    "pushln",
    "rehash",
    "sched",
    "setcap",
    "setopt",
    "stat",
    "suspend",
    "ttyctl",
    "unfunction",
    "unhash",
    "unlimit",
    "unsetopt",
    "vared",
    "wait",
    "whence",
    "where",
    "which",
    "zcompile",
    "zformat",
    "zftp",
    "zle",
    "zmodload",
    "zparseopts",
    "zprof",
    "zpty",
    "zregexparse",
    "zsocket",
    "zstyle",
    "ztcp"
  ], p = [
    "chcon",
    "chgrp",
    "chown",
    "chmod",
    "cp",
    "dd",
    "df",
    "dir",
    "dircolors",
    "ln",
    "ls",
    "mkdir",
    "mkfifo",
    "mknod",
    "mktemp",
    "mv",
    "realpath",
    "rm",
    "rmdir",
    "shred",
    "sync",
    "touch",
    "truncate",
    "vdir",
    "b2sum",
    "base32",
    "base64",
    "cat",
    "cksum",
    "comm",
    "csplit",
    "cut",
    "expand",
    "fmt",
    "fold",
    "head",
    "join",
    "md5sum",
    "nl",
    "numfmt",
    "od",
    "paste",
    "ptx",
    "pr",
    "sha1sum",
    "sha224sum",
    "sha256sum",
    "sha384sum",
    "sha512sum",
    "shuf",
    "sort",
    "split",
    "sum",
    "tac",
    "tail",
    "tr",
    "tsort",
    "unexpand",
    "uniq",
    "wc",
    "arch",
    "basename",
    "chroot",
    "date",
    "dirname",
    "du",
    "echo",
    "env",
    "expr",
    "factor",
    // "false", // keyword literal already
    "groups",
    "hostid",
    "id",
    "link",
    "logname",
    "nice",
    "nohup",
    "nproc",
    "pathchk",
    "pinky",
    "printenv",
    "printf",
    "pwd",
    "readlink",
    "runcon",
    "seq",
    "sleep",
    "stat",
    "stdbuf",
    "stty",
    "tee",
    "test",
    "timeout",
    // "true", // keyword literal already
    "tty",
    "uname",
    "unlink",
    "uptime",
    "users",
    "who",
    "whoami",
    "yes"
  ];
  return {
    name: "Bash",
    aliases: ["sh"],
    keywords: {
      $pattern: /\b[a-z][a-z0-9._-]+\b/,
      keyword: m,
      literal: x,
      built_in: [
        ...v,
        ...k,
        // Shell modifiers
        "set",
        "shopt",
        ...b,
        ...p
      ]
    },
    contains: [
      d,
      // to catch known shells and boost relevancy
      e.SHEBANG(),
      // to catch unknown shells but still highlight the shebang
      h,
      u,
      e.HASH_COMMENT_MODE,
      o,
      A,
      c,
      i,
      a,
      l,
      n
    ]
  };
}
function ng(e) {
  const t = e.regex, n = new RegExp("[\\p{XID_Start}_]\\p{XID_Continue}*", "u"), s = [
    "and",
    "as",
    "assert",
    "async",
    "await",
    "break",
    "case",
    "class",
    "continue",
    "def",
    "del",
    "elif",
    "else",
    "except",
    "finally",
    "for",
    "from",
    "global",
    "if",
    "import",
    "in",
    "is",
    "lambda",
    "match",
    "nonlocal|10",
    "not",
    "or",
    "pass",
    "raise",
    "return",
    "try",
    "while",
    "with",
    "yield"
  ], i = {
    $pattern: /[A-Za-z]\w+|__\w+__/,
    keyword: s,
    built_in: [
      "__import__",
      "abs",
      "all",
      "any",
      "ascii",
      "bin",
      "bool",
      "breakpoint",
      "bytearray",
      "bytes",
      "callable",
      "chr",
      "classmethod",
      "compile",
      "complex",
      "delattr",
      "dict",
      "dir",
      "divmod",
      "enumerate",
      "eval",
      "exec",
      "filter",
      "float",
      "format",
      "frozenset",
      "getattr",
      "globals",
      "hasattr",
      "hash",
      "help",
      "hex",
      "id",
      "input",
      "int",
      "isinstance",
      "issubclass",
      "iter",
      "len",
      "list",
      "locals",
      "map",
      "max",
      "memoryview",
      "min",
      "next",
      "object",
      "oct",
      "open",
      "ord",
      "pow",
      "print",
      "property",
      "range",
      "repr",
      "reversed",
      "round",
      "set",
      "setattr",
      "slice",
      "sorted",
      "staticmethod",
      "str",
      "sum",
      "super",
      "tuple",
      "type",
      "vars",
      "zip"
    ],
    literal: [
      "__debug__",
      "Ellipsis",
      "False",
      "None",
      "NotImplemented",
      "True"
    ],
    type: [
      "Any",
      "Callable",
      "Coroutine",
      "Dict",
      "List",
      "Literal",
      "Generic",
      "Optional",
      "Sequence",
      "Set",
      "Tuple",
      "Type",
      "Union"
    ]
  }, a = {
    className: "meta",
    begin: /^(>>>|\.\.\.) /
  }, l = {
    className: "subst",
    begin: /\{/,
    end: /\}/,
    keywords: i,
    illegal: /#/
  }, u = {
    begin: /\{\{/,
    relevance: 0
  }, f = {
    className: "string",
    contains: [e.BACKSLASH_ESCAPE],
    variants: [
      {
        begin: /([uU]|[bB]|[rR]|[bB][rR]|[rR][bB])?'''/,
        end: /'''/,
        contains: [
          e.BACKSLASH_ESCAPE,
          a
        ],
        relevance: 10
      },
      {
        begin: /([uU]|[bB]|[rR]|[bB][rR]|[rR][bB])?"""/,
        end: /"""/,
        contains: [
          e.BACKSLASH_ESCAPE,
          a
        ],
        relevance: 10
      },
      {
        begin: /([fF][rR]|[rR][fF]|[fF])'''/,
        end: /'''/,
        contains: [
          e.BACKSLASH_ESCAPE,
          a,
          u,
          l
        ]
      },
      {
        begin: /([fF][rR]|[rR][fF]|[fF])"""/,
        end: /"""/,
        contains: [
          e.BACKSLASH_ESCAPE,
          a,
          u,
          l
        ]
      },
      {
        begin: /([uU]|[rR])'/,
        end: /'/,
        relevance: 10
      },
      {
        begin: /([uU]|[rR])"/,
        end: /"/,
        relevance: 10
      },
      {
        begin: /([bB]|[bB][rR]|[rR][bB])'/,
        end: /'/
      },
      {
        begin: /([bB]|[bB][rR]|[rR][bB])"/,
        end: /"/
      },
      {
        begin: /([fF][rR]|[rR][fF]|[fF])'/,
        end: /'/,
        contains: [
          e.BACKSLASH_ESCAPE,
          u,
          l
        ]
      },
      {
        begin: /([fF][rR]|[rR][fF]|[fF])"/,
        end: /"/,
        contains: [
          e.BACKSLASH_ESCAPE,
          u,
          l
        ]
      },
      e.APOS_STRING_MODE,
      e.QUOTE_STRING_MODE
    ]
  }, d = "[0-9](_?[0-9])*", h = `(\\b(${d}))?\\.(${d})|\\b(${d})\\.`, m = `\\b|${s.join("|")}`, x = {
    className: "number",
    relevance: 0,
    variants: [
      // exponentfloat, pointfloat
      // https://docs.python.org/3.9/reference/lexical_analysis.html#floating-point-literals
      // optionally imaginary
      // https://docs.python.org/3.9/reference/lexical_analysis.html#imaginary-literals
      // Note: no leading \b because floats can start with a decimal point
      // and we don't want to mishandle e.g. `fn(.5)`,
      // no trailing \b for pointfloat because it can end with a decimal point
      // and we don't want to mishandle e.g. `0..hex()`; this should be safe
      // because both MUST contain a decimal point and so cannot be confused with
      // the interior part of an identifier
      {
        begin: `(\\b(${d})|(${h}))[eE][+-]?(${d})[jJ]?(?=${m})`
      },
      {
        begin: `(${h})[jJ]?`
      },
      // decinteger, bininteger, octinteger, hexinteger
      // https://docs.python.org/3.9/reference/lexical_analysis.html#integer-literals
      // optionally "long" in Python 2
      // https://docs.python.org/2.7/reference/lexical_analysis.html#integer-and-long-integer-literals
      // decinteger is optionally imaginary
      // https://docs.python.org/3.9/reference/lexical_analysis.html#imaginary-literals
      {
        begin: `\\b([1-9](_?[0-9])*|0+(_?0)*)[lLjJ]?(?=${m})`
      },
      {
        begin: `\\b0[bB](_?[01])+[lL]?(?=${m})`
      },
      {
        begin: `\\b0[oO](_?[0-7])+[lL]?(?=${m})`
      },
      {
        begin: `\\b0[xX](_?[0-9a-fA-F])+[lL]?(?=${m})`
      },
      // imagnumber (digitpart-based)
      // https://docs.python.org/3.9/reference/lexical_analysis.html#imaginary-literals
      {
        begin: `\\b(${d})[jJ](?=${m})`
      }
    ]
  }, A = {
    className: "comment",
    begin: t.lookahead(/# type:/),
    end: /$/,
    keywords: i,
    contains: [
      {
        // prevent keywords from coloring `type`
        begin: /# type:/
      },
      // comment within a datatype comment includes no keywords
      {
        begin: /#/,
        end: /\b\B/,
        endsWithParent: !0
      }
    ]
  }, v = {
    className: "params",
    variants: [
      // Exclude params in functions without params
      {
        className: "",
        begin: /\(\s*\)/,
        skip: !0
      },
      {
        begin: /\(/,
        end: /\)/,
        excludeBegin: !0,
        excludeEnd: !0,
        keywords: i,
        contains: [
          "self",
          a,
          x,
          f,
          e.HASH_COMMENT_MODE
        ]
      }
    ]
  };
  return l.contains = [
    f,
    x,
    a
  ], {
    name: "Python",
    aliases: [
      "py",
      "gyp",
      "ipython"
    ],
    unicodeRegex: !0,
    keywords: i,
    illegal: /(<\/|\?)|=>/,
    contains: [
      a,
      x,
      {
        // very common convention
        begin: /\bself\b/
      },
      {
        // eat "if" prior to string so that it won't accidentally be
        // labeled as an f-string
        beginKeywords: "if",
        relevance: 0
      },
      f,
      A,
      e.HASH_COMMENT_MODE,
      {
        match: [
          /\bdef/,
          /\s+/,
          n
        ],
        scope: {
          1: "keyword",
          3: "title.function"
        },
        contains: [v]
      },
      {
        variants: [
          {
            match: [
              /\bclass/,
              /\s+/,
              n,
              /\s*/,
              /\(\s*/,
              n,
              /\s*\)/
            ]
          },
          {
            match: [
              /\bclass/,
              /\s+/,
              n
            ]
          }
        ],
        scope: {
          1: "keyword",
          3: "title.class",
          6: "title.class.inherited"
        }
      },
      {
        className: "meta",
        begin: /^[\t ]*@/,
        end: /(?=#)|$/,
        contains: [
          x,
          v,
          f
        ]
      }
    ]
  };
}
const Ds = "[A-Za-z$_][0-9A-Za-z$_]*", iu = [
  "as",
  // for exports
  "in",
  "of",
  "if",
  "for",
  "while",
  "finally",
  "var",
  "new",
  "function",
  "do",
  "return",
  "void",
  "else",
  "break",
  "catch",
  "instanceof",
  "with",
  "throw",
  "case",
  "default",
  "try",
  "switch",
  "continue",
  "typeof",
  "delete",
  "let",
  "yield",
  "const",
  "class",
  // JS handles these with a special rule
  // "get",
  // "set",
  "debugger",
  "async",
  "await",
  "static",
  "import",
  "from",
  "export",
  "extends"
], au = [
  "true",
  "false",
  "null",
  "undefined",
  "NaN",
  "Infinity"
], lu = [
  // Fundamental objects
  "Object",
  "Function",
  "Boolean",
  "Symbol",
  // numbers and dates
  "Math",
  "Date",
  "Number",
  "BigInt",
  // text
  "String",
  "RegExp",
  // Indexed collections
  "Array",
  "Float32Array",
  "Float64Array",
  "Int8Array",
  "Uint8Array",
  "Uint8ClampedArray",
  "Int16Array",
  "Int32Array",
  "Uint16Array",
  "Uint32Array",
  "BigInt64Array",
  "BigUint64Array",
  // Keyed collections
  "Set",
  "Map",
  "WeakSet",
  "WeakMap",
  // Structured data
  "ArrayBuffer",
  "SharedArrayBuffer",
  "Atomics",
  "DataView",
  "JSON",
  // Control abstraction objects
  "Promise",
  "Generator",
  "GeneratorFunction",
  "AsyncFunction",
  // Reflection
  "Reflect",
  "Proxy",
  // Internationalization
  "Intl",
  // WebAssembly
  "WebAssembly"
], uu = [
  "Error",
  "EvalError",
  "InternalError",
  "RangeError",
  "ReferenceError",
  "SyntaxError",
  "TypeError",
  "URIError"
], fu = [
  "setInterval",
  "setTimeout",
  "clearInterval",
  "clearTimeout",
  "require",
  "exports",
  "eval",
  "isFinite",
  "isNaN",
  "parseFloat",
  "parseInt",
  "decodeURI",
  "decodeURIComponent",
  "encodeURI",
  "encodeURIComponent",
  "escape",
  "unescape"
], hu = [
  "arguments",
  "this",
  "super",
  "console",
  "window",
  "document",
  "localStorage",
  "sessionStorage",
  "module",
  "global"
  // Node.js
], du = [].concat(
  fu,
  lu,
  uu
);
function sg(e) {
  const t = e.regex, n = (Z, { after: fe }) => {
    const J = "</" + Z[0].slice(1);
    return Z.input.indexOf(J, fe) !== -1;
  }, s = Ds, r = {
    begin: "<>",
    end: "</>"
  }, o = /<[A-Za-z0-9\\._:-]+\s*\/>/, c = {
    begin: /<[A-Za-z0-9\\._:-]+/,
    end: /\/[A-Za-z0-9\\._:-]+>|\/>/,
    /**
     * @param {RegExpMatchArray} match
     * @param {CallbackResponse} response
     */
    isTrulyOpeningTag: (Z, fe) => {
      const J = Z[0].length + Z.index, Ce = Z.input[J];
      if (
        // HTML should not include another raw `<` inside a tag
        // nested type?
        // `<Array<Array<number>>`, etc.
        Ce === "<" || // the , gives away that this is not HTML
        // `<T, A extends keyof T, V>`
        Ce === ","
      ) {
        fe.ignoreMatch();
        return;
      }
      Ce === ">" && (n(Z, { after: J }) || fe.ignoreMatch());
      let Ae;
      const rt = Z.input.substring(J);
      if (Ae = rt.match(/^\s*=/)) {
        fe.ignoreMatch();
        return;
      }
      if ((Ae = rt.match(/^\s+extends\s+/)) && Ae.index === 0) {
        fe.ignoreMatch();
        return;
      }
    }
  }, i = {
    $pattern: Ds,
    keyword: iu,
    literal: au,
    built_in: du,
    "variable.language": hu
  }, a = "[0-9](_?[0-9])*", l = `\\.(${a})`, u = "0|[1-9](_?[0-9])*|0[0-7]*[89][0-9]*", f = {
    className: "number",
    variants: [
      // DecimalLiteral
      { begin: `(\\b(${u})((${l})|\\.)?|(${l}))[eE][+-]?(${a})\\b` },
      { begin: `\\b(${u})\\b((${l})\\b|\\.)?|(${l})\\b` },
      // DecimalBigIntegerLiteral
      { begin: "\\b(0|[1-9](_?[0-9])*)n\\b" },
      // NonDecimalIntegerLiteral
      { begin: "\\b0[xX][0-9a-fA-F](_?[0-9a-fA-F])*n?\\b" },
      { begin: "\\b0[bB][0-1](_?[0-1])*n?\\b" },
      { begin: "\\b0[oO][0-7](_?[0-7])*n?\\b" },
      // LegacyOctalIntegerLiteral (does not include underscore separators)
      // https://tc39.es/ecma262/#sec-additional-syntax-numeric-literals
      { begin: "\\b0[0-7]+n?\\b" }
    ],
    relevance: 0
  }, d = {
    className: "subst",
    begin: "\\$\\{",
    end: "\\}",
    keywords: i,
    contains: []
    // defined later
  }, h = {
    begin: "html`",
    end: "",
    starts: {
      end: "`",
      returnEnd: !1,
      contains: [
        e.BACKSLASH_ESCAPE,
        d
      ],
      subLanguage: "xml"
    }
  }, m = {
    begin: "css`",
    end: "",
    starts: {
      end: "`",
      returnEnd: !1,
      contains: [
        e.BACKSLASH_ESCAPE,
        d
      ],
      subLanguage: "css"
    }
  }, x = {
    begin: "gql`",
    end: "",
    starts: {
      end: "`",
      returnEnd: !1,
      contains: [
        e.BACKSLASH_ESCAPE,
        d
      ],
      subLanguage: "graphql"
    }
  }, A = {
    className: "string",
    begin: "`",
    end: "`",
    contains: [
      e.BACKSLASH_ESCAPE,
      d
    ]
  }, k = {
    className: "comment",
    variants: [
      e.COMMENT(
        /\/\*\*(?!\/)/,
        "\\*/",
        {
          relevance: 0,
          contains: [
            {
              begin: "(?=@[A-Za-z]+)",
              relevance: 0,
              contains: [
                {
                  className: "doctag",
                  begin: "@[A-Za-z]+"
                },
                {
                  className: "type",
                  begin: "\\{",
                  end: "\\}",
                  excludeEnd: !0,
                  excludeBegin: !0,
                  relevance: 0
                },
                {
                  className: "variable",
                  begin: s + "(?=\\s*(-)|$)",
                  endsParent: !0,
                  relevance: 0
                },
                // eat spaces (not newlines) so we can find
                // types or variables
                {
                  begin: /(?=[^\n])\s/,
                  relevance: 0
                }
              ]
            }
          ]
        }
      ),
      e.C_BLOCK_COMMENT_MODE,
      e.C_LINE_COMMENT_MODE
    ]
  }, b = [
    e.APOS_STRING_MODE,
    e.QUOTE_STRING_MODE,
    h,
    m,
    x,
    A,
    // Skip numbers when they are part of a variable name
    { match: /\$\d+/ },
    f
    // This is intentional:
    // See https://github.com/highlightjs/highlight.js/issues/3288
    // hljs.REGEXP_MODE
  ];
  d.contains = b.concat({
    // we need to pair up {} inside our subst to prevent
    // it from ending too early by matching another }
    begin: /\{/,
    end: /\}/,
    keywords: i,
    contains: [
      "self"
    ].concat(b)
  });
  const p = [].concat(k, d.contains), E = p.concat([
    // eat recursive parens in sub expressions
    {
      begin: /\(/,
      end: /\)/,
      keywords: i,
      contains: ["self"].concat(p)
    }
  ]), C = {
    className: "params",
    begin: /\(/,
    end: /\)/,
    excludeBegin: !0,
    excludeEnd: !0,
    keywords: i,
    contains: E
  }, z = {
    variants: [
      // class Car extends vehicle
      {
        match: [
          /class/,
          /\s+/,
          s,
          /\s+/,
          /extends/,
          /\s+/,
          t.concat(s, "(", t.concat(/\./, s), ")*")
        ],
        scope: {
          1: "keyword",
          3: "title.class",
          5: "keyword",
          7: "title.class.inherited"
        }
      },
      // class Car
      {
        match: [
          /class/,
          /\s+/,
          s
        ],
        scope: {
          1: "keyword",
          3: "title.class"
        }
      }
    ]
  }, T = {
    relevance: 0,
    match: t.either(
      // Hard coded exceptions
      /\bJSON/,
      // Float32Array, OutT
      /\b[A-Z][a-z]+([A-Z][a-z]*|\d)*/,
      // CSSFactory, CSSFactoryT
      /\b[A-Z]{2,}([A-Z][a-z]+|\d)+([A-Z][a-z]*)*/,
      // FPs, FPsT
      /\b[A-Z]{2,}[a-z]+([A-Z][a-z]+|\d)*([A-Z][a-z]*)*/
      // P
      // single letters are not highlighted
      // BLAH
      // this will be flagged as a UPPER_CASE_CONSTANT instead
    ),
    className: "title.class",
    keywords: {
      _: [
        // se we still get relevance credit for JS library classes
        ...lu,
        ...uu
      ]
    }
  }, R = {
    label: "use_strict",
    className: "meta",
    relevance: 10,
    begin: /^\s*['"]use (strict|asm)['"]/
  }, M = {
    variants: [
      {
        match: [
          /function/,
          /\s+/,
          s,
          /(?=\s*\()/
        ]
      },
      // anonymous function
      {
        match: [
          /function/,
          /\s*(?=\()/
        ]
      }
    ],
    className: {
      1: "keyword",
      3: "title.function"
    },
    label: "func.def",
    contains: [C],
    illegal: /%/
  }, q = {
    relevance: 0,
    match: /\b[A-Z][A-Z_0-9]+\b/,
    className: "variable.constant"
  };
  function I(Z) {
    return t.concat("(?!", Z.join("|"), ")");
  }
  const se = {
    match: t.concat(
      /\b/,
      I([
        ...fu,
        "super",
        "import"
      ]),
      s,
      t.lookahead(/\(/)
    ),
    className: "title.function",
    relevance: 0
  }, S = {
    begin: t.concat(/\./, t.lookahead(
      t.concat(s, /(?![0-9A-Za-z$_(])/)
    )),
    end: s,
    excludeBegin: !0,
    keywords: "prototype",
    className: "property",
    relevance: 0
  }, B = {
    match: [
      /get|set/,
      /\s+/,
      s,
      /(?=\()/
    ],
    className: {
      1: "keyword",
      3: "title.function"
    },
    contains: [
      {
        // eat to avoid empty params
        begin: /\(\)/
      },
      C
    ]
  }, K = "(\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)|" + e.UNDERSCORE_IDENT_RE + ")\\s*=>", ee = {
    match: [
      /const|var|let/,
      /\s+/,
      s,
      /\s*/,
      /=\s*/,
      /(async\s*)?/,
      // async is optional
      t.lookahead(K)
    ],
    keywords: "async",
    className: {
      1: "keyword",
      3: "title.function"
    },
    contains: [
      C
    ]
  };
  return {
    name: "JavaScript",
    aliases: ["js", "jsx", "mjs", "cjs"],
    keywords: i,
    // this will be extended by TypeScript
    exports: { PARAMS_CONTAINS: E, CLASS_REFERENCE: T },
    illegal: /#(?![$_A-z])/,
    contains: [
      e.SHEBANG({
        label: "shebang",
        binary: "node",
        relevance: 5
      }),
      R,
      e.APOS_STRING_MODE,
      e.QUOTE_STRING_MODE,
      h,
      m,
      x,
      A,
      k,
      // Skip numbers when they are part of a variable name
      { match: /\$\d+/ },
      f,
      T,
      {
        className: "attr",
        begin: s + t.lookahead(":"),
        relevance: 0
      },
      ee,
      {
        // "value" container
        begin: "(" + e.RE_STARTERS_RE + "|\\b(case|return|throw)\\b)\\s*",
        keywords: "return throw case",
        relevance: 0,
        contains: [
          k,
          e.REGEXP_MODE,
          {
            className: "function",
            // we have to count the parens to make sure we actually have the
            // correct bounding ( ) before the =>.  There could be any number of
            // sub-expressions inside also surrounded by parens.
            begin: K,
            returnBegin: !0,
            end: "\\s*=>",
            contains: [
              {
                className: "params",
                variants: [
                  {
                    begin: e.UNDERSCORE_IDENT_RE,
                    relevance: 0
                  },
                  {
                    className: null,
                    begin: /\(\s*\)/,
                    skip: !0
                  },
                  {
                    begin: /\(/,
                    end: /\)/,
                    excludeBegin: !0,
                    excludeEnd: !0,
                    keywords: i,
                    contains: E
                  }
                ]
              }
            ]
          },
          {
            // could be a comma delimited list of params to a function call
            begin: /,/,
            relevance: 0
          },
          {
            match: /\s+/,
            relevance: 0
          },
          {
            // JSX
            variants: [
              { begin: r.begin, end: r.end },
              { match: o },
              {
                begin: c.begin,
                // we carefully check the opening tag to see if it truly
                // is a tag and not a false positive
                "on:begin": c.isTrulyOpeningTag,
                end: c.end
              }
            ],
            subLanguage: "xml",
            contains: [
              {
                begin: c.begin,
                end: c.end,
                skip: !0,
                contains: ["self"]
              }
            ]
          }
        ]
      },
      M,
      {
        // prevent this from getting swallowed up by function
        // since they appear "function like"
        beginKeywords: "while if switch catch for"
      },
      {
        // we have to count the parens to make sure we actually have the correct
        // bounding ( ).  There could be any number of sub-expressions inside
        // also surrounded by parens.
        begin: "\\b(?!function)" + e.UNDERSCORE_IDENT_RE + "\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)\\s*\\{",
        // end parens
        returnBegin: !0,
        label: "func.def",
        contains: [
          C,
          e.inherit(e.TITLE_MODE, { begin: s, className: "title.function" })
        ]
      },
      // catch ... so it won't trigger the property rule below
      {
        match: /\.\.\./,
        relevance: 0
      },
      S,
      // hack: prevents detection of keywords in some circumstances
      // .keyword()
      // $keyword = x
      {
        match: "\\$" + s,
        relevance: 0
      },
      {
        match: [/\bconstructor(?=\s*\()/],
        className: { 1: "title.function" },
        contains: [C]
      },
      se,
      q,
      z,
      B,
      {
        match: /\$[(.]/
        // relevance booster for a pattern common to JS libs: `$(something)` and `$.something`
      }
    ]
  };
}
function rg(e) {
  const t = sg(e), n = Ds, s = [
    "any",
    "void",
    "number",
    "boolean",
    "string",
    "object",
    "never",
    "symbol",
    "bigint",
    "unknown"
  ], r = {
    beginKeywords: "namespace",
    end: /\{/,
    excludeEnd: !0,
    contains: [t.exports.CLASS_REFERENCE]
  }, o = {
    beginKeywords: "interface",
    end: /\{/,
    excludeEnd: !0,
    keywords: {
      keyword: "interface extends",
      built_in: s
    },
    contains: [t.exports.CLASS_REFERENCE]
  }, c = {
    className: "meta",
    relevance: 10,
    begin: /^\s*['"]use strict['"]/
  }, i = [
    "type",
    "namespace",
    "interface",
    "public",
    "private",
    "protected",
    "implements",
    "declare",
    "abstract",
    "readonly",
    "enum",
    "override"
  ], a = {
    $pattern: Ds,
    keyword: iu.concat(i),
    literal: au,
    built_in: du.concat(s),
    "variable.language": hu
  }, l = {
    className: "meta",
    begin: "@" + n
  }, u = (d, h, m) => {
    const x = d.contains.findIndex((A) => A.label === h);
    if (x === -1)
      throw new Error("can not find mode to replace");
    d.contains.splice(x, 1, m);
  };
  Object.assign(t.keywords, a), t.exports.PARAMS_CONTAINS.push(l), t.contains = t.contains.concat([
    l,
    r,
    o
  ]), u(t, "shebang", e.SHEBANG()), u(t, "use_strict", c);
  const f = t.contains.find((d) => d.label === "func.def");
  return f.relevance = 0, Object.assign(t, {
    name: "TypeScript",
    aliases: [
      "ts",
      "tsx",
      "mts",
      "cts"
    ]
  }), t;
}
var mr, bi;
function og() {
  if (bi) return mr;
  bi = 1;
  function e(s, r) {
    var o, c, i = s.attrs[s.attrIndex("href")][1];
    for (o = 0; o < r.length; ++o) {
      if (c = r[o], typeof c.matcher == "function") {
        if (c.matcher(i, c))
          return c;
        continue;
      }
      return c;
    }
  }
  function t(s, r, o) {
    Object.keys(o).forEach(function(c) {
      var i, a = o[c];
      c === "className" && (c = "class"), i = r[s].attrIndex(c), i < 0 ? r[s].attrPush([c, a]) : r[s].attrs[i][1] = a;
    });
  }
  function n(s, r) {
    r ? r = Array.isArray(r) ? r : [r] : r = [], Object.freeze(r);
    var o = s.renderer.rules.link_open || this.defaultRender;
    s.renderer.rules.link_open = function(c, i, a, l, u) {
      var f = e(c[i], r), d = f && f.attrs;
      return d && t(i, c, d), o(c, i, a, l, u);
    };
  }
  return n.defaultRender = function(s, r, o, c, i) {
    return i.renderToken(s, r, o);
  }, mr = n, mr;
}
var cg = og();
const ig = /* @__PURE__ */ ic(cg);
var br = {};
const ag = "Á", lg = "á", ug = "Ă", fg = "ă", hg = "∾", dg = "∿", pg = "∾̳", gg = "Â", _g = "â", mg = "´", bg = "А", vg = "а", yg = "Æ", xg = "æ", kg = "⁡", Eg = "𝔄", Cg = "𝔞", Ag = "À", wg = "à", Sg = "ℵ", Tg = "ℵ", Rg = "Α", Dg = "α", Mg = "Ā", Ig = "ā", Ng = "⨿", Lg = "&", Og = "&", Fg = "⩕", qg = "⩓", Pg = "∧", Bg = "⩜", $g = "⩘", zg = "⩚", Ug = "∠", Hg = "⦤", Vg = "∠", jg = "⦨", Gg = "⦩", Kg = "⦪", Zg = "⦫", Wg = "⦬", Jg = "⦭", Yg = "⦮", Xg = "⦯", Qg = "∡", e_ = "∟", t_ = "⊾", n_ = "⦝", s_ = "∢", r_ = "Å", o_ = "⍼", c_ = "Ą", i_ = "ą", a_ = "𝔸", l_ = "𝕒", u_ = "⩯", f_ = "≈", h_ = "⩰", d_ = "≊", p_ = "≋", g_ = "'", __ = "⁡", m_ = "≈", b_ = "≊", v_ = "Å", y_ = "å", x_ = "𝒜", k_ = "𝒶", E_ = "≔", C_ = "*", A_ = "≈", w_ = "≍", S_ = "Ã", T_ = "ã", R_ = "Ä", D_ = "ä", M_ = "∳", I_ = "⨑", N_ = "≌", L_ = "϶", O_ = "‵", F_ = "∽", q_ = "⋍", P_ = "∖", B_ = "⫧", $_ = "⊽", z_ = "⌅", U_ = "⌆", H_ = "⌅", V_ = "⎵", j_ = "⎶", G_ = "≌", K_ = "Б", Z_ = "б", W_ = "„", J_ = "∵", Y_ = "∵", X_ = "∵", Q_ = "⦰", em = "϶", tm = "ℬ", nm = "ℬ", sm = "Β", rm = "β", om = "ℶ", cm = "≬", im = "𝔅", am = "𝔟", lm = "⋂", um = "◯", fm = "⋃", hm = "⨀", dm = "⨁", pm = "⨂", gm = "⨆", _m = "★", mm = "▽", bm = "△", vm = "⨄", ym = "⋁", xm = "⋀", km = "⤍", Em = "⧫", Cm = "▪", Am = "▴", wm = "▾", Sm = "◂", Tm = "▸", Rm = "␣", Dm = "▒", Mm = "░", Im = "▓", Nm = "█", Lm = "=⃥", Om = "≡⃥", Fm = "⫭", qm = "⌐", Pm = "𝔹", Bm = "𝕓", $m = "⊥", zm = "⊥", Um = "⋈", Hm = "⧉", Vm = "┐", jm = "╕", Gm = "╖", Km = "╗", Zm = "┌", Wm = "╒", Jm = "╓", Ym = "╔", Xm = "─", Qm = "═", e0 = "┬", t0 = "╤", n0 = "╥", s0 = "╦", r0 = "┴", o0 = "╧", c0 = "╨", i0 = "╩", a0 = "⊟", l0 = "⊞", u0 = "⊠", f0 = "┘", h0 = "╛", d0 = "╜", p0 = "╝", g0 = "└", _0 = "╘", m0 = "╙", b0 = "╚", v0 = "│", y0 = "║", x0 = "┼", k0 = "╪", E0 = "╫", C0 = "╬", A0 = "┤", w0 = "╡", S0 = "╢", T0 = "╣", R0 = "├", D0 = "╞", M0 = "╟", I0 = "╠", N0 = "‵", L0 = "˘", O0 = "˘", F0 = "¦", q0 = "𝒷", P0 = "ℬ", B0 = "⁏", $0 = "∽", z0 = "⋍", U0 = "⧅", H0 = "\\", V0 = "⟈", j0 = "•", G0 = "•", K0 = "≎", Z0 = "⪮", W0 = "≏", J0 = "≎", Y0 = "≏", X0 = "Ć", Q0 = "ć", eb = "⩄", tb = "⩉", nb = "⩋", sb = "∩", rb = "⋒", ob = "⩇", cb = "⩀", ib = "ⅅ", ab = "∩︀", lb = "⁁", ub = "ˇ", fb = "ℭ", hb = "⩍", db = "Č", pb = "č", gb = "Ç", _b = "ç", mb = "Ĉ", bb = "ĉ", vb = "∰", yb = "⩌", xb = "⩐", kb = "Ċ", Eb = "ċ", Cb = "¸", Ab = "¸", wb = "⦲", Sb = "¢", Tb = "·", Rb = "·", Db = "𝔠", Mb = "ℭ", Ib = "Ч", Nb = "ч", Lb = "✓", Ob = "✓", Fb = "Χ", qb = "χ", Pb = "ˆ", Bb = "≗", $b = "↺", zb = "↻", Ub = "⊛", Hb = "⊚", Vb = "⊝", jb = "⊙", Gb = "®", Kb = "Ⓢ", Zb = "⊖", Wb = "⊕", Jb = "⊗", Yb = "○", Xb = "⧃", Qb = "≗", ev = "⨐", tv = "⫯", nv = "⧂", sv = "∲", rv = "”", ov = "’", cv = "♣", iv = "♣", av = ":", lv = "∷", uv = "⩴", fv = "≔", hv = "≔", dv = ",", pv = "@", gv = "∁", _v = "∘", mv = "∁", bv = "ℂ", vv = "≅", yv = "⩭", xv = "≡", kv = "∮", Ev = "∯", Cv = "∮", Av = "𝕔", wv = "ℂ", Sv = "∐", Tv = "∐", Rv = "©", Dv = "©", Mv = "℗", Iv = "∳", Nv = "↵", Lv = "✗", Ov = "⨯", Fv = "𝒞", qv = "𝒸", Pv = "⫏", Bv = "⫑", $v = "⫐", zv = "⫒", Uv = "⋯", Hv = "⤸", Vv = "⤵", jv = "⋞", Gv = "⋟", Kv = "↶", Zv = "⤽", Wv = "⩈", Jv = "⩆", Yv = "≍", Xv = "∪", Qv = "⋓", ey = "⩊", ty = "⊍", ny = "⩅", sy = "∪︀", ry = "↷", oy = "⤼", cy = "⋞", iy = "⋟", ay = "⋎", ly = "⋏", uy = "¤", fy = "↶", hy = "↷", dy = "⋎", py = "⋏", gy = "∲", _y = "∱", my = "⌭", by = "†", vy = "‡", yy = "ℸ", xy = "↓", ky = "↡", Ey = "⇓", Cy = "‐", Ay = "⫤", wy = "⊣", Sy = "⤏", Ty = "˝", Ry = "Ď", Dy = "ď", My = "Д", Iy = "д", Ny = "‡", Ly = "⇊", Oy = "ⅅ", Fy = "ⅆ", qy = "⤑", Py = "⩷", By = "°", $y = "∇", zy = "Δ", Uy = "δ", Hy = "⦱", Vy = "⥿", jy = "𝔇", Gy = "𝔡", Ky = "⥥", Zy = "⇃", Wy = "⇂", Jy = "´", Yy = "˙", Xy = "˝", Qy = "`", ex = "˜", tx = "⋄", nx = "⋄", sx = "⋄", rx = "♦", ox = "♦", cx = "¨", ix = "ⅆ", ax = "ϝ", lx = "⋲", ux = "÷", fx = "÷", hx = "⋇", dx = "⋇", px = "Ђ", gx = "ђ", _x = "⌞", mx = "⌍", bx = "$", vx = "𝔻", yx = "𝕕", xx = "¨", kx = "˙", Ex = "⃜", Cx = "≐", Ax = "≑", wx = "≐", Sx = "∸", Tx = "∔", Rx = "⊡", Dx = "⌆", Mx = "∯", Ix = "¨", Nx = "⇓", Lx = "⇐", Ox = "⇔", Fx = "⫤", qx = "⟸", Px = "⟺", Bx = "⟹", $x = "⇒", zx = "⊨", Ux = "⇑", Hx = "⇕", Vx = "∥", jx = "⤓", Gx = "↓", Kx = "↓", Zx = "⇓", Wx = "⇵", Jx = "̑", Yx = "⇊", Xx = "⇃", Qx = "⇂", e1 = "⥐", t1 = "⥞", n1 = "⥖", s1 = "↽", r1 = "⥟", o1 = "⥗", c1 = "⇁", i1 = "↧", a1 = "⊤", l1 = "⤐", u1 = "⌟", f1 = "⌌", h1 = "𝒟", d1 = "𝒹", p1 = "Ѕ", g1 = "ѕ", _1 = "⧶", m1 = "Đ", b1 = "đ", v1 = "⋱", y1 = "▿", x1 = "▾", k1 = "⇵", E1 = "⥯", C1 = "⦦", A1 = "Џ", w1 = "џ", S1 = "⟿", T1 = "É", R1 = "é", D1 = "⩮", M1 = "Ě", I1 = "ě", N1 = "Ê", L1 = "ê", O1 = "≖", F1 = "≕", q1 = "Э", P1 = "э", B1 = "⩷", $1 = "Ė", z1 = "ė", U1 = "≑", H1 = "ⅇ", V1 = "≒", j1 = "𝔈", G1 = "𝔢", K1 = "⪚", Z1 = "È", W1 = "è", J1 = "⪖", Y1 = "⪘", X1 = "⪙", Q1 = "∈", ek = "⏧", tk = "ℓ", nk = "⪕", sk = "⪗", rk = "Ē", ok = "ē", ck = "∅", ik = "∅", ak = "◻", lk = "∅", uk = "▫", fk = " ", hk = " ", dk = " ", pk = "Ŋ", gk = "ŋ", _k = " ", mk = "Ę", bk = "ę", vk = "𝔼", yk = "𝕖", xk = "⋕", kk = "⧣", Ek = "⩱", Ck = "ε", Ak = "Ε", wk = "ε", Sk = "ϵ", Tk = "≖", Rk = "≕", Dk = "≂", Mk = "⪖", Ik = "⪕", Nk = "⩵", Lk = "=", Ok = "≂", Fk = "≟", qk = "⇌", Pk = "≡", Bk = "⩸", $k = "⧥", zk = "⥱", Uk = "≓", Hk = "ℯ", Vk = "ℰ", jk = "≐", Gk = "⩳", Kk = "≂", Zk = "Η", Wk = "η", Jk = "Ð", Yk = "ð", Xk = "Ë", Qk = "ë", eE = "€", tE = "!", nE = "∃", sE = "∃", rE = "ℰ", oE = "ⅇ", cE = "ⅇ", iE = "≒", aE = "Ф", lE = "ф", uE = "♀", fE = "ﬃ", hE = "ﬀ", dE = "ﬄ", pE = "𝔉", gE = "𝔣", _E = "ﬁ", mE = "◼", bE = "▪", vE = "fj", yE = "♭", xE = "ﬂ", kE = "▱", EE = "ƒ", CE = "𝔽", AE = "𝕗", wE = "∀", SE = "∀", TE = "⋔", RE = "⫙", DE = "ℱ", ME = "⨍", IE = "½", NE = "⅓", LE = "¼", OE = "⅕", FE = "⅙", qE = "⅛", PE = "⅔", BE = "⅖", $E = "¾", zE = "⅗", UE = "⅜", HE = "⅘", VE = "⅚", jE = "⅝", GE = "⅞", KE = "⁄", ZE = "⌢", WE = "𝒻", JE = "ℱ", YE = "ǵ", XE = "Γ", QE = "γ", eC = "Ϝ", tC = "ϝ", nC = "⪆", sC = "Ğ", rC = "ğ", oC = "Ģ", cC = "Ĝ", iC = "ĝ", aC = "Г", lC = "г", uC = "Ġ", fC = "ġ", hC = "≥", dC = "≧", pC = "⪌", gC = "⋛", _C = "≥", mC = "≧", bC = "⩾", vC = "⪩", yC = "⩾", xC = "⪀", kC = "⪂", EC = "⪄", CC = "⋛︀", AC = "⪔", wC = "𝔊", SC = "𝔤", TC = "≫", RC = "⋙", DC = "⋙", MC = "ℷ", IC = "Ѓ", NC = "ѓ", LC = "⪥", OC = "≷", FC = "⪒", qC = "⪤", PC = "⪊", BC = "⪊", $C = "⪈", zC = "≩", UC = "⪈", HC = "≩", VC = "⋧", jC = "𝔾", GC = "𝕘", KC = "`", ZC = "≥", WC = "⋛", JC = "≧", YC = "⪢", XC = "≷", QC = "⩾", eA = "≳", tA = "𝒢", nA = "ℊ", sA = "≳", rA = "⪎", oA = "⪐", cA = "⪧", iA = "⩺", aA = ">", lA = ">", uA = "≫", fA = "⋗", hA = "⦕", dA = "⩼", pA = "⪆", gA = "⥸", _A = "⋗", mA = "⋛", bA = "⪌", vA = "≷", yA = "≳", xA = "≩︀", kA = "≩︀", EA = "ˇ", CA = " ", AA = "½", wA = "ℋ", SA = "Ъ", TA = "ъ", RA = "⥈", DA = "↔", MA = "⇔", IA = "↭", NA = "^", LA = "ℏ", OA = "Ĥ", FA = "ĥ", qA = "♥", PA = "♥", BA = "…", $A = "⊹", zA = "𝔥", UA = "ℌ", HA = "ℋ", VA = "⤥", jA = "⤦", GA = "⇿", KA = "∻", ZA = "↩", WA = "↪", JA = "𝕙", YA = "ℍ", XA = "―", QA = "─", ew = "𝒽", tw = "ℋ", nw = "ℏ", sw = "Ħ", rw = "ħ", ow = "≎", cw = "≏", iw = "⁃", aw = "‐", lw = "Í", uw = "í", fw = "⁣", hw = "Î", dw = "î", pw = "И", gw = "и", _w = "İ", mw = "Е", bw = "е", vw = "¡", yw = "⇔", xw = "𝔦", kw = "ℑ", Ew = "Ì", Cw = "ì", Aw = "ⅈ", ww = "⨌", Sw = "∭", Tw = "⧜", Rw = "℩", Dw = "Ĳ", Mw = "ĳ", Iw = "Ī", Nw = "ī", Lw = "ℑ", Ow = "ⅈ", Fw = "ℐ", qw = "ℑ", Pw = "ı", Bw = "ℑ", $w = "⊷", zw = "Ƶ", Uw = "⇒", Hw = "℅", Vw = "∞", jw = "⧝", Gw = "ı", Kw = "⊺", Zw = "∫", Ww = "∬", Jw = "ℤ", Yw = "∫", Xw = "⊺", Qw = "⋂", eS = "⨗", tS = "⨼", nS = "⁣", sS = "⁢", rS = "Ё", oS = "ё", cS = "Į", iS = "į", aS = "𝕀", lS = "𝕚", uS = "Ι", fS = "ι", hS = "⨼", dS = "¿", pS = "𝒾", gS = "ℐ", _S = "∈", mS = "⋵", bS = "⋹", vS = "⋴", yS = "⋳", xS = "∈", kS = "⁢", ES = "Ĩ", CS = "ĩ", AS = "І", wS = "і", SS = "Ï", TS = "ï", RS = "Ĵ", DS = "ĵ", MS = "Й", IS = "й", NS = "𝔍", LS = "𝔧", OS = "ȷ", FS = "𝕁", qS = "𝕛", PS = "𝒥", BS = "𝒿", $S = "Ј", zS = "ј", US = "Є", HS = "є", VS = "Κ", jS = "κ", GS = "ϰ", KS = "Ķ", ZS = "ķ", WS = "К", JS = "к", YS = "𝔎", XS = "𝔨", QS = "ĸ", eT = "Х", tT = "х", nT = "Ќ", sT = "ќ", rT = "𝕂", oT = "𝕜", cT = "𝒦", iT = "𝓀", aT = "⇚", lT = "Ĺ", uT = "ĺ", fT = "⦴", hT = "ℒ", dT = "Λ", pT = "λ", gT = "⟨", _T = "⟪", mT = "⦑", bT = "⟨", vT = "⪅", yT = "ℒ", xT = "«", kT = "⇤", ET = "⤟", CT = "←", AT = "↞", wT = "⇐", ST = "⤝", TT = "↩", RT = "↫", DT = "⤹", MT = "⥳", IT = "↢", NT = "⤙", LT = "⤛", OT = "⪫", FT = "⪭", qT = "⪭︀", PT = "⤌", BT = "⤎", $T = "❲", zT = "{", UT = "[", HT = "⦋", VT = "⦏", jT = "⦍", GT = "Ľ", KT = "ľ", ZT = "Ļ", WT = "ļ", JT = "⌈", YT = "{", XT = "Л", QT = "л", eR = "⤶", tR = "“", nR = "„", sR = "⥧", rR = "⥋", oR = "↲", cR = "≤", iR = "≦", aR = "⟨", lR = "⇤", uR = "←", fR = "←", hR = "⇐", dR = "⇆", pR = "↢", gR = "⌈", _R = "⟦", mR = "⥡", bR = "⥙", vR = "⇃", yR = "⌊", xR = "↽", kR = "↼", ER = "⇇", CR = "↔", AR = "↔", wR = "⇔", SR = "⇆", TR = "⇋", RR = "↭", DR = "⥎", MR = "↤", IR = "⊣", NR = "⥚", LR = "⋋", OR = "⧏", FR = "⊲", qR = "⊴", PR = "⥑", BR = "⥠", $R = "⥘", zR = "↿", UR = "⥒", HR = "↼", VR = "⪋", jR = "⋚", GR = "≤", KR = "≦", ZR = "⩽", WR = "⪨", JR = "⩽", YR = "⩿", XR = "⪁", QR = "⪃", eD = "⋚︀", tD = "⪓", nD = "⪅", sD = "⋖", rD = "⋚", oD = "⪋", cD = "⋚", iD = "≦", aD = "≶", lD = "≶", uD = "⪡", fD = "≲", hD = "⩽", dD = "≲", pD = "⥼", gD = "⌊", _D = "𝔏", mD = "𝔩", bD = "≶", vD = "⪑", yD = "⥢", xD = "↽", kD = "↼", ED = "⥪", CD = "▄", AD = "Љ", wD = "љ", SD = "⇇", TD = "≪", RD = "⋘", DD = "⌞", MD = "⇚", ID = "⥫", ND = "◺", LD = "Ŀ", OD = "ŀ", FD = "⎰", qD = "⎰", PD = "⪉", BD = "⪉", $D = "⪇", zD = "≨", UD = "⪇", HD = "≨", VD = "⋦", jD = "⟬", GD = "⇽", KD = "⟦", ZD = "⟵", WD = "⟵", JD = "⟸", YD = "⟷", XD = "⟷", QD = "⟺", eM = "⟼", tM = "⟶", nM = "⟶", sM = "⟹", rM = "↫", oM = "↬", cM = "⦅", iM = "𝕃", aM = "𝕝", lM = "⨭", uM = "⨴", fM = "∗", hM = "_", dM = "↙", pM = "↘", gM = "◊", _M = "◊", mM = "⧫", bM = "(", vM = "⦓", yM = "⇆", xM = "⌟", kM = "⇋", EM = "⥭", CM = "‎", AM = "⊿", wM = "‹", SM = "𝓁", TM = "ℒ", RM = "↰", DM = "↰", MM = "≲", IM = "⪍", NM = "⪏", LM = "[", OM = "‘", FM = "‚", qM = "Ł", PM = "ł", BM = "⪦", $M = "⩹", zM = "<", UM = "<", HM = "≪", VM = "⋖", jM = "⋋", GM = "⋉", KM = "⥶", ZM = "⩻", WM = "◃", JM = "⊴", YM = "◂", XM = "⦖", QM = "⥊", eI = "⥦", tI = "≨︀", nI = "≨︀", sI = "¯", rI = "♂", oI = "✠", cI = "✠", iI = "↦", aI = "↦", lI = "↧", uI = "↤", fI = "↥", hI = "▮", dI = "⨩", pI = "М", gI = "м", _I = "—", mI = "∺", bI = "∡", vI = " ", yI = "ℳ", xI = "𝔐", kI = "𝔪", EI = "℧", CI = "µ", AI = "*", wI = "⫰", SI = "∣", TI = "·", RI = "⊟", DI = "−", MI = "∸", II = "⨪", NI = "∓", LI = "⫛", OI = "…", FI = "∓", qI = "⊧", PI = "𝕄", BI = "𝕞", $I = "∓", zI = "𝓂", UI = "ℳ", HI = "∾", VI = "Μ", jI = "μ", GI = "⊸", KI = "⊸", ZI = "∇", WI = "Ń", JI = "ń", YI = "∠⃒", XI = "≉", QI = "⩰̸", eN = "≋̸", tN = "ŉ", nN = "≉", sN = "♮", rN = "ℕ", oN = "♮", cN = " ", iN = "≎̸", aN = "≏̸", lN = "⩃", uN = "Ň", fN = "ň", hN = "Ņ", dN = "ņ", pN = "≇", gN = "⩭̸", _N = "⩂", mN = "Н", bN = "н", vN = "–", yN = "⤤", xN = "↗", kN = "⇗", EN = "↗", CN = "≠", AN = "≐̸", wN = "​", SN = "​", TN = "​", RN = "​", DN = "≢", MN = "⤨", IN = "≂̸", NN = "≫", LN = "≪", ON = `
`, FN = "∄", qN = "∄", PN = "𝔑", BN = "𝔫", $N = "≧̸", zN = "≱", UN = "≱", HN = "≧̸", VN = "⩾̸", jN = "⩾̸", GN = "⋙̸", KN = "≵", ZN = "≫⃒", WN = "≯", JN = "≯", YN = "≫̸", XN = "↮", QN = "⇎", eL = "⫲", tL = "∋", nL = "⋼", sL = "⋺", rL = "∋", oL = "Њ", cL = "њ", iL = "↚", aL = "⇍", lL = "‥", uL = "≦̸", fL = "≰", hL = "↚", dL = "⇍", pL = "↮", gL = "⇎", _L = "≰", mL = "≦̸", bL = "⩽̸", vL = "⩽̸", yL = "≮", xL = "⋘̸", kL = "≴", EL = "≪⃒", CL = "≮", AL = "⋪", wL = "⋬", SL = "≪̸", TL = "∤", RL = "⁠", DL = " ", ML = "𝕟", IL = "ℕ", NL = "⫬", LL = "¬", OL = "≢", FL = "≭", qL = "∦", PL = "∉", BL = "≠", $L = "≂̸", zL = "∄", UL = "≯", HL = "≱", VL = "≧̸", jL = "≫̸", GL = "≹", KL = "⩾̸", ZL = "≵", WL = "≎̸", JL = "≏̸", YL = "∉", XL = "⋵̸", QL = "⋹̸", e2 = "∉", t2 = "⋷", n2 = "⋶", s2 = "⧏̸", r2 = "⋪", o2 = "⋬", c2 = "≮", i2 = "≰", a2 = "≸", l2 = "≪̸", u2 = "⩽̸", f2 = "≴", h2 = "⪢̸", d2 = "⪡̸", p2 = "∌", g2 = "∌", _2 = "⋾", m2 = "⋽", b2 = "⊀", v2 = "⪯̸", y2 = "⋠", x2 = "∌", k2 = "⧐̸", E2 = "⋫", C2 = "⋭", A2 = "⊏̸", w2 = "⋢", S2 = "⊐̸", T2 = "⋣", R2 = "⊂⃒", D2 = "⊈", M2 = "⊁", I2 = "⪰̸", N2 = "⋡", L2 = "≿̸", O2 = "⊃⃒", F2 = "⊉", q2 = "≁", P2 = "≄", B2 = "≇", $2 = "≉", z2 = "∤", U2 = "∦", H2 = "∦", V2 = "⫽⃥", j2 = "∂̸", G2 = "⨔", K2 = "⊀", Z2 = "⋠", W2 = "⊀", J2 = "⪯̸", Y2 = "⪯̸", X2 = "⤳̸", Q2 = "↛", eO = "⇏", tO = "↝̸", nO = "↛", sO = "⇏", rO = "⋫", oO = "⋭", cO = "⊁", iO = "⋡", aO = "⪰̸", lO = "𝒩", uO = "𝓃", fO = "∤", hO = "∦", dO = "≁", pO = "≄", gO = "≄", _O = "∤", mO = "∦", bO = "⋢", vO = "⋣", yO = "⊄", xO = "⫅̸", kO = "⊈", EO = "⊂⃒", CO = "⊈", AO = "⫅̸", wO = "⊁", SO = "⪰̸", TO = "⊅", RO = "⫆̸", DO = "⊉", MO = "⊃⃒", IO = "⊉", NO = "⫆̸", LO = "≹", OO = "Ñ", FO = "ñ", qO = "≸", PO = "⋪", BO = "⋬", $O = "⋫", zO = "⋭", UO = "Ν", HO = "ν", VO = "#", jO = "№", GO = " ", KO = "≍⃒", ZO = "⊬", WO = "⊭", JO = "⊮", YO = "⊯", XO = "≥⃒", QO = ">⃒", eF = "⤄", tF = "⧞", nF = "⤂", sF = "≤⃒", rF = "<⃒", oF = "⊴⃒", cF = "⤃", iF = "⊵⃒", aF = "∼⃒", lF = "⤣", uF = "↖", fF = "⇖", hF = "↖", dF = "⤧", pF = "Ó", gF = "ó", _F = "⊛", mF = "Ô", bF = "ô", vF = "⊚", yF = "О", xF = "о", kF = "⊝", EF = "Ő", CF = "ő", AF = "⨸", wF = "⊙", SF = "⦼", TF = "Œ", RF = "œ", DF = "⦿", MF = "𝔒", IF = "𝔬", NF = "˛", LF = "Ò", OF = "ò", FF = "⧁", qF = "⦵", PF = "Ω", BF = "∮", $F = "↺", zF = "⦾", UF = "⦻", HF = "‾", VF = "⧀", jF = "Ō", GF = "ō", KF = "Ω", ZF = "ω", WF = "Ο", JF = "ο", YF = "⦶", XF = "⊖", QF = "𝕆", eq = "𝕠", tq = "⦷", nq = "“", sq = "‘", rq = "⦹", oq = "⊕", cq = "↻", iq = "⩔", aq = "∨", lq = "⩝", uq = "ℴ", fq = "ℴ", hq = "ª", dq = "º", pq = "⊶", gq = "⩖", _q = "⩗", mq = "⩛", bq = "Ⓢ", vq = "𝒪", yq = "ℴ", xq = "Ø", kq = "ø", Eq = "⊘", Cq = "Õ", Aq = "õ", wq = "⨶", Sq = "⨷", Tq = "⊗", Rq = "Ö", Dq = "ö", Mq = "⌽", Iq = "‾", Nq = "⏞", Lq = "⎴", Oq = "⏜", Fq = "¶", qq = "∥", Pq = "∥", Bq = "⫳", $q = "⫽", zq = "∂", Uq = "∂", Hq = "П", Vq = "п", jq = "%", Gq = ".", Kq = "‰", Zq = "⊥", Wq = "‱", Jq = "𝔓", Yq = "𝔭", Xq = "Φ", Qq = "φ", eP = "ϕ", tP = "ℳ", nP = "☎", sP = "Π", rP = "π", oP = "⋔", cP = "ϖ", iP = "ℏ", aP = "ℎ", lP = "ℏ", uP = "⨣", fP = "⊞", hP = "⨢", dP = "+", pP = "∔", gP = "⨥", _P = "⩲", mP = "±", bP = "±", vP = "⨦", yP = "⨧", xP = "±", kP = "ℌ", EP = "⨕", CP = "𝕡", AP = "ℙ", wP = "£", SP = "⪷", TP = "⪻", RP = "≺", DP = "≼", MP = "⪷", IP = "≺", NP = "≼", LP = "≺", OP = "⪯", FP = "≼", qP = "≾", PP = "⪯", BP = "⪹", $P = "⪵", zP = "⋨", UP = "⪯", HP = "⪳", VP = "≾", jP = "′", GP = "″", KP = "ℙ", ZP = "⪹", WP = "⪵", JP = "⋨", YP = "∏", XP = "∏", QP = "⌮", eB = "⌒", tB = "⌓", nB = "∝", sB = "∝", rB = "∷", oB = "∝", cB = "≾", iB = "⊰", aB = "𝒫", lB = "𝓅", uB = "Ψ", fB = "ψ", hB = " ", dB = "𝔔", pB = "𝔮", gB = "⨌", _B = "𝕢", mB = "ℚ", bB = "⁗", vB = "𝒬", yB = "𝓆", xB = "ℍ", kB = "⨖", EB = "?", CB = "≟", AB = '"', wB = '"', SB = "⇛", TB = "∽̱", RB = "Ŕ", DB = "ŕ", MB = "√", IB = "⦳", NB = "⟩", LB = "⟫", OB = "⦒", FB = "⦥", qB = "⟩", PB = "»", BB = "⥵", $B = "⇥", zB = "⤠", UB = "⤳", HB = "→", VB = "↠", jB = "⇒", GB = "⤞", KB = "↪", ZB = "↬", WB = "⥅", JB = "⥴", YB = "⤖", XB = "↣", QB = "↝", e$ = "⤚", t$ = "⤜", n$ = "∶", s$ = "ℚ", r$ = "⤍", o$ = "⤏", c$ = "⤐", i$ = "❳", a$ = "}", l$ = "]", u$ = "⦌", f$ = "⦎", h$ = "⦐", d$ = "Ř", p$ = "ř", g$ = "Ŗ", _$ = "ŗ", m$ = "⌉", b$ = "}", v$ = "Р", y$ = "р", x$ = "⤷", k$ = "⥩", E$ = "”", C$ = "”", A$ = "↳", w$ = "ℜ", S$ = "ℛ", T$ = "ℜ", R$ = "ℝ", D$ = "ℜ", M$ = "▭", I$ = "®", N$ = "®", L$ = "∋", O$ = "⇋", F$ = "⥯", q$ = "⥽", P$ = "⌋", B$ = "𝔯", $$ = "ℜ", z$ = "⥤", U$ = "⇁", H$ = "⇀", V$ = "⥬", j$ = "Ρ", G$ = "ρ", K$ = "ϱ", Z$ = "⟩", W$ = "⇥", J$ = "→", Y$ = "→", X$ = "⇒", Q$ = "⇄", ez = "↣", tz = "⌉", nz = "⟧", sz = "⥝", rz = "⥕", oz = "⇂", cz = "⌋", iz = "⇁", az = "⇀", lz = "⇄", uz = "⇌", fz = "⇉", hz = "↝", dz = "↦", pz = "⊢", gz = "⥛", _z = "⋌", mz = "⧐", bz = "⊳", vz = "⊵", yz = "⥏", xz = "⥜", kz = "⥔", Ez = "↾", Cz = "⥓", Az = "⇀", wz = "˚", Sz = "≓", Tz = "⇄", Rz = "⇌", Dz = "‏", Mz = "⎱", Iz = "⎱", Nz = "⫮", Lz = "⟭", Oz = "⇾", Fz = "⟧", qz = "⦆", Pz = "𝕣", Bz = "ℝ", $z = "⨮", zz = "⨵", Uz = "⥰", Hz = ")", Vz = "⦔", jz = "⨒", Gz = "⇉", Kz = "⇛", Zz = "›", Wz = "𝓇", Jz = "ℛ", Yz = "↱", Xz = "↱", Qz = "]", e3 = "’", t3 = "’", n3 = "⋌", s3 = "⋊", r3 = "▹", o3 = "⊵", c3 = "▸", i3 = "⧎", a3 = "⧴", l3 = "⥨", u3 = "℞", f3 = "Ś", h3 = "ś", d3 = "‚", p3 = "⪸", g3 = "Š", _3 = "š", m3 = "⪼", b3 = "≻", v3 = "≽", y3 = "⪰", x3 = "⪴", k3 = "Ş", E3 = "ş", C3 = "Ŝ", A3 = "ŝ", w3 = "⪺", S3 = "⪶", T3 = "⋩", R3 = "⨓", D3 = "≿", M3 = "С", I3 = "с", N3 = "⊡", L3 = "⋅", O3 = "⩦", F3 = "⤥", q3 = "↘", P3 = "⇘", B3 = "↘", $3 = "§", z3 = ";", U3 = "⤩", H3 = "∖", V3 = "∖", j3 = "✶", G3 = "𝔖", K3 = "𝔰", Z3 = "⌢", W3 = "♯", J3 = "Щ", Y3 = "щ", X3 = "Ш", Q3 = "ш", eU = "↓", tU = "←", nU = "∣", sU = "∥", rU = "→", oU = "↑", cU = "­", iU = "Σ", aU = "σ", lU = "ς", uU = "ς", fU = "∼", hU = "⩪", dU = "≃", pU = "≃", gU = "⪞", _U = "⪠", mU = "⪝", bU = "⪟", vU = "≆", yU = "⨤", xU = "⥲", kU = "←", EU = "∘", CU = "∖", AU = "⨳", wU = "⧤", SU = "∣", TU = "⌣", RU = "⪪", DU = "⪬", MU = "⪬︀", IU = "Ь", NU = "ь", LU = "⌿", OU = "⧄", FU = "/", qU = "𝕊", PU = "𝕤", BU = "♠", $U = "♠", zU = "∥", UU = "⊓", HU = "⊓︀", VU = "⊔", jU = "⊔︀", GU = "√", KU = "⊏", ZU = "⊑", WU = "⊏", JU = "⊑", YU = "⊐", XU = "⊒", QU = "⊐", eH = "⊒", tH = "□", nH = "□", sH = "⊓", rH = "⊏", oH = "⊑", cH = "⊐", iH = "⊒", aH = "⊔", lH = "▪", uH = "□", fH = "▪", hH = "→", dH = "𝒮", pH = "𝓈", gH = "∖", _H = "⌣", mH = "⋆", bH = "⋆", vH = "☆", yH = "★", xH = "ϵ", kH = "ϕ", EH = "¯", CH = "⊂", AH = "⋐", wH = "⪽", SH = "⫅", TH = "⊆", RH = "⫃", DH = "⫁", MH = "⫋", IH = "⊊", NH = "⪿", LH = "⥹", OH = "⊂", FH = "⋐", qH = "⊆", PH = "⫅", BH = "⊆", $H = "⊊", zH = "⫋", UH = "⫇", HH = "⫕", VH = "⫓", jH = "⪸", GH = "≻", KH = "≽", ZH = "≻", WH = "⪰", JH = "≽", YH = "≿", XH = "⪰", QH = "⪺", e4 = "⪶", t4 = "⋩", n4 = "≿", s4 = "∋", r4 = "∑", o4 = "∑", c4 = "♪", i4 = "¹", a4 = "²", l4 = "³", u4 = "⊃", f4 = "⋑", h4 = "⪾", d4 = "⫘", p4 = "⫆", g4 = "⊇", _4 = "⫄", m4 = "⊃", b4 = "⊇", v4 = "⟉", y4 = "⫗", x4 = "⥻", k4 = "⫂", E4 = "⫌", C4 = "⊋", A4 = "⫀", w4 = "⊃", S4 = "⋑", T4 = "⊇", R4 = "⫆", D4 = "⊋", M4 = "⫌", I4 = "⫈", N4 = "⫔", L4 = "⫖", O4 = "⤦", F4 = "↙", q4 = "⇙", P4 = "↙", B4 = "⤪", $4 = "ß", z4 = "	", U4 = "⌖", H4 = "Τ", V4 = "τ", j4 = "⎴", G4 = "Ť", K4 = "ť", Z4 = "Ţ", W4 = "ţ", J4 = "Т", Y4 = "т", X4 = "⃛", Q4 = "⌕", e6 = "𝔗", t6 = "𝔱", n6 = "∴", s6 = "∴", r6 = "∴", o6 = "Θ", c6 = "θ", i6 = "ϑ", a6 = "ϑ", l6 = "≈", u6 = "∼", f6 = "  ", h6 = " ", d6 = " ", p6 = "≈", g6 = "∼", _6 = "Þ", m6 = "þ", b6 = "˜", v6 = "∼", y6 = "≃", x6 = "≅", k6 = "≈", E6 = "⨱", C6 = "⊠", A6 = "×", w6 = "⨰", S6 = "∭", T6 = "⤨", R6 = "⌶", D6 = "⫱", M6 = "⊤", I6 = "𝕋", N6 = "𝕥", L6 = "⫚", O6 = "⤩", F6 = "‴", q6 = "™", P6 = "™", B6 = "▵", $6 = "▿", z6 = "◃", U6 = "⊴", H6 = "≜", V6 = "▹", j6 = "⊵", G6 = "◬", K6 = "≜", Z6 = "⨺", W6 = "⃛", J6 = "⨹", Y6 = "⧍", X6 = "⨻", Q6 = "⏢", e5 = "𝒯", t5 = "𝓉", n5 = "Ц", s5 = "ц", r5 = "Ћ", o5 = "ћ", c5 = "Ŧ", i5 = "ŧ", a5 = "≬", l5 = "↞", u5 = "↠", f5 = "Ú", h5 = "ú", d5 = "↑", p5 = "↟", g5 = "⇑", _5 = "⥉", m5 = "Ў", b5 = "ў", v5 = "Ŭ", y5 = "ŭ", x5 = "Û", k5 = "û", E5 = "У", C5 = "у", A5 = "⇅", w5 = "Ű", S5 = "ű", T5 = "⥮", R5 = "⥾", D5 = "𝔘", M5 = "𝔲", I5 = "Ù", N5 = "ù", L5 = "⥣", O5 = "↿", F5 = "↾", q5 = "▀", P5 = "⌜", B5 = "⌜", $5 = "⌏", z5 = "◸", U5 = "Ū", H5 = "ū", V5 = "¨", j5 = "_", G5 = "⏟", K5 = "⎵", Z5 = "⏝", W5 = "⋃", J5 = "⊎", Y5 = "Ų", X5 = "ų", Q5 = "𝕌", e9 = "𝕦", t9 = "⤒", n9 = "↑", s9 = "↑", r9 = "⇑", o9 = "⇅", c9 = "↕", i9 = "↕", a9 = "⇕", l9 = "⥮", u9 = "↿", f9 = "↾", h9 = "⊎", d9 = "↖", p9 = "↗", g9 = "υ", _9 = "ϒ", m9 = "ϒ", b9 = "Υ", v9 = "υ", y9 = "↥", x9 = "⊥", k9 = "⇈", E9 = "⌝", C9 = "⌝", A9 = "⌎", w9 = "Ů", S9 = "ů", T9 = "◹", R9 = "𝒰", D9 = "𝓊", M9 = "⋰", I9 = "Ũ", N9 = "ũ", L9 = "▵", O9 = "▴", F9 = "⇈", q9 = "Ü", P9 = "ü", B9 = "⦧", $9 = "⦜", z9 = "ϵ", U9 = "ϰ", H9 = "∅", V9 = "ϕ", j9 = "ϖ", G9 = "∝", K9 = "↕", Z9 = "⇕", W9 = "ϱ", J9 = "ς", Y9 = "⊊︀", X9 = "⫋︀", Q9 = "⊋︀", e8 = "⫌︀", t8 = "ϑ", n8 = "⊲", s8 = "⊳", r8 = "⫨", o8 = "⫫", c8 = "⫩", i8 = "В", a8 = "в", l8 = "⊢", u8 = "⊨", f8 = "⊩", h8 = "⊫", d8 = "⫦", p8 = "⊻", g8 = "∨", _8 = "⋁", m8 = "≚", b8 = "⋮", v8 = "|", y8 = "‖", x8 = "|", k8 = "‖", E8 = "∣", C8 = "|", A8 = "❘", w8 = "≀", S8 = " ", T8 = "𝔙", R8 = "𝔳", D8 = "⊲", M8 = "⊂⃒", I8 = "⊃⃒", N8 = "𝕍", L8 = "𝕧", O8 = "∝", F8 = "⊳", q8 = "𝒱", P8 = "𝓋", B8 = "⫋︀", $8 = "⊊︀", z8 = "⫌︀", U8 = "⊋︀", H8 = "⊪", V8 = "⦚", j8 = "Ŵ", G8 = "ŵ", K8 = "⩟", Z8 = "∧", W8 = "⋀", J8 = "≙", Y8 = "℘", X8 = "𝔚", Q8 = "𝔴", eV = "𝕎", tV = "𝕨", nV = "℘", sV = "≀", rV = "≀", oV = "𝒲", cV = "𝓌", iV = "⋂", aV = "◯", lV = "⋃", uV = "▽", fV = "𝔛", hV = "𝔵", dV = "⟷", pV = "⟺", gV = "Ξ", _V = "ξ", mV = "⟵", bV = "⟸", vV = "⟼", yV = "⋻", xV = "⨀", kV = "𝕏", EV = "𝕩", CV = "⨁", AV = "⨂", wV = "⟶", SV = "⟹", TV = "𝒳", RV = "𝓍", DV = "⨆", MV = "⨄", IV = "△", NV = "⋁", LV = "⋀", OV = "Ý", FV = "ý", qV = "Я", PV = "я", BV = "Ŷ", $V = "ŷ", zV = "Ы", UV = "ы", HV = "¥", VV = "𝔜", jV = "𝔶", GV = "Ї", KV = "ї", ZV = "𝕐", WV = "𝕪", JV = "𝒴", YV = "𝓎", XV = "Ю", QV = "ю", ej = "ÿ", tj = "Ÿ", nj = "Ź", sj = "ź", rj = "Ž", oj = "ž", cj = "З", ij = "з", aj = "Ż", lj = "ż", uj = "ℨ", fj = "​", hj = "Ζ", dj = "ζ", pj = "𝔷", gj = "ℨ", _j = "Ж", mj = "ж", bj = "⇝", vj = "𝕫", yj = "ℤ", xj = "𝒵", kj = "𝓏", Ej = "‍", Cj = "‌", Aj = {
  Aacute: ag,
  aacute: lg,
  Abreve: ug,
  abreve: fg,
  ac: hg,
  acd: dg,
  acE: pg,
  Acirc: gg,
  acirc: _g,
  acute: mg,
  Acy: bg,
  acy: vg,
  AElig: yg,
  aelig: xg,
  af: kg,
  Afr: Eg,
  afr: Cg,
  Agrave: Ag,
  agrave: wg,
  alefsym: Sg,
  aleph: Tg,
  Alpha: Rg,
  alpha: Dg,
  Amacr: Mg,
  amacr: Ig,
  amalg: Ng,
  amp: Lg,
  AMP: Og,
  andand: Fg,
  And: qg,
  and: Pg,
  andd: Bg,
  andslope: $g,
  andv: zg,
  ang: Ug,
  ange: Hg,
  angle: Vg,
  angmsdaa: jg,
  angmsdab: Gg,
  angmsdac: Kg,
  angmsdad: Zg,
  angmsdae: Wg,
  angmsdaf: Jg,
  angmsdag: Yg,
  angmsdah: Xg,
  angmsd: Qg,
  angrt: e_,
  angrtvb: t_,
  angrtvbd: n_,
  angsph: s_,
  angst: r_,
  angzarr: o_,
  Aogon: c_,
  aogon: i_,
  Aopf: a_,
  aopf: l_,
  apacir: u_,
  ap: f_,
  apE: h_,
  ape: d_,
  apid: p_,
  apos: g_,
  ApplyFunction: __,
  approx: m_,
  approxeq: b_,
  Aring: v_,
  aring: y_,
  Ascr: x_,
  ascr: k_,
  Assign: E_,
  ast: C_,
  asymp: A_,
  asympeq: w_,
  Atilde: S_,
  atilde: T_,
  Auml: R_,
  auml: D_,
  awconint: M_,
  awint: I_,
  backcong: N_,
  backepsilon: L_,
  backprime: O_,
  backsim: F_,
  backsimeq: q_,
  Backslash: P_,
  Barv: B_,
  barvee: $_,
  barwed: z_,
  Barwed: U_,
  barwedge: H_,
  bbrk: V_,
  bbrktbrk: j_,
  bcong: G_,
  Bcy: K_,
  bcy: Z_,
  bdquo: W_,
  becaus: J_,
  because: Y_,
  Because: X_,
  bemptyv: Q_,
  bepsi: em,
  bernou: tm,
  Bernoullis: nm,
  Beta: sm,
  beta: rm,
  beth: om,
  between: cm,
  Bfr: im,
  bfr: am,
  bigcap: lm,
  bigcirc: um,
  bigcup: fm,
  bigodot: hm,
  bigoplus: dm,
  bigotimes: pm,
  bigsqcup: gm,
  bigstar: _m,
  bigtriangledown: mm,
  bigtriangleup: bm,
  biguplus: vm,
  bigvee: ym,
  bigwedge: xm,
  bkarow: km,
  blacklozenge: Em,
  blacksquare: Cm,
  blacktriangle: Am,
  blacktriangledown: wm,
  blacktriangleleft: Sm,
  blacktriangleright: Tm,
  blank: Rm,
  blk12: Dm,
  blk14: Mm,
  blk34: Im,
  block: Nm,
  bne: Lm,
  bnequiv: Om,
  bNot: Fm,
  bnot: qm,
  Bopf: Pm,
  bopf: Bm,
  bot: $m,
  bottom: zm,
  bowtie: Um,
  boxbox: Hm,
  boxdl: Vm,
  boxdL: jm,
  boxDl: Gm,
  boxDL: Km,
  boxdr: Zm,
  boxdR: Wm,
  boxDr: Jm,
  boxDR: Ym,
  boxh: Xm,
  boxH: Qm,
  boxhd: e0,
  boxHd: t0,
  boxhD: n0,
  boxHD: s0,
  boxhu: r0,
  boxHu: o0,
  boxhU: c0,
  boxHU: i0,
  boxminus: a0,
  boxplus: l0,
  boxtimes: u0,
  boxul: f0,
  boxuL: h0,
  boxUl: d0,
  boxUL: p0,
  boxur: g0,
  boxuR: _0,
  boxUr: m0,
  boxUR: b0,
  boxv: v0,
  boxV: y0,
  boxvh: x0,
  boxvH: k0,
  boxVh: E0,
  boxVH: C0,
  boxvl: A0,
  boxvL: w0,
  boxVl: S0,
  boxVL: T0,
  boxvr: R0,
  boxvR: D0,
  boxVr: M0,
  boxVR: I0,
  bprime: N0,
  breve: L0,
  Breve: O0,
  brvbar: F0,
  bscr: q0,
  Bscr: P0,
  bsemi: B0,
  bsim: $0,
  bsime: z0,
  bsolb: U0,
  bsol: H0,
  bsolhsub: V0,
  bull: j0,
  bullet: G0,
  bump: K0,
  bumpE: Z0,
  bumpe: W0,
  Bumpeq: J0,
  bumpeq: Y0,
  Cacute: X0,
  cacute: Q0,
  capand: eb,
  capbrcup: tb,
  capcap: nb,
  cap: sb,
  Cap: rb,
  capcup: ob,
  capdot: cb,
  CapitalDifferentialD: ib,
  caps: ab,
  caret: lb,
  caron: ub,
  Cayleys: fb,
  ccaps: hb,
  Ccaron: db,
  ccaron: pb,
  Ccedil: gb,
  ccedil: _b,
  Ccirc: mb,
  ccirc: bb,
  Cconint: vb,
  ccups: yb,
  ccupssm: xb,
  Cdot: kb,
  cdot: Eb,
  cedil: Cb,
  Cedilla: Ab,
  cemptyv: wb,
  cent: Sb,
  centerdot: Tb,
  CenterDot: Rb,
  cfr: Db,
  Cfr: Mb,
  CHcy: Ib,
  chcy: Nb,
  check: Lb,
  checkmark: Ob,
  Chi: Fb,
  chi: qb,
  circ: Pb,
  circeq: Bb,
  circlearrowleft: $b,
  circlearrowright: zb,
  circledast: Ub,
  circledcirc: Hb,
  circleddash: Vb,
  CircleDot: jb,
  circledR: Gb,
  circledS: Kb,
  CircleMinus: Zb,
  CirclePlus: Wb,
  CircleTimes: Jb,
  cir: Yb,
  cirE: Xb,
  cire: Qb,
  cirfnint: ev,
  cirmid: tv,
  cirscir: nv,
  ClockwiseContourIntegral: sv,
  CloseCurlyDoubleQuote: rv,
  CloseCurlyQuote: ov,
  clubs: cv,
  clubsuit: iv,
  colon: av,
  Colon: lv,
  Colone: uv,
  colone: fv,
  coloneq: hv,
  comma: dv,
  commat: pv,
  comp: gv,
  compfn: _v,
  complement: mv,
  complexes: bv,
  cong: vv,
  congdot: yv,
  Congruent: xv,
  conint: kv,
  Conint: Ev,
  ContourIntegral: Cv,
  copf: Av,
  Copf: wv,
  coprod: Sv,
  Coproduct: Tv,
  copy: Rv,
  COPY: Dv,
  copysr: Mv,
  CounterClockwiseContourIntegral: Iv,
  crarr: Nv,
  cross: Lv,
  Cross: Ov,
  Cscr: Fv,
  cscr: qv,
  csub: Pv,
  csube: Bv,
  csup: $v,
  csupe: zv,
  ctdot: Uv,
  cudarrl: Hv,
  cudarrr: Vv,
  cuepr: jv,
  cuesc: Gv,
  cularr: Kv,
  cularrp: Zv,
  cupbrcap: Wv,
  cupcap: Jv,
  CupCap: Yv,
  cup: Xv,
  Cup: Qv,
  cupcup: ey,
  cupdot: ty,
  cupor: ny,
  cups: sy,
  curarr: ry,
  curarrm: oy,
  curlyeqprec: cy,
  curlyeqsucc: iy,
  curlyvee: ay,
  curlywedge: ly,
  curren: uy,
  curvearrowleft: fy,
  curvearrowright: hy,
  cuvee: dy,
  cuwed: py,
  cwconint: gy,
  cwint: _y,
  cylcty: my,
  dagger: by,
  Dagger: vy,
  daleth: yy,
  darr: xy,
  Darr: ky,
  dArr: Ey,
  dash: Cy,
  Dashv: Ay,
  dashv: wy,
  dbkarow: Sy,
  dblac: Ty,
  Dcaron: Ry,
  dcaron: Dy,
  Dcy: My,
  dcy: Iy,
  ddagger: Ny,
  ddarr: Ly,
  DD: Oy,
  dd: Fy,
  DDotrahd: qy,
  ddotseq: Py,
  deg: By,
  Del: $y,
  Delta: zy,
  delta: Uy,
  demptyv: Hy,
  dfisht: Vy,
  Dfr: jy,
  dfr: Gy,
  dHar: Ky,
  dharl: Zy,
  dharr: Wy,
  DiacriticalAcute: Jy,
  DiacriticalDot: Yy,
  DiacriticalDoubleAcute: Xy,
  DiacriticalGrave: Qy,
  DiacriticalTilde: ex,
  diam: tx,
  diamond: nx,
  Diamond: sx,
  diamondsuit: rx,
  diams: ox,
  die: cx,
  DifferentialD: ix,
  digamma: ax,
  disin: lx,
  div: ux,
  divide: fx,
  divideontimes: hx,
  divonx: dx,
  DJcy: px,
  djcy: gx,
  dlcorn: _x,
  dlcrop: mx,
  dollar: bx,
  Dopf: vx,
  dopf: yx,
  Dot: xx,
  dot: kx,
  DotDot: Ex,
  doteq: Cx,
  doteqdot: Ax,
  DotEqual: wx,
  dotminus: Sx,
  dotplus: Tx,
  dotsquare: Rx,
  doublebarwedge: Dx,
  DoubleContourIntegral: Mx,
  DoubleDot: Ix,
  DoubleDownArrow: Nx,
  DoubleLeftArrow: Lx,
  DoubleLeftRightArrow: Ox,
  DoubleLeftTee: Fx,
  DoubleLongLeftArrow: qx,
  DoubleLongLeftRightArrow: Px,
  DoubleLongRightArrow: Bx,
  DoubleRightArrow: $x,
  DoubleRightTee: zx,
  DoubleUpArrow: Ux,
  DoubleUpDownArrow: Hx,
  DoubleVerticalBar: Vx,
  DownArrowBar: jx,
  downarrow: Gx,
  DownArrow: Kx,
  Downarrow: Zx,
  DownArrowUpArrow: Wx,
  DownBreve: Jx,
  downdownarrows: Yx,
  downharpoonleft: Xx,
  downharpoonright: Qx,
  DownLeftRightVector: e1,
  DownLeftTeeVector: t1,
  DownLeftVectorBar: n1,
  DownLeftVector: s1,
  DownRightTeeVector: r1,
  DownRightVectorBar: o1,
  DownRightVector: c1,
  DownTeeArrow: i1,
  DownTee: a1,
  drbkarow: l1,
  drcorn: u1,
  drcrop: f1,
  Dscr: h1,
  dscr: d1,
  DScy: p1,
  dscy: g1,
  dsol: _1,
  Dstrok: m1,
  dstrok: b1,
  dtdot: v1,
  dtri: y1,
  dtrif: x1,
  duarr: k1,
  duhar: E1,
  dwangle: C1,
  DZcy: A1,
  dzcy: w1,
  dzigrarr: S1,
  Eacute: T1,
  eacute: R1,
  easter: D1,
  Ecaron: M1,
  ecaron: I1,
  Ecirc: N1,
  ecirc: L1,
  ecir: O1,
  ecolon: F1,
  Ecy: q1,
  ecy: P1,
  eDDot: B1,
  Edot: $1,
  edot: z1,
  eDot: U1,
  ee: H1,
  efDot: V1,
  Efr: j1,
  efr: G1,
  eg: K1,
  Egrave: Z1,
  egrave: W1,
  egs: J1,
  egsdot: Y1,
  el: X1,
  Element: Q1,
  elinters: ek,
  ell: tk,
  els: nk,
  elsdot: sk,
  Emacr: rk,
  emacr: ok,
  empty: ck,
  emptyset: ik,
  EmptySmallSquare: ak,
  emptyv: lk,
  EmptyVerySmallSquare: uk,
  emsp13: fk,
  emsp14: hk,
  emsp: dk,
  ENG: pk,
  eng: gk,
  ensp: _k,
  Eogon: mk,
  eogon: bk,
  Eopf: vk,
  eopf: yk,
  epar: xk,
  eparsl: kk,
  eplus: Ek,
  epsi: Ck,
  Epsilon: Ak,
  epsilon: wk,
  epsiv: Sk,
  eqcirc: Tk,
  eqcolon: Rk,
  eqsim: Dk,
  eqslantgtr: Mk,
  eqslantless: Ik,
  Equal: Nk,
  equals: Lk,
  EqualTilde: Ok,
  equest: Fk,
  Equilibrium: qk,
  equiv: Pk,
  equivDD: Bk,
  eqvparsl: $k,
  erarr: zk,
  erDot: Uk,
  escr: Hk,
  Escr: Vk,
  esdot: jk,
  Esim: Gk,
  esim: Kk,
  Eta: Zk,
  eta: Wk,
  ETH: Jk,
  eth: Yk,
  Euml: Xk,
  euml: Qk,
  euro: eE,
  excl: tE,
  exist: nE,
  Exists: sE,
  expectation: rE,
  exponentiale: oE,
  ExponentialE: cE,
  fallingdotseq: iE,
  Fcy: aE,
  fcy: lE,
  female: uE,
  ffilig: fE,
  fflig: hE,
  ffllig: dE,
  Ffr: pE,
  ffr: gE,
  filig: _E,
  FilledSmallSquare: mE,
  FilledVerySmallSquare: bE,
  fjlig: vE,
  flat: yE,
  fllig: xE,
  fltns: kE,
  fnof: EE,
  Fopf: CE,
  fopf: AE,
  forall: wE,
  ForAll: SE,
  fork: TE,
  forkv: RE,
  Fouriertrf: DE,
  fpartint: ME,
  frac12: IE,
  frac13: NE,
  frac14: LE,
  frac15: OE,
  frac16: FE,
  frac18: qE,
  frac23: PE,
  frac25: BE,
  frac34: $E,
  frac35: zE,
  frac38: UE,
  frac45: HE,
  frac56: VE,
  frac58: jE,
  frac78: GE,
  frasl: KE,
  frown: ZE,
  fscr: WE,
  Fscr: JE,
  gacute: YE,
  Gamma: XE,
  gamma: QE,
  Gammad: eC,
  gammad: tC,
  gap: nC,
  Gbreve: sC,
  gbreve: rC,
  Gcedil: oC,
  Gcirc: cC,
  gcirc: iC,
  Gcy: aC,
  gcy: lC,
  Gdot: uC,
  gdot: fC,
  ge: hC,
  gE: dC,
  gEl: pC,
  gel: gC,
  geq: _C,
  geqq: mC,
  geqslant: bC,
  gescc: vC,
  ges: yC,
  gesdot: xC,
  gesdoto: kC,
  gesdotol: EC,
  gesl: CC,
  gesles: AC,
  Gfr: wC,
  gfr: SC,
  gg: TC,
  Gg: RC,
  ggg: DC,
  gimel: MC,
  GJcy: IC,
  gjcy: NC,
  gla: LC,
  gl: OC,
  glE: FC,
  glj: qC,
  gnap: PC,
  gnapprox: BC,
  gne: $C,
  gnE: zC,
  gneq: UC,
  gneqq: HC,
  gnsim: VC,
  Gopf: jC,
  gopf: GC,
  grave: KC,
  GreaterEqual: ZC,
  GreaterEqualLess: WC,
  GreaterFullEqual: JC,
  GreaterGreater: YC,
  GreaterLess: XC,
  GreaterSlantEqual: QC,
  GreaterTilde: eA,
  Gscr: tA,
  gscr: nA,
  gsim: sA,
  gsime: rA,
  gsiml: oA,
  gtcc: cA,
  gtcir: iA,
  gt: aA,
  GT: lA,
  Gt: uA,
  gtdot: fA,
  gtlPar: hA,
  gtquest: dA,
  gtrapprox: pA,
  gtrarr: gA,
  gtrdot: _A,
  gtreqless: mA,
  gtreqqless: bA,
  gtrless: vA,
  gtrsim: yA,
  gvertneqq: xA,
  gvnE: kA,
  Hacek: EA,
  hairsp: CA,
  half: AA,
  hamilt: wA,
  HARDcy: SA,
  hardcy: TA,
  harrcir: RA,
  harr: DA,
  hArr: MA,
  harrw: IA,
  Hat: NA,
  hbar: LA,
  Hcirc: OA,
  hcirc: FA,
  hearts: qA,
  heartsuit: PA,
  hellip: BA,
  hercon: $A,
  hfr: zA,
  Hfr: UA,
  HilbertSpace: HA,
  hksearow: VA,
  hkswarow: jA,
  hoarr: GA,
  homtht: KA,
  hookleftarrow: ZA,
  hookrightarrow: WA,
  hopf: JA,
  Hopf: YA,
  horbar: XA,
  HorizontalLine: QA,
  hscr: ew,
  Hscr: tw,
  hslash: nw,
  Hstrok: sw,
  hstrok: rw,
  HumpDownHump: ow,
  HumpEqual: cw,
  hybull: iw,
  hyphen: aw,
  Iacute: lw,
  iacute: uw,
  ic: fw,
  Icirc: hw,
  icirc: dw,
  Icy: pw,
  icy: gw,
  Idot: _w,
  IEcy: mw,
  iecy: bw,
  iexcl: vw,
  iff: yw,
  ifr: xw,
  Ifr: kw,
  Igrave: Ew,
  igrave: Cw,
  ii: Aw,
  iiiint: ww,
  iiint: Sw,
  iinfin: Tw,
  iiota: Rw,
  IJlig: Dw,
  ijlig: Mw,
  Imacr: Iw,
  imacr: Nw,
  image: Lw,
  ImaginaryI: Ow,
  imagline: Fw,
  imagpart: qw,
  imath: Pw,
  Im: Bw,
  imof: $w,
  imped: zw,
  Implies: Uw,
  incare: Hw,
  in: "∈",
  infin: Vw,
  infintie: jw,
  inodot: Gw,
  intcal: Kw,
  int: Zw,
  Int: Ww,
  integers: Jw,
  Integral: Yw,
  intercal: Xw,
  Intersection: Qw,
  intlarhk: eS,
  intprod: tS,
  InvisibleComma: nS,
  InvisibleTimes: sS,
  IOcy: rS,
  iocy: oS,
  Iogon: cS,
  iogon: iS,
  Iopf: aS,
  iopf: lS,
  Iota: uS,
  iota: fS,
  iprod: hS,
  iquest: dS,
  iscr: pS,
  Iscr: gS,
  isin: _S,
  isindot: mS,
  isinE: bS,
  isins: vS,
  isinsv: yS,
  isinv: xS,
  it: kS,
  Itilde: ES,
  itilde: CS,
  Iukcy: AS,
  iukcy: wS,
  Iuml: SS,
  iuml: TS,
  Jcirc: RS,
  jcirc: DS,
  Jcy: MS,
  jcy: IS,
  Jfr: NS,
  jfr: LS,
  jmath: OS,
  Jopf: FS,
  jopf: qS,
  Jscr: PS,
  jscr: BS,
  Jsercy: $S,
  jsercy: zS,
  Jukcy: US,
  jukcy: HS,
  Kappa: VS,
  kappa: jS,
  kappav: GS,
  Kcedil: KS,
  kcedil: ZS,
  Kcy: WS,
  kcy: JS,
  Kfr: YS,
  kfr: XS,
  kgreen: QS,
  KHcy: eT,
  khcy: tT,
  KJcy: nT,
  kjcy: sT,
  Kopf: rT,
  kopf: oT,
  Kscr: cT,
  kscr: iT,
  lAarr: aT,
  Lacute: lT,
  lacute: uT,
  laemptyv: fT,
  lagran: hT,
  Lambda: dT,
  lambda: pT,
  lang: gT,
  Lang: _T,
  langd: mT,
  langle: bT,
  lap: vT,
  Laplacetrf: yT,
  laquo: xT,
  larrb: kT,
  larrbfs: ET,
  larr: CT,
  Larr: AT,
  lArr: wT,
  larrfs: ST,
  larrhk: TT,
  larrlp: RT,
  larrpl: DT,
  larrsim: MT,
  larrtl: IT,
  latail: NT,
  lAtail: LT,
  lat: OT,
  late: FT,
  lates: qT,
  lbarr: PT,
  lBarr: BT,
  lbbrk: $T,
  lbrace: zT,
  lbrack: UT,
  lbrke: HT,
  lbrksld: VT,
  lbrkslu: jT,
  Lcaron: GT,
  lcaron: KT,
  Lcedil: ZT,
  lcedil: WT,
  lceil: JT,
  lcub: YT,
  Lcy: XT,
  lcy: QT,
  ldca: eR,
  ldquo: tR,
  ldquor: nR,
  ldrdhar: sR,
  ldrushar: rR,
  ldsh: oR,
  le: cR,
  lE: iR,
  LeftAngleBracket: aR,
  LeftArrowBar: lR,
  leftarrow: uR,
  LeftArrow: fR,
  Leftarrow: hR,
  LeftArrowRightArrow: dR,
  leftarrowtail: pR,
  LeftCeiling: gR,
  LeftDoubleBracket: _R,
  LeftDownTeeVector: mR,
  LeftDownVectorBar: bR,
  LeftDownVector: vR,
  LeftFloor: yR,
  leftharpoondown: xR,
  leftharpoonup: kR,
  leftleftarrows: ER,
  leftrightarrow: CR,
  LeftRightArrow: AR,
  Leftrightarrow: wR,
  leftrightarrows: SR,
  leftrightharpoons: TR,
  leftrightsquigarrow: RR,
  LeftRightVector: DR,
  LeftTeeArrow: MR,
  LeftTee: IR,
  LeftTeeVector: NR,
  leftthreetimes: LR,
  LeftTriangleBar: OR,
  LeftTriangle: FR,
  LeftTriangleEqual: qR,
  LeftUpDownVector: PR,
  LeftUpTeeVector: BR,
  LeftUpVectorBar: $R,
  LeftUpVector: zR,
  LeftVectorBar: UR,
  LeftVector: HR,
  lEg: VR,
  leg: jR,
  leq: GR,
  leqq: KR,
  leqslant: ZR,
  lescc: WR,
  les: JR,
  lesdot: YR,
  lesdoto: XR,
  lesdotor: QR,
  lesg: eD,
  lesges: tD,
  lessapprox: nD,
  lessdot: sD,
  lesseqgtr: rD,
  lesseqqgtr: oD,
  LessEqualGreater: cD,
  LessFullEqual: iD,
  LessGreater: aD,
  lessgtr: lD,
  LessLess: uD,
  lesssim: fD,
  LessSlantEqual: hD,
  LessTilde: dD,
  lfisht: pD,
  lfloor: gD,
  Lfr: _D,
  lfr: mD,
  lg: bD,
  lgE: vD,
  lHar: yD,
  lhard: xD,
  lharu: kD,
  lharul: ED,
  lhblk: CD,
  LJcy: AD,
  ljcy: wD,
  llarr: SD,
  ll: TD,
  Ll: RD,
  llcorner: DD,
  Lleftarrow: MD,
  llhard: ID,
  lltri: ND,
  Lmidot: LD,
  lmidot: OD,
  lmoustache: FD,
  lmoust: qD,
  lnap: PD,
  lnapprox: BD,
  lne: $D,
  lnE: zD,
  lneq: UD,
  lneqq: HD,
  lnsim: VD,
  loang: jD,
  loarr: GD,
  lobrk: KD,
  longleftarrow: ZD,
  LongLeftArrow: WD,
  Longleftarrow: JD,
  longleftrightarrow: YD,
  LongLeftRightArrow: XD,
  Longleftrightarrow: QD,
  longmapsto: eM,
  longrightarrow: tM,
  LongRightArrow: nM,
  Longrightarrow: sM,
  looparrowleft: rM,
  looparrowright: oM,
  lopar: cM,
  Lopf: iM,
  lopf: aM,
  loplus: lM,
  lotimes: uM,
  lowast: fM,
  lowbar: hM,
  LowerLeftArrow: dM,
  LowerRightArrow: pM,
  loz: gM,
  lozenge: _M,
  lozf: mM,
  lpar: bM,
  lparlt: vM,
  lrarr: yM,
  lrcorner: xM,
  lrhar: kM,
  lrhard: EM,
  lrm: CM,
  lrtri: AM,
  lsaquo: wM,
  lscr: SM,
  Lscr: TM,
  lsh: RM,
  Lsh: DM,
  lsim: MM,
  lsime: IM,
  lsimg: NM,
  lsqb: LM,
  lsquo: OM,
  lsquor: FM,
  Lstrok: qM,
  lstrok: PM,
  ltcc: BM,
  ltcir: $M,
  lt: zM,
  LT: UM,
  Lt: HM,
  ltdot: VM,
  lthree: jM,
  ltimes: GM,
  ltlarr: KM,
  ltquest: ZM,
  ltri: WM,
  ltrie: JM,
  ltrif: YM,
  ltrPar: XM,
  lurdshar: QM,
  luruhar: eI,
  lvertneqq: tI,
  lvnE: nI,
  macr: sI,
  male: rI,
  malt: oI,
  maltese: cI,
  Map: "⤅",
  map: iI,
  mapsto: aI,
  mapstodown: lI,
  mapstoleft: uI,
  mapstoup: fI,
  marker: hI,
  mcomma: dI,
  Mcy: pI,
  mcy: gI,
  mdash: _I,
  mDDot: mI,
  measuredangle: bI,
  MediumSpace: vI,
  Mellintrf: yI,
  Mfr: xI,
  mfr: kI,
  mho: EI,
  micro: CI,
  midast: AI,
  midcir: wI,
  mid: SI,
  middot: TI,
  minusb: RI,
  minus: DI,
  minusd: MI,
  minusdu: II,
  MinusPlus: NI,
  mlcp: LI,
  mldr: OI,
  mnplus: FI,
  models: qI,
  Mopf: PI,
  mopf: BI,
  mp: $I,
  mscr: zI,
  Mscr: UI,
  mstpos: HI,
  Mu: VI,
  mu: jI,
  multimap: GI,
  mumap: KI,
  nabla: ZI,
  Nacute: WI,
  nacute: JI,
  nang: YI,
  nap: XI,
  napE: QI,
  napid: eN,
  napos: tN,
  napprox: nN,
  natural: sN,
  naturals: rN,
  natur: oN,
  nbsp: cN,
  nbump: iN,
  nbumpe: aN,
  ncap: lN,
  Ncaron: uN,
  ncaron: fN,
  Ncedil: hN,
  ncedil: dN,
  ncong: pN,
  ncongdot: gN,
  ncup: _N,
  Ncy: mN,
  ncy: bN,
  ndash: vN,
  nearhk: yN,
  nearr: xN,
  neArr: kN,
  nearrow: EN,
  ne: CN,
  nedot: AN,
  NegativeMediumSpace: wN,
  NegativeThickSpace: SN,
  NegativeThinSpace: TN,
  NegativeVeryThinSpace: RN,
  nequiv: DN,
  nesear: MN,
  nesim: IN,
  NestedGreaterGreater: NN,
  NestedLessLess: LN,
  NewLine: ON,
  nexist: FN,
  nexists: qN,
  Nfr: PN,
  nfr: BN,
  ngE: $N,
  nge: zN,
  ngeq: UN,
  ngeqq: HN,
  ngeqslant: VN,
  nges: jN,
  nGg: GN,
  ngsim: KN,
  nGt: ZN,
  ngt: WN,
  ngtr: JN,
  nGtv: YN,
  nharr: XN,
  nhArr: QN,
  nhpar: eL,
  ni: tL,
  nis: nL,
  nisd: sL,
  niv: rL,
  NJcy: oL,
  njcy: cL,
  nlarr: iL,
  nlArr: aL,
  nldr: lL,
  nlE: uL,
  nle: fL,
  nleftarrow: hL,
  nLeftarrow: dL,
  nleftrightarrow: pL,
  nLeftrightarrow: gL,
  nleq: _L,
  nleqq: mL,
  nleqslant: bL,
  nles: vL,
  nless: yL,
  nLl: xL,
  nlsim: kL,
  nLt: EL,
  nlt: CL,
  nltri: AL,
  nltrie: wL,
  nLtv: SL,
  nmid: TL,
  NoBreak: RL,
  NonBreakingSpace: DL,
  nopf: ML,
  Nopf: IL,
  Not: NL,
  not: LL,
  NotCongruent: OL,
  NotCupCap: FL,
  NotDoubleVerticalBar: qL,
  NotElement: PL,
  NotEqual: BL,
  NotEqualTilde: $L,
  NotExists: zL,
  NotGreater: UL,
  NotGreaterEqual: HL,
  NotGreaterFullEqual: VL,
  NotGreaterGreater: jL,
  NotGreaterLess: GL,
  NotGreaterSlantEqual: KL,
  NotGreaterTilde: ZL,
  NotHumpDownHump: WL,
  NotHumpEqual: JL,
  notin: YL,
  notindot: XL,
  notinE: QL,
  notinva: e2,
  notinvb: t2,
  notinvc: n2,
  NotLeftTriangleBar: s2,
  NotLeftTriangle: r2,
  NotLeftTriangleEqual: o2,
  NotLess: c2,
  NotLessEqual: i2,
  NotLessGreater: a2,
  NotLessLess: l2,
  NotLessSlantEqual: u2,
  NotLessTilde: f2,
  NotNestedGreaterGreater: h2,
  NotNestedLessLess: d2,
  notni: p2,
  notniva: g2,
  notnivb: _2,
  notnivc: m2,
  NotPrecedes: b2,
  NotPrecedesEqual: v2,
  NotPrecedesSlantEqual: y2,
  NotReverseElement: x2,
  NotRightTriangleBar: k2,
  NotRightTriangle: E2,
  NotRightTriangleEqual: C2,
  NotSquareSubset: A2,
  NotSquareSubsetEqual: w2,
  NotSquareSuperset: S2,
  NotSquareSupersetEqual: T2,
  NotSubset: R2,
  NotSubsetEqual: D2,
  NotSucceeds: M2,
  NotSucceedsEqual: I2,
  NotSucceedsSlantEqual: N2,
  NotSucceedsTilde: L2,
  NotSuperset: O2,
  NotSupersetEqual: F2,
  NotTilde: q2,
  NotTildeEqual: P2,
  NotTildeFullEqual: B2,
  NotTildeTilde: $2,
  NotVerticalBar: z2,
  nparallel: U2,
  npar: H2,
  nparsl: V2,
  npart: j2,
  npolint: G2,
  npr: K2,
  nprcue: Z2,
  nprec: W2,
  npreceq: J2,
  npre: Y2,
  nrarrc: X2,
  nrarr: Q2,
  nrArr: eO,
  nrarrw: tO,
  nrightarrow: nO,
  nRightarrow: sO,
  nrtri: rO,
  nrtrie: oO,
  nsc: cO,
  nsccue: iO,
  nsce: aO,
  Nscr: lO,
  nscr: uO,
  nshortmid: fO,
  nshortparallel: hO,
  nsim: dO,
  nsime: pO,
  nsimeq: gO,
  nsmid: _O,
  nspar: mO,
  nsqsube: bO,
  nsqsupe: vO,
  nsub: yO,
  nsubE: xO,
  nsube: kO,
  nsubset: EO,
  nsubseteq: CO,
  nsubseteqq: AO,
  nsucc: wO,
  nsucceq: SO,
  nsup: TO,
  nsupE: RO,
  nsupe: DO,
  nsupset: MO,
  nsupseteq: IO,
  nsupseteqq: NO,
  ntgl: LO,
  Ntilde: OO,
  ntilde: FO,
  ntlg: qO,
  ntriangleleft: PO,
  ntrianglelefteq: BO,
  ntriangleright: $O,
  ntrianglerighteq: zO,
  Nu: UO,
  nu: HO,
  num: VO,
  numero: jO,
  numsp: GO,
  nvap: KO,
  nvdash: ZO,
  nvDash: WO,
  nVdash: JO,
  nVDash: YO,
  nvge: XO,
  nvgt: QO,
  nvHarr: eF,
  nvinfin: tF,
  nvlArr: nF,
  nvle: sF,
  nvlt: rF,
  nvltrie: oF,
  nvrArr: cF,
  nvrtrie: iF,
  nvsim: aF,
  nwarhk: lF,
  nwarr: uF,
  nwArr: fF,
  nwarrow: hF,
  nwnear: dF,
  Oacute: pF,
  oacute: gF,
  oast: _F,
  Ocirc: mF,
  ocirc: bF,
  ocir: vF,
  Ocy: yF,
  ocy: xF,
  odash: kF,
  Odblac: EF,
  odblac: CF,
  odiv: AF,
  odot: wF,
  odsold: SF,
  OElig: TF,
  oelig: RF,
  ofcir: DF,
  Ofr: MF,
  ofr: IF,
  ogon: NF,
  Ograve: LF,
  ograve: OF,
  ogt: FF,
  ohbar: qF,
  ohm: PF,
  oint: BF,
  olarr: $F,
  olcir: zF,
  olcross: UF,
  oline: HF,
  olt: VF,
  Omacr: jF,
  omacr: GF,
  Omega: KF,
  omega: ZF,
  Omicron: WF,
  omicron: JF,
  omid: YF,
  ominus: XF,
  Oopf: QF,
  oopf: eq,
  opar: tq,
  OpenCurlyDoubleQuote: nq,
  OpenCurlyQuote: sq,
  operp: rq,
  oplus: oq,
  orarr: cq,
  Or: iq,
  or: aq,
  ord: lq,
  order: uq,
  orderof: fq,
  ordf: hq,
  ordm: dq,
  origof: pq,
  oror: gq,
  orslope: _q,
  orv: mq,
  oS: bq,
  Oscr: vq,
  oscr: yq,
  Oslash: xq,
  oslash: kq,
  osol: Eq,
  Otilde: Cq,
  otilde: Aq,
  otimesas: wq,
  Otimes: Sq,
  otimes: Tq,
  Ouml: Rq,
  ouml: Dq,
  ovbar: Mq,
  OverBar: Iq,
  OverBrace: Nq,
  OverBracket: Lq,
  OverParenthesis: Oq,
  para: Fq,
  parallel: qq,
  par: Pq,
  parsim: Bq,
  parsl: $q,
  part: zq,
  PartialD: Uq,
  Pcy: Hq,
  pcy: Vq,
  percnt: jq,
  period: Gq,
  permil: Kq,
  perp: Zq,
  pertenk: Wq,
  Pfr: Jq,
  pfr: Yq,
  Phi: Xq,
  phi: Qq,
  phiv: eP,
  phmmat: tP,
  phone: nP,
  Pi: sP,
  pi: rP,
  pitchfork: oP,
  piv: cP,
  planck: iP,
  planckh: aP,
  plankv: lP,
  plusacir: uP,
  plusb: fP,
  pluscir: hP,
  plus: dP,
  plusdo: pP,
  plusdu: gP,
  pluse: _P,
  PlusMinus: mP,
  plusmn: bP,
  plussim: vP,
  plustwo: yP,
  pm: xP,
  Poincareplane: kP,
  pointint: EP,
  popf: CP,
  Popf: AP,
  pound: wP,
  prap: SP,
  Pr: TP,
  pr: RP,
  prcue: DP,
  precapprox: MP,
  prec: IP,
  preccurlyeq: NP,
  Precedes: LP,
  PrecedesEqual: OP,
  PrecedesSlantEqual: FP,
  PrecedesTilde: qP,
  preceq: PP,
  precnapprox: BP,
  precneqq: $P,
  precnsim: zP,
  pre: UP,
  prE: HP,
  precsim: VP,
  prime: jP,
  Prime: GP,
  primes: KP,
  prnap: ZP,
  prnE: WP,
  prnsim: JP,
  prod: YP,
  Product: XP,
  profalar: QP,
  profline: eB,
  profsurf: tB,
  prop: nB,
  Proportional: sB,
  Proportion: rB,
  propto: oB,
  prsim: cB,
  prurel: iB,
  Pscr: aB,
  pscr: lB,
  Psi: uB,
  psi: fB,
  puncsp: hB,
  Qfr: dB,
  qfr: pB,
  qint: gB,
  qopf: _B,
  Qopf: mB,
  qprime: bB,
  Qscr: vB,
  qscr: yB,
  quaternions: xB,
  quatint: kB,
  quest: EB,
  questeq: CB,
  quot: AB,
  QUOT: wB,
  rAarr: SB,
  race: TB,
  Racute: RB,
  racute: DB,
  radic: MB,
  raemptyv: IB,
  rang: NB,
  Rang: LB,
  rangd: OB,
  range: FB,
  rangle: qB,
  raquo: PB,
  rarrap: BB,
  rarrb: $B,
  rarrbfs: zB,
  rarrc: UB,
  rarr: HB,
  Rarr: VB,
  rArr: jB,
  rarrfs: GB,
  rarrhk: KB,
  rarrlp: ZB,
  rarrpl: WB,
  rarrsim: JB,
  Rarrtl: YB,
  rarrtl: XB,
  rarrw: QB,
  ratail: e$,
  rAtail: t$,
  ratio: n$,
  rationals: s$,
  rbarr: r$,
  rBarr: o$,
  RBarr: c$,
  rbbrk: i$,
  rbrace: a$,
  rbrack: l$,
  rbrke: u$,
  rbrksld: f$,
  rbrkslu: h$,
  Rcaron: d$,
  rcaron: p$,
  Rcedil: g$,
  rcedil: _$,
  rceil: m$,
  rcub: b$,
  Rcy: v$,
  rcy: y$,
  rdca: x$,
  rdldhar: k$,
  rdquo: E$,
  rdquor: C$,
  rdsh: A$,
  real: w$,
  realine: S$,
  realpart: T$,
  reals: R$,
  Re: D$,
  rect: M$,
  reg: I$,
  REG: N$,
  ReverseElement: L$,
  ReverseEquilibrium: O$,
  ReverseUpEquilibrium: F$,
  rfisht: q$,
  rfloor: P$,
  rfr: B$,
  Rfr: $$,
  rHar: z$,
  rhard: U$,
  rharu: H$,
  rharul: V$,
  Rho: j$,
  rho: G$,
  rhov: K$,
  RightAngleBracket: Z$,
  RightArrowBar: W$,
  rightarrow: J$,
  RightArrow: Y$,
  Rightarrow: X$,
  RightArrowLeftArrow: Q$,
  rightarrowtail: ez,
  RightCeiling: tz,
  RightDoubleBracket: nz,
  RightDownTeeVector: sz,
  RightDownVectorBar: rz,
  RightDownVector: oz,
  RightFloor: cz,
  rightharpoondown: iz,
  rightharpoonup: az,
  rightleftarrows: lz,
  rightleftharpoons: uz,
  rightrightarrows: fz,
  rightsquigarrow: hz,
  RightTeeArrow: dz,
  RightTee: pz,
  RightTeeVector: gz,
  rightthreetimes: _z,
  RightTriangleBar: mz,
  RightTriangle: bz,
  RightTriangleEqual: vz,
  RightUpDownVector: yz,
  RightUpTeeVector: xz,
  RightUpVectorBar: kz,
  RightUpVector: Ez,
  RightVectorBar: Cz,
  RightVector: Az,
  ring: wz,
  risingdotseq: Sz,
  rlarr: Tz,
  rlhar: Rz,
  rlm: Dz,
  rmoustache: Mz,
  rmoust: Iz,
  rnmid: Nz,
  roang: Lz,
  roarr: Oz,
  robrk: Fz,
  ropar: qz,
  ropf: Pz,
  Ropf: Bz,
  roplus: $z,
  rotimes: zz,
  RoundImplies: Uz,
  rpar: Hz,
  rpargt: Vz,
  rppolint: jz,
  rrarr: Gz,
  Rrightarrow: Kz,
  rsaquo: Zz,
  rscr: Wz,
  Rscr: Jz,
  rsh: Yz,
  Rsh: Xz,
  rsqb: Qz,
  rsquo: e3,
  rsquor: t3,
  rthree: n3,
  rtimes: s3,
  rtri: r3,
  rtrie: o3,
  rtrif: c3,
  rtriltri: i3,
  RuleDelayed: a3,
  ruluhar: l3,
  rx: u3,
  Sacute: f3,
  sacute: h3,
  sbquo: d3,
  scap: p3,
  Scaron: g3,
  scaron: _3,
  Sc: m3,
  sc: b3,
  sccue: v3,
  sce: y3,
  scE: x3,
  Scedil: k3,
  scedil: E3,
  Scirc: C3,
  scirc: A3,
  scnap: w3,
  scnE: S3,
  scnsim: T3,
  scpolint: R3,
  scsim: D3,
  Scy: M3,
  scy: I3,
  sdotb: N3,
  sdot: L3,
  sdote: O3,
  searhk: F3,
  searr: q3,
  seArr: P3,
  searrow: B3,
  sect: $3,
  semi: z3,
  seswar: U3,
  setminus: H3,
  setmn: V3,
  sext: j3,
  Sfr: G3,
  sfr: K3,
  sfrown: Z3,
  sharp: W3,
  SHCHcy: J3,
  shchcy: Y3,
  SHcy: X3,
  shcy: Q3,
  ShortDownArrow: eU,
  ShortLeftArrow: tU,
  shortmid: nU,
  shortparallel: sU,
  ShortRightArrow: rU,
  ShortUpArrow: oU,
  shy: cU,
  Sigma: iU,
  sigma: aU,
  sigmaf: lU,
  sigmav: uU,
  sim: fU,
  simdot: hU,
  sime: dU,
  simeq: pU,
  simg: gU,
  simgE: _U,
  siml: mU,
  simlE: bU,
  simne: vU,
  simplus: yU,
  simrarr: xU,
  slarr: kU,
  SmallCircle: EU,
  smallsetminus: CU,
  smashp: AU,
  smeparsl: wU,
  smid: SU,
  smile: TU,
  smt: RU,
  smte: DU,
  smtes: MU,
  SOFTcy: IU,
  softcy: NU,
  solbar: LU,
  solb: OU,
  sol: FU,
  Sopf: qU,
  sopf: PU,
  spades: BU,
  spadesuit: $U,
  spar: zU,
  sqcap: UU,
  sqcaps: HU,
  sqcup: VU,
  sqcups: jU,
  Sqrt: GU,
  sqsub: KU,
  sqsube: ZU,
  sqsubset: WU,
  sqsubseteq: JU,
  sqsup: YU,
  sqsupe: XU,
  sqsupset: QU,
  sqsupseteq: eH,
  square: tH,
  Square: nH,
  SquareIntersection: sH,
  SquareSubset: rH,
  SquareSubsetEqual: oH,
  SquareSuperset: cH,
  SquareSupersetEqual: iH,
  SquareUnion: aH,
  squarf: lH,
  squ: uH,
  squf: fH,
  srarr: hH,
  Sscr: dH,
  sscr: pH,
  ssetmn: gH,
  ssmile: _H,
  sstarf: mH,
  Star: bH,
  star: vH,
  starf: yH,
  straightepsilon: xH,
  straightphi: kH,
  strns: EH,
  sub: CH,
  Sub: AH,
  subdot: wH,
  subE: SH,
  sube: TH,
  subedot: RH,
  submult: DH,
  subnE: MH,
  subne: IH,
  subplus: NH,
  subrarr: LH,
  subset: OH,
  Subset: FH,
  subseteq: qH,
  subseteqq: PH,
  SubsetEqual: BH,
  subsetneq: $H,
  subsetneqq: zH,
  subsim: UH,
  subsub: HH,
  subsup: VH,
  succapprox: jH,
  succ: GH,
  succcurlyeq: KH,
  Succeeds: ZH,
  SucceedsEqual: WH,
  SucceedsSlantEqual: JH,
  SucceedsTilde: YH,
  succeq: XH,
  succnapprox: QH,
  succneqq: e4,
  succnsim: t4,
  succsim: n4,
  SuchThat: s4,
  sum: r4,
  Sum: o4,
  sung: c4,
  sup1: i4,
  sup2: a4,
  sup3: l4,
  sup: u4,
  Sup: f4,
  supdot: h4,
  supdsub: d4,
  supE: p4,
  supe: g4,
  supedot: _4,
  Superset: m4,
  SupersetEqual: b4,
  suphsol: v4,
  suphsub: y4,
  suplarr: x4,
  supmult: k4,
  supnE: E4,
  supne: C4,
  supplus: A4,
  supset: w4,
  Supset: S4,
  supseteq: T4,
  supseteqq: R4,
  supsetneq: D4,
  supsetneqq: M4,
  supsim: I4,
  supsub: N4,
  supsup: L4,
  swarhk: O4,
  swarr: F4,
  swArr: q4,
  swarrow: P4,
  swnwar: B4,
  szlig: $4,
  Tab: z4,
  target: U4,
  Tau: H4,
  tau: V4,
  tbrk: j4,
  Tcaron: G4,
  tcaron: K4,
  Tcedil: Z4,
  tcedil: W4,
  Tcy: J4,
  tcy: Y4,
  tdot: X4,
  telrec: Q4,
  Tfr: e6,
  tfr: t6,
  there4: n6,
  therefore: s6,
  Therefore: r6,
  Theta: o6,
  theta: c6,
  thetasym: i6,
  thetav: a6,
  thickapprox: l6,
  thicksim: u6,
  ThickSpace: f6,
  ThinSpace: h6,
  thinsp: d6,
  thkap: p6,
  thksim: g6,
  THORN: _6,
  thorn: m6,
  tilde: b6,
  Tilde: v6,
  TildeEqual: y6,
  TildeFullEqual: x6,
  TildeTilde: k6,
  timesbar: E6,
  timesb: C6,
  times: A6,
  timesd: w6,
  tint: S6,
  toea: T6,
  topbot: R6,
  topcir: D6,
  top: M6,
  Topf: I6,
  topf: N6,
  topfork: L6,
  tosa: O6,
  tprime: F6,
  trade: q6,
  TRADE: P6,
  triangle: B6,
  triangledown: $6,
  triangleleft: z6,
  trianglelefteq: U6,
  triangleq: H6,
  triangleright: V6,
  trianglerighteq: j6,
  tridot: G6,
  trie: K6,
  triminus: Z6,
  TripleDot: W6,
  triplus: J6,
  trisb: Y6,
  tritime: X6,
  trpezium: Q6,
  Tscr: e5,
  tscr: t5,
  TScy: n5,
  tscy: s5,
  TSHcy: r5,
  tshcy: o5,
  Tstrok: c5,
  tstrok: i5,
  twixt: a5,
  twoheadleftarrow: l5,
  twoheadrightarrow: u5,
  Uacute: f5,
  uacute: h5,
  uarr: d5,
  Uarr: p5,
  uArr: g5,
  Uarrocir: _5,
  Ubrcy: m5,
  ubrcy: b5,
  Ubreve: v5,
  ubreve: y5,
  Ucirc: x5,
  ucirc: k5,
  Ucy: E5,
  ucy: C5,
  udarr: A5,
  Udblac: w5,
  udblac: S5,
  udhar: T5,
  ufisht: R5,
  Ufr: D5,
  ufr: M5,
  Ugrave: I5,
  ugrave: N5,
  uHar: L5,
  uharl: O5,
  uharr: F5,
  uhblk: q5,
  ulcorn: P5,
  ulcorner: B5,
  ulcrop: $5,
  ultri: z5,
  Umacr: U5,
  umacr: H5,
  uml: V5,
  UnderBar: j5,
  UnderBrace: G5,
  UnderBracket: K5,
  UnderParenthesis: Z5,
  Union: W5,
  UnionPlus: J5,
  Uogon: Y5,
  uogon: X5,
  Uopf: Q5,
  uopf: e9,
  UpArrowBar: t9,
  uparrow: n9,
  UpArrow: s9,
  Uparrow: r9,
  UpArrowDownArrow: o9,
  updownarrow: c9,
  UpDownArrow: i9,
  Updownarrow: a9,
  UpEquilibrium: l9,
  upharpoonleft: u9,
  upharpoonright: f9,
  uplus: h9,
  UpperLeftArrow: d9,
  UpperRightArrow: p9,
  upsi: g9,
  Upsi: _9,
  upsih: m9,
  Upsilon: b9,
  upsilon: v9,
  UpTeeArrow: y9,
  UpTee: x9,
  upuparrows: k9,
  urcorn: E9,
  urcorner: C9,
  urcrop: A9,
  Uring: w9,
  uring: S9,
  urtri: T9,
  Uscr: R9,
  uscr: D9,
  utdot: M9,
  Utilde: I9,
  utilde: N9,
  utri: L9,
  utrif: O9,
  uuarr: F9,
  Uuml: q9,
  uuml: P9,
  uwangle: B9,
  vangrt: $9,
  varepsilon: z9,
  varkappa: U9,
  varnothing: H9,
  varphi: V9,
  varpi: j9,
  varpropto: G9,
  varr: K9,
  vArr: Z9,
  varrho: W9,
  varsigma: J9,
  varsubsetneq: Y9,
  varsubsetneqq: X9,
  varsupsetneq: Q9,
  varsupsetneqq: e8,
  vartheta: t8,
  vartriangleleft: n8,
  vartriangleright: s8,
  vBar: r8,
  Vbar: o8,
  vBarv: c8,
  Vcy: i8,
  vcy: a8,
  vdash: l8,
  vDash: u8,
  Vdash: f8,
  VDash: h8,
  Vdashl: d8,
  veebar: p8,
  vee: g8,
  Vee: _8,
  veeeq: m8,
  vellip: b8,
  verbar: v8,
  Verbar: y8,
  vert: x8,
  Vert: k8,
  VerticalBar: E8,
  VerticalLine: C8,
  VerticalSeparator: A8,
  VerticalTilde: w8,
  VeryThinSpace: S8,
  Vfr: T8,
  vfr: R8,
  vltri: D8,
  vnsub: M8,
  vnsup: I8,
  Vopf: N8,
  vopf: L8,
  vprop: O8,
  vrtri: F8,
  Vscr: q8,
  vscr: P8,
  vsubnE: B8,
  vsubne: $8,
  vsupnE: z8,
  vsupne: U8,
  Vvdash: H8,
  vzigzag: V8,
  Wcirc: j8,
  wcirc: G8,
  wedbar: K8,
  wedge: Z8,
  Wedge: W8,
  wedgeq: J8,
  weierp: Y8,
  Wfr: X8,
  wfr: Q8,
  Wopf: eV,
  wopf: tV,
  wp: nV,
  wr: sV,
  wreath: rV,
  Wscr: oV,
  wscr: cV,
  xcap: iV,
  xcirc: aV,
  xcup: lV,
  xdtri: uV,
  Xfr: fV,
  xfr: hV,
  xharr: dV,
  xhArr: pV,
  Xi: gV,
  xi: _V,
  xlarr: mV,
  xlArr: bV,
  xmap: vV,
  xnis: yV,
  xodot: xV,
  Xopf: kV,
  xopf: EV,
  xoplus: CV,
  xotime: AV,
  xrarr: wV,
  xrArr: SV,
  Xscr: TV,
  xscr: RV,
  xsqcup: DV,
  xuplus: MV,
  xutri: IV,
  xvee: NV,
  xwedge: LV,
  Yacute: OV,
  yacute: FV,
  YAcy: qV,
  yacy: PV,
  Ycirc: BV,
  ycirc: $V,
  Ycy: zV,
  ycy: UV,
  yen: HV,
  Yfr: VV,
  yfr: jV,
  YIcy: GV,
  yicy: KV,
  Yopf: ZV,
  yopf: WV,
  Yscr: JV,
  yscr: YV,
  YUcy: XV,
  yucy: QV,
  yuml: ej,
  Yuml: tj,
  Zacute: nj,
  zacute: sj,
  Zcaron: rj,
  zcaron: oj,
  Zcy: cj,
  zcy: ij,
  Zdot: aj,
  zdot: lj,
  zeetrf: uj,
  ZeroWidthSpace: fj,
  Zeta: hj,
  zeta: dj,
  zfr: pj,
  Zfr: gj,
  ZHcy: _j,
  zhcy: mj,
  zigrarr: bj,
  zopf: vj,
  Zopf: yj,
  Zscr: xj,
  zscr: kj,
  zwj: Ej,
  zwnj: Cj
};
var vr, vi;
function pu() {
  return vi || (vi = 1, vr = Aj), vr;
}
var yr, yi;
function lc() {
  return yi || (yi = 1, yr = /[!-#%-\*,-\/:;\?@\[-\]_\{\}\xA1\xA7\xAB\xB6\xB7\xBB\xBF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061E\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u09FD\u0A76\u0AF0\u0C84\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166D\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2308-\u230B\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E4E\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]|\uD800[\uDD00-\uDD02\uDF9F\uDFD0]|\uD801\uDD6F|\uD802[\uDC57\uDD1F\uDD3F\uDE50-\uDE58\uDE7F\uDEF0-\uDEF6\uDF39-\uDF3F\uDF99-\uDF9C]|\uD803[\uDF55-\uDF59]|\uD804[\uDC47-\uDC4D\uDCBB\uDCBC\uDCBE-\uDCC1\uDD40-\uDD43\uDD74\uDD75\uDDC5-\uDDC8\uDDCD\uDDDB\uDDDD-\uDDDF\uDE38-\uDE3D\uDEA9]|\uD805[\uDC4B-\uDC4F\uDC5B\uDC5D\uDCC6\uDDC1-\uDDD7\uDE41-\uDE43\uDE60-\uDE6C\uDF3C-\uDF3E]|\uD806[\uDC3B\uDE3F-\uDE46\uDE9A-\uDE9C\uDE9E-\uDEA2]|\uD807[\uDC41-\uDC45\uDC70\uDC71\uDEF7\uDEF8]|\uD809[\uDC70-\uDC74]|\uD81A[\uDE6E\uDE6F\uDEF5\uDF37-\uDF3B\uDF44]|\uD81B[\uDE97-\uDE9A]|\uD82F\uDC9F|\uD836[\uDE87-\uDE8B]|\uD83A[\uDD5E\uDD5F]/), yr;
}
var _n = {}, xr, xi;
function wj() {
  if (xi) return xr;
  xi = 1;
  var e = {};
  function t(s) {
    var r, o, c = e[s];
    if (c)
      return c;
    for (c = e[s] = [], r = 0; r < 128; r++)
      o = String.fromCharCode(r), /^[0-9a-z]$/i.test(o) ? c.push(o) : c.push("%" + ("0" + r.toString(16).toUpperCase()).slice(-2));
    for (r = 0; r < s.length; r++)
      c[s.charCodeAt(r)] = s[r];
    return c;
  }
  function n(s, r, o) {
    var c, i, a, l, u, f = "";
    for (typeof r != "string" && (o = r, r = n.defaultChars), typeof o > "u" && (o = !0), u = t(r), c = 0, i = s.length; c < i; c++) {
      if (a = s.charCodeAt(c), o && a === 37 && c + 2 < i && /^[0-9a-f]{2}$/i.test(s.slice(c + 1, c + 3))) {
        f += s.slice(c, c + 3), c += 2;
        continue;
      }
      if (a < 128) {
        f += u[a];
        continue;
      }
      if (a >= 55296 && a <= 57343) {
        if (a >= 55296 && a <= 56319 && c + 1 < i && (l = s.charCodeAt(c + 1), l >= 56320 && l <= 57343)) {
          f += encodeURIComponent(s[c] + s[c + 1]), c++;
          continue;
        }
        f += "%EF%BF%BD";
        continue;
      }
      f += encodeURIComponent(s[c]);
    }
    return f;
  }
  return n.defaultChars = ";/?:@&=+$,-_.!~*'()#", n.componentChars = "-_.!~*'()", xr = n, xr;
}
var kr, ki;
function Sj() {
  if (ki) return kr;
  ki = 1;
  var e = {};
  function t(s) {
    var r, o, c = e[s];
    if (c)
      return c;
    for (c = e[s] = [], r = 0; r < 128; r++)
      o = String.fromCharCode(r), c.push(o);
    for (r = 0; r < s.length; r++)
      o = s.charCodeAt(r), c[o] = "%" + ("0" + o.toString(16).toUpperCase()).slice(-2);
    return c;
  }
  function n(s, r) {
    var o;
    return typeof r != "string" && (r = n.defaultChars), o = t(r), s.replace(/(%[a-f0-9]{2})+/gi, function(c) {
      var i, a, l, u, f, d, h, m = "";
      for (i = 0, a = c.length; i < a; i += 3) {
        if (l = parseInt(c.slice(i + 1, i + 3), 16), l < 128) {
          m += o[l];
          continue;
        }
        if ((l & 224) === 192 && i + 3 < a && (u = parseInt(c.slice(i + 4, i + 6), 16), (u & 192) === 128)) {
          h = l << 6 & 1984 | u & 63, h < 128 ? m += "��" : m += String.fromCharCode(h), i += 3;
          continue;
        }
        if ((l & 240) === 224 && i + 6 < a && (u = parseInt(c.slice(i + 4, i + 6), 16), f = parseInt(c.slice(i + 7, i + 9), 16), (u & 192) === 128 && (f & 192) === 128)) {
          h = l << 12 & 61440 | u << 6 & 4032 | f & 63, h < 2048 || h >= 55296 && h <= 57343 ? m += "���" : m += String.fromCharCode(h), i += 6;
          continue;
        }
        if ((l & 248) === 240 && i + 9 < a && (u = parseInt(c.slice(i + 4, i + 6), 16), f = parseInt(c.slice(i + 7, i + 9), 16), d = parseInt(c.slice(i + 10, i + 12), 16), (u & 192) === 128 && (f & 192) === 128 && (d & 192) === 128)) {
          h = l << 18 & 1835008 | u << 12 & 258048 | f << 6 & 4032 | d & 63, h < 65536 || h > 1114111 ? m += "����" : (h -= 65536, m += String.fromCharCode(55296 + (h >> 10), 56320 + (h & 1023))), i += 9;
          continue;
        }
        m += "�";
      }
      return m;
    });
  }
  return n.defaultChars = ";/?:@&=+$,#", n.componentChars = "", kr = n, kr;
}
var Er, Ei;
function Tj() {
  return Ei || (Ei = 1, Er = function(t) {
    var n = "";
    return n += t.protocol || "", n += t.slashes ? "//" : "", n += t.auth ? t.auth + "@" : "", t.hostname && t.hostname.indexOf(":") !== -1 ? n += "[" + t.hostname + "]" : n += t.hostname || "", n += t.port ? ":" + t.port : "", n += t.pathname || "", n += t.search || "", n += t.hash || "", n;
  }), Er;
}
var Cr, Ci;
function Rj() {
  if (Ci) return Cr;
  Ci = 1;
  function e() {
    this.protocol = null, this.slashes = null, this.auth = null, this.port = null, this.hostname = null, this.hash = null, this.search = null, this.pathname = null;
  }
  var t = /^([a-z0-9.+-]+:)/i, n = /:[0-9]*$/, s = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/, r = ["<", ">", '"', "`", " ", "\r", `
`, "	"], o = ["{", "}", "|", "\\", "^", "`"].concat(r), c = ["'"].concat(o), i = ["%", "/", "?", ";", "#"].concat(c), a = ["/", "?", "#"], l = 255, u = /^[+a-z0-9A-Z_-]{0,63}$/, f = /^([+a-z0-9A-Z_-]{0,63})(.*)$/, d = {
    javascript: !0,
    "javascript:": !0
  }, h = {
    http: !0,
    https: !0,
    ftp: !0,
    gopher: !0,
    file: !0,
    "http:": !0,
    "https:": !0,
    "ftp:": !0,
    "gopher:": !0,
    "file:": !0
  };
  function m(x, A) {
    if (x && x instanceof e)
      return x;
    var v = new e();
    return v.parse(x, A), v;
  }
  return e.prototype.parse = function(x, A) {
    var v, k, b, p, E, C = x;
    if (C = C.trim(), !A && x.split("#").length === 1) {
      var z = s.exec(C);
      if (z)
        return this.pathname = z[1], z[2] && (this.search = z[2]), this;
    }
    var T = t.exec(C);
    if (T && (T = T[0], b = T.toLowerCase(), this.protocol = T, C = C.substr(T.length)), (A || T || C.match(/^\/\/[^@\/]+@[^@\/]+/)) && (E = C.substr(0, 2) === "//", E && !(T && d[T]) && (C = C.substr(2), this.slashes = !0)), !d[T] && (E || T && !h[T])) {
      var R = -1;
      for (v = 0; v < a.length; v++)
        p = C.indexOf(a[v]), p !== -1 && (R === -1 || p < R) && (R = p);
      var M, q;
      for (R === -1 ? q = C.lastIndexOf("@") : q = C.lastIndexOf("@", R), q !== -1 && (M = C.slice(0, q), C = C.slice(q + 1), this.auth = M), R = -1, v = 0; v < i.length; v++)
        p = C.indexOf(i[v]), p !== -1 && (R === -1 || p < R) && (R = p);
      R === -1 && (R = C.length), C[R - 1] === ":" && R--;
      var I = C.slice(0, R);
      C = C.slice(R), this.parseHost(I), this.hostname = this.hostname || "";
      var se = this.hostname[0] === "[" && this.hostname[this.hostname.length - 1] === "]";
      if (!se) {
        var S = this.hostname.split(/\./);
        for (v = 0, k = S.length; v < k; v++) {
          var B = S[v];
          if (B && !B.match(u)) {
            for (var K = "", ee = 0, Z = B.length; ee < Z; ee++)
              B.charCodeAt(ee) > 127 ? K += "x" : K += B[ee];
            if (!K.match(u)) {
              var fe = S.slice(0, v), J = S.slice(v + 1), Ce = B.match(f);
              Ce && (fe.push(Ce[1]), J.unshift(Ce[2])), J.length && (C = J.join(".") + C), this.hostname = fe.join(".");
              break;
            }
          }
        }
      }
      this.hostname.length > l && (this.hostname = ""), se && (this.hostname = this.hostname.substr(1, this.hostname.length - 2));
    }
    var Ae = C.indexOf("#");
    Ae !== -1 && (this.hash = C.substr(Ae), C = C.slice(0, Ae));
    var rt = C.indexOf("?");
    return rt !== -1 && (this.search = C.substr(rt), C = C.slice(0, rt)), C && (this.pathname = C), h[b] && this.hostname && !this.pathname && (this.pathname = ""), this;
  }, e.prototype.parseHost = function(x) {
    var A = n.exec(x);
    A && (A = A[0], A !== ":" && (this.port = A.substr(1)), x = x.substr(0, x.length - A.length)), x && (this.hostname = x);
  }, Cr = m, Cr;
}
var Ai;
function gu() {
  return Ai || (Ai = 1, _n.encode = wj(), _n.decode = Sj(), _n.format = Tj(), _n.parse = Rj()), _n;
}
var cn = {}, Ar, wi;
function _u() {
  return wi || (wi = 1, Ar = /[\0-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/), Ar;
}
var wr, Si;
function mu() {
  return Si || (Si = 1, wr = /[\0-\x1F\x7F-\x9F]/), wr;
}
var Sr, Ti;
function Dj() {
  return Ti || (Ti = 1, Sr = /[\xAD\u0600-\u0605\u061C\u06DD\u070F\u08E2\u180E\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u206F\uFEFF\uFFF9-\uFFFB]|\uD804[\uDCBD\uDCCD]|\uD82F[\uDCA0-\uDCA3]|\uD834[\uDD73-\uDD7A]|\uDB40[\uDC01\uDC20-\uDC7F]/), Sr;
}
var Tr, Ri;
function bu() {
  return Ri || (Ri = 1, Tr = /[ \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/), Tr;
}
var Di;
function Mj() {
  return Di || (Di = 1, cn.Any = _u(), cn.Cc = mu(), cn.Cf = Dj(), cn.P = lc(), cn.Z = bu()), cn;
}
var Mi;
function xe() {
  return Mi || (Mi = 1, function(e) {
    function t(S) {
      return Object.prototype.toString.call(S);
    }
    function n(S) {
      return t(S) === "[object String]";
    }
    var s = Object.prototype.hasOwnProperty;
    function r(S, B) {
      return s.call(S, B);
    }
    function o(S) {
      var B = Array.prototype.slice.call(arguments, 1);
      return B.forEach(function(K) {
        if (K) {
          if (typeof K != "object")
            throw new TypeError(K + "must be object");
          Object.keys(K).forEach(function(ee) {
            S[ee] = K[ee];
          });
        }
      }), S;
    }
    function c(S, B, K) {
      return [].concat(S.slice(0, B), K, S.slice(B + 1));
    }
    function i(S) {
      return !(S >= 55296 && S <= 57343 || S >= 64976 && S <= 65007 || (S & 65535) === 65535 || (S & 65535) === 65534 || S >= 0 && S <= 8 || S === 11 || S >= 14 && S <= 31 || S >= 127 && S <= 159 || S > 1114111);
    }
    function a(S) {
      if (S > 65535) {
        S -= 65536;
        var B = 55296 + (S >> 10), K = 56320 + (S & 1023);
        return String.fromCharCode(B, K);
      }
      return String.fromCharCode(S);
    }
    var l = /\\([!"#$%&'()*+,\-.\/:;<=>?@[\\\]^_`{|}~])/g, u = /&([a-z#][a-z0-9]{1,31});/gi, f = new RegExp(l.source + "|" + u.source, "gi"), d = /^#((?:x[a-f0-9]{1,8}|[0-9]{1,8}))$/i, h = pu();
    function m(S, B) {
      var K;
      return r(h, B) ? h[B] : B.charCodeAt(0) === 35 && d.test(B) && (K = B[1].toLowerCase() === "x" ? parseInt(B.slice(2), 16) : parseInt(B.slice(1), 10), i(K)) ? a(K) : S;
    }
    function x(S) {
      return S.indexOf("\\") < 0 ? S : S.replace(l, "$1");
    }
    function A(S) {
      return S.indexOf("\\") < 0 && S.indexOf("&") < 0 ? S : S.replace(f, function(B, K, ee) {
        return K || m(B, ee);
      });
    }
    var v = /[&<>"]/, k = /[&<>"]/g, b = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;"
    };
    function p(S) {
      return b[S];
    }
    function E(S) {
      return v.test(S) ? S.replace(k, p) : S;
    }
    var C = /[.?*+^$[\]\\(){}|-]/g;
    function z(S) {
      return S.replace(C, "\\$&");
    }
    function T(S) {
      switch (S) {
        case 9:
        case 32:
          return !0;
      }
      return !1;
    }
    function R(S) {
      if (S >= 8192 && S <= 8202)
        return !0;
      switch (S) {
        case 9:
        // \t
        case 10:
        // \n
        case 11:
        // \v
        case 12:
        // \f
        case 13:
        // \r
        case 32:
        case 160:
        case 5760:
        case 8239:
        case 8287:
        case 12288:
          return !0;
      }
      return !1;
    }
    var M = lc();
    function q(S) {
      return M.test(S);
    }
    function I(S) {
      switch (S) {
        case 33:
        case 34:
        case 35:
        case 36:
        case 37:
        case 38:
        case 39:
        case 40:
        case 41:
        case 42:
        case 43:
        case 44:
        case 45:
        case 46:
        case 47:
        case 58:
        case 59:
        case 60:
        case 61:
        case 62:
        case 63:
        case 64:
        case 91:
        case 92:
        case 93:
        case 94:
        case 95:
        case 96:
        case 123:
        case 124:
        case 125:
        case 126:
          return !0;
        default:
          return !1;
      }
    }
    function se(S) {
      return S = S.trim().replace(/\s+/g, " "), "ẞ".toLowerCase() === "Ṿ" && (S = S.replace(/ẞ/g, "ß")), S.toLowerCase().toUpperCase();
    }
    e.lib = {}, e.lib.mdurl = gu(), e.lib.ucmicro = Mj(), e.assign = o, e.isString = n, e.has = r, e.unescapeMd = x, e.unescapeAll = A, e.isValidEntityCode = i, e.fromCodePoint = a, e.escapeHtml = E, e.arrayReplaceAt = c, e.isSpace = T, e.isWhiteSpace = R, e.isMdAsciiPunct = I, e.isPunctChar = q, e.escapeRE = z, e.normalizeReference = se;
  }(br)), br;
}
var qn = {}, Rr, Ii;
function Ij() {
  return Ii || (Ii = 1, Rr = function(t, n, s) {
    var r, o, c, i, a = -1, l = t.posMax, u = t.pos;
    for (t.pos = n + 1, r = 1; t.pos < l; ) {
      if (c = t.src.charCodeAt(t.pos), c === 93 && (r--, r === 0)) {
        o = !0;
        break;
      }
      if (i = t.pos, t.md.inline.skipToken(t), c === 91) {
        if (i === t.pos - 1)
          r++;
        else if (s)
          return t.pos = u, -1;
      }
    }
    return o && (a = t.pos), t.pos = u, a;
  }), Rr;
}
var Dr, Ni;
function Nj() {
  if (Ni) return Dr;
  Ni = 1;
  var e = xe().unescapeAll;
  return Dr = function(n, s, r) {
    var o, c, i = s, a = {
      ok: !1,
      pos: 0,
      lines: 0,
      str: ""
    };
    if (n.charCodeAt(i) === 60) {
      for (i++; i < r; ) {
        if (o = n.charCodeAt(i), o === 10 || o === 60)
          return a;
        if (o === 62)
          return a.pos = i + 1, a.str = e(n.slice(s + 1, i)), a.ok = !0, a;
        if (o === 92 && i + 1 < r) {
          i += 2;
          continue;
        }
        i++;
      }
      return a;
    }
    for (c = 0; i < r && (o = n.charCodeAt(i), !(o === 32 || o < 32 || o === 127)); ) {
      if (o === 92 && i + 1 < r) {
        if (n.charCodeAt(i + 1) === 32)
          break;
        i += 2;
        continue;
      }
      if (o === 40 && (c++, c > 32))
        return a;
      if (o === 41) {
        if (c === 0)
          break;
        c--;
      }
      i++;
    }
    return s === i || c !== 0 || (a.str = e(n.slice(s, i)), a.pos = i, a.ok = !0), a;
  }, Dr;
}
var Mr, Li;
function Lj() {
  if (Li) return Mr;
  Li = 1;
  var e = xe().unescapeAll;
  return Mr = function(n, s, r) {
    var o, c, i = 0, a = s, l = {
      ok: !1,
      pos: 0,
      lines: 0,
      str: ""
    };
    if (a >= r || (c = n.charCodeAt(a), c !== 34 && c !== 39 && c !== 40))
      return l;
    for (a++, c === 40 && (c = 41); a < r; ) {
      if (o = n.charCodeAt(a), o === c)
        return l.pos = a + 1, l.lines = i, l.str = e(n.slice(s + 1, a)), l.ok = !0, l;
      if (o === 40 && c === 41)
        return l;
      o === 10 ? i++ : o === 92 && a + 1 < r && (a++, n.charCodeAt(a) === 10 && i++), a++;
    }
    return l;
  }, Mr;
}
var Oi;
function Oj() {
  return Oi || (Oi = 1, qn.parseLinkLabel = Ij(), qn.parseLinkDestination = Nj(), qn.parseLinkTitle = Lj()), qn;
}
var Ir, Fi;
function Fj() {
  if (Fi) return Ir;
  Fi = 1;
  var e = xe().assign, t = xe().unescapeAll, n = xe().escapeHtml, s = {};
  s.code_inline = function(o, c, i, a, l) {
    var u = o[c];
    return "<code" + l.renderAttrs(u) + ">" + n(u.content) + "</code>";
  }, s.code_block = function(o, c, i, a, l) {
    var u = o[c];
    return "<pre" + l.renderAttrs(u) + "><code>" + n(o[c].content) + `</code></pre>
`;
  }, s.fence = function(o, c, i, a, l) {
    var u = o[c], f = u.info ? t(u.info).trim() : "", d = "", h = "", m, x, A, v, k;
    return f && (A = f.split(/(\s+)/g), d = A[0], h = A.slice(2).join("")), i.highlight ? m = i.highlight(u.content, d, h) || n(u.content) : m = n(u.content), m.indexOf("<pre") === 0 ? m + `
` : f ? (x = u.attrIndex("class"), v = u.attrs ? u.attrs.slice() : [], x < 0 ? v.push(["class", i.langPrefix + d]) : (v[x] = v[x].slice(), v[x][1] += " " + i.langPrefix + d), k = {
      attrs: v
    }, "<pre><code" + l.renderAttrs(k) + ">" + m + `</code></pre>
`) : "<pre><code" + l.renderAttrs(u) + ">" + m + `</code></pre>
`;
  }, s.image = function(o, c, i, a, l) {
    var u = o[c];
    return u.attrs[u.attrIndex("alt")][1] = l.renderInlineAsText(u.children, i, a), l.renderToken(o, c, i);
  }, s.hardbreak = function(o, c, i) {
    return i.xhtmlOut ? `<br />
` : `<br>
`;
  }, s.softbreak = function(o, c, i) {
    return i.breaks ? i.xhtmlOut ? `<br />
` : `<br>
` : `
`;
  }, s.text = function(o, c) {
    return n(o[c].content);
  }, s.html_block = function(o, c) {
    return o[c].content;
  }, s.html_inline = function(o, c) {
    return o[c].content;
  };
  function r() {
    this.rules = e({}, s);
  }
  return r.prototype.renderAttrs = function(c) {
    var i, a, l;
    if (!c.attrs)
      return "";
    for (l = "", i = 0, a = c.attrs.length; i < a; i++)
      l += " " + n(c.attrs[i][0]) + '="' + n(c.attrs[i][1]) + '"';
    return l;
  }, r.prototype.renderToken = function(c, i, a) {
    var l, u = "", f = !1, d = c[i];
    return d.hidden ? "" : (d.block && d.nesting !== -1 && i && c[i - 1].hidden && (u += `
`), u += (d.nesting === -1 ? "</" : "<") + d.tag, u += this.renderAttrs(d), d.nesting === 0 && a.xhtmlOut && (u += " /"), d.block && (f = !0, d.nesting === 1 && i + 1 < c.length && (l = c[i + 1], (l.type === "inline" || l.hidden || l.nesting === -1 && l.tag === d.tag) && (f = !1))), u += f ? `>
` : ">", u);
  }, r.prototype.renderInline = function(o, c, i) {
    for (var a, l = "", u = this.rules, f = 0, d = o.length; f < d; f++)
      a = o[f].type, typeof u[a] < "u" ? l += u[a](o, f, c, i, this) : l += this.renderToken(o, f, c);
    return l;
  }, r.prototype.renderInlineAsText = function(o, c, i) {
    for (var a = "", l = 0, u = o.length; l < u; l++)
      o[l].type === "text" ? a += o[l].content : o[l].type === "image" ? a += this.renderInlineAsText(o[l].children, c, i) : o[l].type === "softbreak" && (a += `
`);
    return a;
  }, r.prototype.render = function(o, c, i) {
    var a, l, u, f = "", d = this.rules;
    for (a = 0, l = o.length; a < l; a++)
      u = o[a].type, u === "inline" ? f += this.renderInline(o[a].children, c, i) : typeof d[u] < "u" ? f += d[u](o, a, c, i, this) : f += this.renderToken(o, a, c, i);
    return f;
  }, Ir = r, Ir;
}
var Nr, qi;
function uc() {
  if (qi) return Nr;
  qi = 1;
  function e() {
    this.__rules__ = [], this.__cache__ = null;
  }
  return e.prototype.__find__ = function(t) {
    for (var n = 0; n < this.__rules__.length; n++)
      if (this.__rules__[n].name === t)
        return n;
    return -1;
  }, e.prototype.__compile__ = function() {
    var t = this, n = [""];
    t.__rules__.forEach(function(s) {
      s.enabled && s.alt.forEach(function(r) {
        n.indexOf(r) < 0 && n.push(r);
      });
    }), t.__cache__ = {}, n.forEach(function(s) {
      t.__cache__[s] = [], t.__rules__.forEach(function(r) {
        r.enabled && (s && r.alt.indexOf(s) < 0 || t.__cache__[s].push(r.fn));
      });
    });
  }, e.prototype.at = function(t, n, s) {
    var r = this.__find__(t), o = s || {};
    if (r === -1)
      throw new Error("Parser rule not found: " + t);
    this.__rules__[r].fn = n, this.__rules__[r].alt = o.alt || [], this.__cache__ = null;
  }, e.prototype.before = function(t, n, s, r) {
    var o = this.__find__(t), c = r || {};
    if (o === -1)
      throw new Error("Parser rule not found: " + t);
    this.__rules__.splice(o, 0, {
      name: n,
      enabled: !0,
      fn: s,
      alt: c.alt || []
    }), this.__cache__ = null;
  }, e.prototype.after = function(t, n, s, r) {
    var o = this.__find__(t), c = r || {};
    if (o === -1)
      throw new Error("Parser rule not found: " + t);
    this.__rules__.splice(o + 1, 0, {
      name: n,
      enabled: !0,
      fn: s,
      alt: c.alt || []
    }), this.__cache__ = null;
  }, e.prototype.push = function(t, n, s) {
    var r = s || {};
    this.__rules__.push({
      name: t,
      enabled: !0,
      fn: n,
      alt: r.alt || []
    }), this.__cache__ = null;
  }, e.prototype.enable = function(t, n) {
    Array.isArray(t) || (t = [t]);
    var s = [];
    return t.forEach(function(r) {
      var o = this.__find__(r);
      if (o < 0) {
        if (n)
          return;
        throw new Error("Rules manager: invalid rule name " + r);
      }
      this.__rules__[o].enabled = !0, s.push(r);
    }, this), this.__cache__ = null, s;
  }, e.prototype.enableOnly = function(t, n) {
    Array.isArray(t) || (t = [t]), this.__rules__.forEach(function(s) {
      s.enabled = !1;
    }), this.enable(t, n);
  }, e.prototype.disable = function(t, n) {
    Array.isArray(t) || (t = [t]);
    var s = [];
    return t.forEach(function(r) {
      var o = this.__find__(r);
      if (o < 0) {
        if (n)
          return;
        throw new Error("Rules manager: invalid rule name " + r);
      }
      this.__rules__[o].enabled = !1, s.push(r);
    }, this), this.__cache__ = null, s;
  }, e.prototype.getRules = function(t) {
    return this.__cache__ === null && this.__compile__(), this.__cache__[t] || [];
  }, Nr = e, Nr;
}
var Lr, Pi;
function qj() {
  if (Pi) return Lr;
  Pi = 1;
  var e = /\r\n?|\n/g, t = /\0/g;
  return Lr = function(s) {
    var r;
    r = s.src.replace(e, `
`), r = r.replace(t, "�"), s.src = r;
  }, Lr;
}
var Or, Bi;
function Pj() {
  return Bi || (Bi = 1, Or = function(t) {
    var n;
    t.inlineMode ? (n = new t.Token("inline", "", 0), n.content = t.src, n.map = [0, 1], n.children = [], t.tokens.push(n)) : t.md.block.parse(t.src, t.md, t.env, t.tokens);
  }), Or;
}
var Fr, $i;
function Bj() {
  return $i || ($i = 1, Fr = function(t) {
    var n = t.tokens, s, r, o;
    for (r = 0, o = n.length; r < o; r++)
      s = n[r], s.type === "inline" && t.md.inline.parse(s.content, t.md, t.env, s.children);
  }), Fr;
}
var qr, zi;
function $j() {
  if (zi) return qr;
  zi = 1;
  var e = xe().arrayReplaceAt;
  function t(s) {
    return /^<a[>\s]/i.test(s);
  }
  function n(s) {
    return /^<\/a\s*>/i.test(s);
  }
  return qr = function(r) {
    var o, c, i, a, l, u, f, d, h, m, x, A, v, k, b, p, E = r.tokens, C;
    if (r.md.options.linkify) {
      for (c = 0, i = E.length; c < i; c++)
        if (!(E[c].type !== "inline" || !r.md.linkify.pretest(E[c].content)))
          for (a = E[c].children, v = 0, o = a.length - 1; o >= 0; o--) {
            if (u = a[o], u.type === "link_close") {
              for (o--; a[o].level !== u.level && a[o].type !== "link_open"; )
                o--;
              continue;
            }
            if (u.type === "html_inline" && (t(u.content) && v > 0 && v--, n(u.content) && v++), !(v > 0) && u.type === "text" && r.md.linkify.test(u.content)) {
              for (h = u.content, C = r.md.linkify.match(h), f = [], A = u.level, x = 0, C.length > 0 && C[0].index === 0 && o > 0 && a[o - 1].type === "text_special" && (C = C.slice(1)), d = 0; d < C.length; d++)
                k = C[d].url, b = r.md.normalizeLink(k), r.md.validateLink(b) && (p = C[d].text, C[d].schema ? C[d].schema === "mailto:" && !/^mailto:/i.test(p) ? p = r.md.normalizeLinkText("mailto:" + p).replace(/^mailto:/, "") : p = r.md.normalizeLinkText(p) : p = r.md.normalizeLinkText("http://" + p).replace(/^http:\/\//, ""), m = C[d].index, m > x && (l = new r.Token("text", "", 0), l.content = h.slice(x, m), l.level = A, f.push(l)), l = new r.Token("link_open", "a", 1), l.attrs = [["href", b]], l.level = A++, l.markup = "linkify", l.info = "auto", f.push(l), l = new r.Token("text", "", 0), l.content = p, l.level = A, f.push(l), l = new r.Token("link_close", "a", -1), l.level = --A, l.markup = "linkify", l.info = "auto", f.push(l), x = C[d].lastIndex);
              x < h.length && (l = new r.Token("text", "", 0), l.content = h.slice(x), l.level = A, f.push(l)), E[c].children = a = e(a, o, f);
            }
          }
    }
  }, qr;
}
var Pr, Ui;
function zj() {
  if (Ui) return Pr;
  Ui = 1;
  var e = /\+-|\.\.|\?\?\?\?|!!!!|,,|--/, t = /\((c|tm|r)\)/i, n = /\((c|tm|r)\)/ig, s = {
    c: "©",
    r: "®",
    tm: "™"
  };
  function r(i, a) {
    return s[a.toLowerCase()];
  }
  function o(i) {
    var a, l, u = 0;
    for (a = i.length - 1; a >= 0; a--)
      l = i[a], l.type === "text" && !u && (l.content = l.content.replace(n, r)), l.type === "link_open" && l.info === "auto" && u--, l.type === "link_close" && l.info === "auto" && u++;
  }
  function c(i) {
    var a, l, u = 0;
    for (a = i.length - 1; a >= 0; a--)
      l = i[a], l.type === "text" && !u && e.test(l.content) && (l.content = l.content.replace(/\+-/g, "±").replace(/\.{2,}/g, "…").replace(/([?!])…/g, "$1..").replace(/([?!]){4,}/g, "$1$1$1").replace(/,{2,}/g, ",").replace(/(^|[^-])---(?=[^-]|$)/mg, "$1—").replace(/(^|\s)--(?=\s|$)/mg, "$1–").replace(/(^|[^-\s])--(?=[^-\s]|$)/mg, "$1–")), l.type === "link_open" && l.info === "auto" && u--, l.type === "link_close" && l.info === "auto" && u++;
  }
  return Pr = function(a) {
    var l;
    if (a.md.options.typographer)
      for (l = a.tokens.length - 1; l >= 0; l--)
        a.tokens[l].type === "inline" && (t.test(a.tokens[l].content) && o(a.tokens[l].children), e.test(a.tokens[l].content) && c(a.tokens[l].children));
  }, Pr;
}
var Br, Hi;
function Uj() {
  if (Hi) return Br;
  Hi = 1;
  var e = xe().isWhiteSpace, t = xe().isPunctChar, n = xe().isMdAsciiPunct, s = /['"]/, r = /['"]/g, o = "’";
  function c(a, l, u) {
    return a.slice(0, l) + u + a.slice(l + 1);
  }
  function i(a, l) {
    var u, f, d, h, m, x, A, v, k, b, p, E, C, z, T, R, M, q, I, se, S;
    for (I = [], u = 0; u < a.length; u++) {
      for (f = a[u], A = a[u].level, M = I.length - 1; M >= 0 && !(I[M].level <= A); M--)
        ;
      if (I.length = M + 1, f.type === "text") {
        d = f.content, m = 0, x = d.length;
        e:
          for (; m < x && (r.lastIndex = m, h = r.exec(d), !!h); ) {
            if (T = R = !0, m = h.index + 1, q = h[0] === "'", k = 32, h.index - 1 >= 0)
              k = d.charCodeAt(h.index - 1);
            else
              for (M = u - 1; M >= 0 && !(a[M].type === "softbreak" || a[M].type === "hardbreak"); M--)
                if (a[M].content) {
                  k = a[M].content.charCodeAt(a[M].content.length - 1);
                  break;
                }
            if (b = 32, m < x)
              b = d.charCodeAt(m);
            else
              for (M = u + 1; M < a.length && !(a[M].type === "softbreak" || a[M].type === "hardbreak"); M++)
                if (a[M].content) {
                  b = a[M].content.charCodeAt(0);
                  break;
                }
            if (p = n(k) || t(String.fromCharCode(k)), E = n(b) || t(String.fromCharCode(b)), C = e(k), z = e(b), z ? T = !1 : E && (C || p || (T = !1)), C ? R = !1 : p && (z || E || (R = !1)), b === 34 && h[0] === '"' && k >= 48 && k <= 57 && (R = T = !1), T && R && (T = p, R = E), !T && !R) {
              q && (f.content = c(f.content, h.index, o));
              continue;
            }
            if (R) {
              for (M = I.length - 1; M >= 0 && (v = I[M], !(I[M].level < A)); M--)
                if (v.single === q && I[M].level === A) {
                  v = I[M], q ? (se = l.md.options.quotes[2], S = l.md.options.quotes[3]) : (se = l.md.options.quotes[0], S = l.md.options.quotes[1]), f.content = c(f.content, h.index, S), a[v.token].content = c(
                    a[v.token].content,
                    v.pos,
                    se
                  ), m += S.length - 1, v.token === u && (m += se.length - 1), d = f.content, x = d.length, I.length = M;
                  continue e;
                }
            }
            T ? I.push({
              token: u,
              pos: h.index,
              single: q,
              level: A
            }) : R && q && (f.content = c(f.content, h.index, o));
          }
      }
    }
  }
  return Br = function(l) {
    var u;
    if (l.md.options.typographer)
      for (u = l.tokens.length - 1; u >= 0; u--)
        l.tokens[u].type !== "inline" || !s.test(l.tokens[u].content) || i(l.tokens[u].children, l);
  }, Br;
}
var $r, Vi;
function Hj() {
  return Vi || (Vi = 1, $r = function(t) {
    var n, s, r, o, c, i, a = t.tokens;
    for (n = 0, s = a.length; n < s; n++)
      if (a[n].type === "inline") {
        for (r = a[n].children, c = r.length, o = 0; o < c; o++)
          r[o].type === "text_special" && (r[o].type = "text");
        for (o = i = 0; o < c; o++)
          r[o].type === "text" && o + 1 < c && r[o + 1].type === "text" ? r[o + 1].content = r[o].content + r[o + 1].content : (o !== i && (r[i] = r[o]), i++);
        o !== i && (r.length = i);
      }
  }), $r;
}
var zr, ji;
function fc() {
  if (ji) return zr;
  ji = 1;
  function e(t, n, s) {
    this.type = t, this.tag = n, this.attrs = null, this.map = null, this.nesting = s, this.level = 0, this.children = null, this.content = "", this.markup = "", this.info = "", this.meta = null, this.block = !1, this.hidden = !1;
  }
  return e.prototype.attrIndex = function(n) {
    var s, r, o;
    if (!this.attrs)
      return -1;
    for (s = this.attrs, r = 0, o = s.length; r < o; r++)
      if (s[r][0] === n)
        return r;
    return -1;
  }, e.prototype.attrPush = function(n) {
    this.attrs ? this.attrs.push(n) : this.attrs = [n];
  }, e.prototype.attrSet = function(n, s) {
    var r = this.attrIndex(n), o = [n, s];
    r < 0 ? this.attrPush(o) : this.attrs[r] = o;
  }, e.prototype.attrGet = function(n) {
    var s = this.attrIndex(n), r = null;
    return s >= 0 && (r = this.attrs[s][1]), r;
  }, e.prototype.attrJoin = function(n, s) {
    var r = this.attrIndex(n);
    r < 0 ? this.attrPush([n, s]) : this.attrs[r][1] = this.attrs[r][1] + " " + s;
  }, zr = e, zr;
}
var Ur, Gi;
function Vj() {
  if (Gi) return Ur;
  Gi = 1;
  var e = fc();
  function t(n, s, r) {
    this.src = n, this.env = r, this.tokens = [], this.inlineMode = !1, this.md = s;
  }
  return t.prototype.Token = e, Ur = t, Ur;
}
var Hr, Ki;
function jj() {
  if (Ki) return Hr;
  Ki = 1;
  var e = uc(), t = [
    ["normalize", qj()],
    ["block", Pj()],
    ["inline", Bj()],
    ["linkify", $j()],
    ["replacements", zj()],
    ["smartquotes", Uj()],
    // `text_join` finds `text_special` tokens (for escape sequences)
    // and joins them with the rest of the text
    ["text_join", Hj()]
  ];
  function n() {
    this.ruler = new e();
    for (var s = 0; s < t.length; s++)
      this.ruler.push(t[s][0], t[s][1]);
  }
  return n.prototype.process = function(s) {
    var r, o, c;
    for (c = this.ruler.getRules(""), r = 0, o = c.length; r < o; r++)
      c[r](s);
  }, n.prototype.State = Vj(), Hr = n, Hr;
}
var Vr, Zi;
function Gj() {
  if (Zi) return Vr;
  Zi = 1;
  var e = xe().isSpace;
  function t(s, r) {
    var o = s.bMarks[r] + s.tShift[r], c = s.eMarks[r];
    return s.src.slice(o, c);
  }
  function n(s) {
    var r = [], o = 0, c = s.length, i, a = !1, l = 0, u = "";
    for (i = s.charCodeAt(o); o < c; )
      i === 124 && (a ? (u += s.substring(l, o - 1), l = o) : (r.push(u + s.substring(l, o)), u = "", l = o + 1)), a = i === 92, o++, i = s.charCodeAt(o);
    return r.push(u + s.substring(l)), r;
  }
  return Vr = function(r, o, c, i) {
    var a, l, u, f, d, h, m, x, A, v, k, b, p, E, C, z, T, R;
    if (o + 2 > c || (h = o + 1, r.sCount[h] < r.blkIndent) || r.sCount[h] - r.blkIndent >= 4 || (u = r.bMarks[h] + r.tShift[h], u >= r.eMarks[h]) || (T = r.src.charCodeAt(u++), T !== 124 && T !== 45 && T !== 58) || u >= r.eMarks[h] || (R = r.src.charCodeAt(u++), R !== 124 && R !== 45 && R !== 58 && !e(R)) || T === 45 && e(R))
      return !1;
    for (; u < r.eMarks[h]; ) {
      if (a = r.src.charCodeAt(u), a !== 124 && a !== 45 && a !== 58 && !e(a))
        return !1;
      u++;
    }
    for (l = t(r, o + 1), m = l.split("|"), v = [], f = 0; f < m.length; f++) {
      if (k = m[f].trim(), !k) {
        if (f === 0 || f === m.length - 1)
          continue;
        return !1;
      }
      if (!/^:?-+:?$/.test(k))
        return !1;
      k.charCodeAt(k.length - 1) === 58 ? v.push(k.charCodeAt(0) === 58 ? "center" : "right") : k.charCodeAt(0) === 58 ? v.push("left") : v.push("");
    }
    if (l = t(r, o).trim(), l.indexOf("|") === -1 || r.sCount[o] - r.blkIndent >= 4 || (m = n(l), m.length && m[0] === "" && m.shift(), m.length && m[m.length - 1] === "" && m.pop(), x = m.length, x === 0 || x !== v.length))
      return !1;
    if (i)
      return !0;
    for (E = r.parentType, r.parentType = "table", z = r.md.block.ruler.getRules("blockquote"), A = r.push("table_open", "table", 1), A.map = b = [o, 0], A = r.push("thead_open", "thead", 1), A.map = [o, o + 1], A = r.push("tr_open", "tr", 1), A.map = [o, o + 1], f = 0; f < m.length; f++)
      A = r.push("th_open", "th", 1), v[f] && (A.attrs = [["style", "text-align:" + v[f]]]), A = r.push("inline", "", 0), A.content = m[f].trim(), A.children = [], A = r.push("th_close", "th", -1);
    for (A = r.push("tr_close", "tr", -1), A = r.push("thead_close", "thead", -1), h = o + 2; h < c && !(r.sCount[h] < r.blkIndent); h++) {
      for (C = !1, f = 0, d = z.length; f < d; f++)
        if (z[f](r, h, c, !0)) {
          C = !0;
          break;
        }
      if (C || (l = t(r, h).trim(), !l) || r.sCount[h] - r.blkIndent >= 4)
        break;
      for (m = n(l), m.length && m[0] === "" && m.shift(), m.length && m[m.length - 1] === "" && m.pop(), h === o + 2 && (A = r.push("tbody_open", "tbody", 1), A.map = p = [o + 2, 0]), A = r.push("tr_open", "tr", 1), A.map = [h, h + 1], f = 0; f < x; f++)
        A = r.push("td_open", "td", 1), v[f] && (A.attrs = [["style", "text-align:" + v[f]]]), A = r.push("inline", "", 0), A.content = m[f] ? m[f].trim() : "", A.children = [], A = r.push("td_close", "td", -1);
      A = r.push("tr_close", "tr", -1);
    }
    return p && (A = r.push("tbody_close", "tbody", -1), p[1] = h), A = r.push("table_close", "table", -1), b[1] = h, r.parentType = E, r.line = h, !0;
  }, Vr;
}
var jr, Wi;
function Kj() {
  return Wi || (Wi = 1, jr = function(t, n, s) {
    var r, o, c;
    if (t.sCount[n] - t.blkIndent < 4)
      return !1;
    for (o = r = n + 1; r < s; ) {
      if (t.isEmpty(r)) {
        r++;
        continue;
      }
      if (t.sCount[r] - t.blkIndent >= 4) {
        r++, o = r;
        continue;
      }
      break;
    }
    return t.line = o, c = t.push("code_block", "code", 0), c.content = t.getLines(n, o, 4 + t.blkIndent, !1) + `
`, c.map = [n, t.line], !0;
  }), jr;
}
var Gr, Ji;
function Zj() {
  return Ji || (Ji = 1, Gr = function(t, n, s, r) {
    var o, c, i, a, l, u, f, d = !1, h = t.bMarks[n] + t.tShift[n], m = t.eMarks[n];
    if (t.sCount[n] - t.blkIndent >= 4 || h + 3 > m || (o = t.src.charCodeAt(h), o !== 126 && o !== 96) || (l = h, h = t.skipChars(h, o), c = h - l, c < 3) || (f = t.src.slice(l, h), i = t.src.slice(h, m), o === 96 && i.indexOf(String.fromCharCode(o)) >= 0))
      return !1;
    if (r)
      return !0;
    for (a = n; a++, !(a >= s || (h = l = t.bMarks[a] + t.tShift[a], m = t.eMarks[a], h < m && t.sCount[a] < t.blkIndent)); )
      if (t.src.charCodeAt(h) === o && !(t.sCount[a] - t.blkIndent >= 4) && (h = t.skipChars(h, o), !(h - l < c) && (h = t.skipSpaces(h), !(h < m)))) {
        d = !0;
        break;
      }
    return c = t.sCount[n], t.line = a + (d ? 1 : 0), u = t.push("fence", "code", 0), u.info = i, u.content = t.getLines(n + 1, a, c, !0), u.markup = f, u.map = [n, t.line], !0;
  }), Gr;
}
var Kr, Yi;
function Wj() {
  if (Yi) return Kr;
  Yi = 1;
  var e = xe().isSpace;
  return Kr = function(n, s, r, o) {
    var c, i, a, l, u, f, d, h, m, x, A, v, k, b, p, E, C, z, T, R, M = n.lineMax, q = n.bMarks[s] + n.tShift[s], I = n.eMarks[s];
    if (n.sCount[s] - n.blkIndent >= 4 || n.src.charCodeAt(q) !== 62)
      return !1;
    if (o)
      return !0;
    for (x = [], A = [], b = [], p = [], z = n.md.block.ruler.getRules("blockquote"), k = n.parentType, n.parentType = "blockquote", h = s; h < r && (R = n.sCount[h] < n.blkIndent, q = n.bMarks[h] + n.tShift[h], I = n.eMarks[h], !(q >= I)); h++) {
      if (n.src.charCodeAt(q++) === 62 && !R) {
        for (l = n.sCount[h] + 1, n.src.charCodeAt(q) === 32 ? (q++, l++, c = !1, E = !0) : n.src.charCodeAt(q) === 9 ? (E = !0, (n.bsCount[h] + l) % 4 === 3 ? (q++, l++, c = !1) : c = !0) : E = !1, m = l, x.push(n.bMarks[h]), n.bMarks[h] = q; q < I && (i = n.src.charCodeAt(q), e(i)); ) {
          i === 9 ? m += 4 - (m + n.bsCount[h] + (c ? 1 : 0)) % 4 : m++;
          q++;
        }
        f = q >= I, A.push(n.bsCount[h]), n.bsCount[h] = n.sCount[h] + 1 + (E ? 1 : 0), b.push(n.sCount[h]), n.sCount[h] = m - l, p.push(n.tShift[h]), n.tShift[h] = q - n.bMarks[h];
        continue;
      }
      if (f)
        break;
      for (C = !1, a = 0, u = z.length; a < u; a++)
        if (z[a](n, h, r, !0)) {
          C = !0;
          break;
        }
      if (C) {
        n.lineMax = h, n.blkIndent !== 0 && (x.push(n.bMarks[h]), A.push(n.bsCount[h]), p.push(n.tShift[h]), b.push(n.sCount[h]), n.sCount[h] -= n.blkIndent);
        break;
      }
      x.push(n.bMarks[h]), A.push(n.bsCount[h]), p.push(n.tShift[h]), b.push(n.sCount[h]), n.sCount[h] = -1;
    }
    for (v = n.blkIndent, n.blkIndent = 0, T = n.push("blockquote_open", "blockquote", 1), T.markup = ">", T.map = d = [s, 0], n.md.block.tokenize(n, s, h), T = n.push("blockquote_close", "blockquote", -1), T.markup = ">", n.lineMax = M, n.parentType = k, d[1] = n.line, a = 0; a < p.length; a++)
      n.bMarks[a + s] = x[a], n.tShift[a + s] = p[a], n.sCount[a + s] = b[a], n.bsCount[a + s] = A[a];
    return n.blkIndent = v, !0;
  }, Kr;
}
var Zr, Xi;
function Jj() {
  if (Xi) return Zr;
  Xi = 1;
  var e = xe().isSpace;
  return Zr = function(n, s, r, o) {
    var c, i, a, l, u = n.bMarks[s] + n.tShift[s], f = n.eMarks[s];
    if (n.sCount[s] - n.blkIndent >= 4 || (c = n.src.charCodeAt(u++), c !== 42 && c !== 45 && c !== 95))
      return !1;
    for (i = 1; u < f; ) {
      if (a = n.src.charCodeAt(u++), a !== c && !e(a))
        return !1;
      a === c && i++;
    }
    return i < 3 ? !1 : (o || (n.line = s + 1, l = n.push("hr", "hr", 0), l.map = [s, n.line], l.markup = Array(i + 1).join(String.fromCharCode(c))), !0);
  }, Zr;
}
var Wr, Qi;
function Yj() {
  if (Qi) return Wr;
  Qi = 1;
  var e = xe().isSpace;
  function t(r, o) {
    var c, i, a, l;
    return i = r.bMarks[o] + r.tShift[o], a = r.eMarks[o], c = r.src.charCodeAt(i++), c !== 42 && c !== 45 && c !== 43 || i < a && (l = r.src.charCodeAt(i), !e(l)) ? -1 : i;
  }
  function n(r, o) {
    var c, i = r.bMarks[o] + r.tShift[o], a = i, l = r.eMarks[o];
    if (a + 1 >= l || (c = r.src.charCodeAt(a++), c < 48 || c > 57))
      return -1;
    for (; ; ) {
      if (a >= l)
        return -1;
      if (c = r.src.charCodeAt(a++), c >= 48 && c <= 57) {
        if (a - i >= 10)
          return -1;
        continue;
      }
      if (c === 41 || c === 46)
        break;
      return -1;
    }
    return a < l && (c = r.src.charCodeAt(a), !e(c)) ? -1 : a;
  }
  function s(r, o) {
    var c, i, a = r.level + 2;
    for (c = o + 2, i = r.tokens.length - 2; c < i; c++)
      r.tokens[c].level === a && r.tokens[c].type === "paragraph_open" && (r.tokens[c + 2].hidden = !0, r.tokens[c].hidden = !0, c += 2);
  }
  return Wr = function(o, c, i, a) {
    var l, u, f, d, h, m, x, A, v, k, b, p, E, C, z, T, R, M, q, I, se, S, B, K, ee, Z, fe, J = c, Ce = !1, Ae = !0;
    if (o.sCount[J] - o.blkIndent >= 4 || o.listIndent >= 0 && o.sCount[J] - o.listIndent >= 4 && o.sCount[J] < o.blkIndent)
      return !1;
    if (a && o.parentType === "paragraph" && o.sCount[J] >= o.blkIndent && (Ce = !0), (S = n(o, J)) >= 0) {
      if (x = !0, K = o.bMarks[J] + o.tShift[J], E = Number(o.src.slice(K, S - 1)), Ce && E !== 1) return !1;
    } else if ((S = t(o, J)) >= 0)
      x = !1;
    else
      return !1;
    if (Ce && o.skipSpaces(S) >= o.eMarks[J])
      return !1;
    if (a)
      return !0;
    for (p = o.src.charCodeAt(S - 1), b = o.tokens.length, x ? (fe = o.push("ordered_list_open", "ol", 1), E !== 1 && (fe.attrs = [["start", E]])) : fe = o.push("bullet_list_open", "ul", 1), fe.map = k = [J, 0], fe.markup = String.fromCharCode(p), B = !1, Z = o.md.block.ruler.getRules("list"), R = o.parentType, o.parentType = "list"; J < i; ) {
      for (se = S, C = o.eMarks[J], m = z = o.sCount[J] + S - (o.bMarks[J] + o.tShift[J]); se < C; ) {
        if (l = o.src.charCodeAt(se), l === 9)
          z += 4 - (z + o.bsCount[J]) % 4;
        else if (l === 32)
          z++;
        else
          break;
        se++;
      }
      if (u = se, u >= C ? h = 1 : h = z - m, h > 4 && (h = 1), d = m + h, fe = o.push("list_item_open", "li", 1), fe.markup = String.fromCharCode(p), fe.map = A = [J, 0], x && (fe.info = o.src.slice(K, S - 1)), I = o.tight, q = o.tShift[J], M = o.sCount[J], T = o.listIndent, o.listIndent = o.blkIndent, o.blkIndent = d, o.tight = !0, o.tShift[J] = u - o.bMarks[J], o.sCount[J] = z, u >= C && o.isEmpty(J + 1) ? o.line = Math.min(o.line + 2, i) : o.md.block.tokenize(o, J, i, !0), (!o.tight || B) && (Ae = !1), B = o.line - J > 1 && o.isEmpty(o.line - 1), o.blkIndent = o.listIndent, o.listIndent = T, o.tShift[J] = q, o.sCount[J] = M, o.tight = I, fe = o.push("list_item_close", "li", -1), fe.markup = String.fromCharCode(p), J = o.line, A[1] = J, J >= i || o.sCount[J] < o.blkIndent || o.sCount[J] - o.blkIndent >= 4)
        break;
      for (ee = !1, f = 0, v = Z.length; f < v; f++)
        if (Z[f](o, J, i, !0)) {
          ee = !0;
          break;
        }
      if (ee)
        break;
      if (x) {
        if (S = n(o, J), S < 0)
          break;
        K = o.bMarks[J] + o.tShift[J];
      } else if (S = t(o, J), S < 0)
        break;
      if (p !== o.src.charCodeAt(S - 1))
        break;
    }
    return x ? fe = o.push("ordered_list_close", "ol", -1) : fe = o.push("bullet_list_close", "ul", -1), fe.markup = String.fromCharCode(p), k[1] = J, o.line = J, o.parentType = R, Ae && s(o, b), !0;
  }, Wr;
}
var Jr, ea;
function Xj() {
  if (ea) return Jr;
  ea = 1;
  var e = xe().normalizeReference, t = xe().isSpace;
  return Jr = function(s, r, o, c) {
    var i, a, l, u, f, d, h, m, x, A, v, k, b, p, E, C, z = 0, T = s.bMarks[r] + s.tShift[r], R = s.eMarks[r], M = r + 1;
    if (s.sCount[r] - s.blkIndent >= 4 || s.src.charCodeAt(T) !== 91)
      return !1;
    for (; ++T < R; )
      if (s.src.charCodeAt(T) === 93 && s.src.charCodeAt(T - 1) !== 92) {
        if (T + 1 === R || s.src.charCodeAt(T + 1) !== 58)
          return !1;
        break;
      }
    for (u = s.lineMax, E = s.md.block.ruler.getRules("reference"), A = s.parentType, s.parentType = "reference"; M < u && !s.isEmpty(M); M++)
      if (!(s.sCount[M] - s.blkIndent > 3) && !(s.sCount[M] < 0)) {
        for (p = !1, d = 0, h = E.length; d < h; d++)
          if (E[d](s, M, u, !0)) {
            p = !0;
            break;
          }
        if (p)
          break;
      }
    for (b = s.getLines(r, M, s.blkIndent, !1).trim(), R = b.length, T = 1; T < R; T++) {
      if (i = b.charCodeAt(T), i === 91)
        return !1;
      if (i === 93) {
        x = T;
        break;
      } else i === 10 ? z++ : i === 92 && (T++, T < R && b.charCodeAt(T) === 10 && z++);
    }
    if (x < 0 || b.charCodeAt(x + 1) !== 58)
      return !1;
    for (T = x + 2; T < R; T++)
      if (i = b.charCodeAt(T), i === 10)
        z++;
      else if (!t(i)) break;
    if (v = s.md.helpers.parseLinkDestination(b, T, R), !v.ok || (f = s.md.normalizeLink(v.str), !s.md.validateLink(f)))
      return !1;
    for (T = v.pos, z += v.lines, a = T, l = z, k = T; T < R; T++)
      if (i = b.charCodeAt(T), i === 10)
        z++;
      else if (!t(i)) break;
    for (v = s.md.helpers.parseLinkTitle(b, T, R), T < R && k !== T && v.ok ? (C = v.str, T = v.pos, z += v.lines) : (C = "", T = a, z = l); T < R && (i = b.charCodeAt(T), !!t(i)); )
      T++;
    if (T < R && b.charCodeAt(T) !== 10 && C)
      for (C = "", T = a, z = l; T < R && (i = b.charCodeAt(T), !!t(i)); )
        T++;
    return T < R && b.charCodeAt(T) !== 10 || (m = e(b.slice(1, x)), !m) ? !1 : (c || (typeof s.env.references > "u" && (s.env.references = {}), typeof s.env.references[m] > "u" && (s.env.references[m] = { title: C, href: f }), s.parentType = A, s.line = r + z + 1), !0);
  }, Jr;
}
var Yr, ta;
function Qj() {
  return ta || (ta = 1, Yr = [
    "address",
    "article",
    "aside",
    "base",
    "basefont",
    "blockquote",
    "body",
    "caption",
    "center",
    "col",
    "colgroup",
    "dd",
    "details",
    "dialog",
    "dir",
    "div",
    "dl",
    "dt",
    "fieldset",
    "figcaption",
    "figure",
    "footer",
    "form",
    "frame",
    "frameset",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "head",
    "header",
    "hr",
    "html",
    "iframe",
    "legend",
    "li",
    "link",
    "main",
    "menu",
    "menuitem",
    "nav",
    "noframes",
    "ol",
    "optgroup",
    "option",
    "p",
    "param",
    "section",
    "source",
    "summary",
    "table",
    "tbody",
    "td",
    "tfoot",
    "th",
    "thead",
    "title",
    "tr",
    "track",
    "ul"
  ]), Yr;
}
var ps = {}, na;
function vu() {
  if (na) return ps;
  na = 1;
  var e = "[a-zA-Z_:][a-zA-Z0-9:._-]*", t = "[^\"'=<>`\\x00-\\x20]+", n = "'[^']*'", s = '"[^"]*"', r = "(?:" + t + "|" + n + "|" + s + ")", o = "(?:\\s+" + e + "(?:\\s*=\\s*" + r + ")?)", c = "<[A-Za-z][A-Za-z0-9\\-]*" + o + "*\\s*\\/?>", i = "<\\/[A-Za-z][A-Za-z0-9\\-]*\\s*>", a = "<!---->|<!--(?:-?[^>-])(?:-?[^-])*-->", l = "<[?][\\s\\S]*?[?]>", u = "<![A-Z]+\\s+[^>]*>", f = "<!\\[CDATA\\[[\\s\\S]*?\\]\\]>", d = new RegExp("^(?:" + c + "|" + i + "|" + a + "|" + l + "|" + u + "|" + f + ")"), h = new RegExp("^(?:" + c + "|" + i + ")");
  return ps.HTML_TAG_RE = d, ps.HTML_OPEN_CLOSE_TAG_RE = h, ps;
}
var Xr, sa;
function eG() {
  if (sa) return Xr;
  sa = 1;
  var e = Qj(), t = vu().HTML_OPEN_CLOSE_TAG_RE, n = [
    [/^<(script|pre|style|textarea)(?=(\s|>|$))/i, /<\/(script|pre|style|textarea)>/i, !0],
    [/^<!--/, /-->/, !0],
    [/^<\?/, /\?>/, !0],
    [/^<![A-Z]/, />/, !0],
    [/^<!\[CDATA\[/, /\]\]>/, !0],
    [new RegExp("^</?(" + e.join("|") + ")(?=(\\s|/?>|$))", "i"), /^$/, !0],
    [new RegExp(t.source + "\\s*$"), /^$/, !1]
  ];
  return Xr = function(r, o, c, i) {
    var a, l, u, f, d = r.bMarks[o] + r.tShift[o], h = r.eMarks[o];
    if (r.sCount[o] - r.blkIndent >= 4 || !r.md.options.html || r.src.charCodeAt(d) !== 60)
      return !1;
    for (f = r.src.slice(d, h), a = 0; a < n.length && !n[a][0].test(f); a++)
      ;
    if (a === n.length)
      return !1;
    if (i)
      return n[a][2];
    if (l = o + 1, !n[a][1].test(f)) {
      for (; l < c && !(r.sCount[l] < r.blkIndent); l++)
        if (d = r.bMarks[l] + r.tShift[l], h = r.eMarks[l], f = r.src.slice(d, h), n[a][1].test(f)) {
          f.length !== 0 && l++;
          break;
        }
    }
    return r.line = l, u = r.push("html_block", "", 0), u.map = [o, l], u.content = r.getLines(o, l, r.blkIndent, !0), !0;
  }, Xr;
}
var Qr, ra;
function tG() {
  if (ra) return Qr;
  ra = 1;
  var e = xe().isSpace;
  return Qr = function(n, s, r, o) {
    var c, i, a, l, u = n.bMarks[s] + n.tShift[s], f = n.eMarks[s];
    if (n.sCount[s] - n.blkIndent >= 4 || (c = n.src.charCodeAt(u), c !== 35 || u >= f))
      return !1;
    for (i = 1, c = n.src.charCodeAt(++u); c === 35 && u < f && i <= 6; )
      i++, c = n.src.charCodeAt(++u);
    return i > 6 || u < f && !e(c) ? !1 : (o || (f = n.skipSpacesBack(f, u), a = n.skipCharsBack(f, 35, u), a > u && e(n.src.charCodeAt(a - 1)) && (f = a), n.line = s + 1, l = n.push("heading_open", "h" + String(i), 1), l.markup = "########".slice(0, i), l.map = [s, n.line], l = n.push("inline", "", 0), l.content = n.src.slice(u, f).trim(), l.map = [s, n.line], l.children = [], l = n.push("heading_close", "h" + String(i), -1), l.markup = "########".slice(0, i)), !0);
  }, Qr;
}
var eo, oa;
function nG() {
  return oa || (oa = 1, eo = function(t, n, s) {
    var r, o, c, i, a, l, u, f, d, h = n + 1, m, x = t.md.block.ruler.getRules("paragraph");
    if (t.sCount[n] - t.blkIndent >= 4)
      return !1;
    for (m = t.parentType, t.parentType = "paragraph"; h < s && !t.isEmpty(h); h++)
      if (!(t.sCount[h] - t.blkIndent > 3)) {
        if (t.sCount[h] >= t.blkIndent && (l = t.bMarks[h] + t.tShift[h], u = t.eMarks[h], l < u && (d = t.src.charCodeAt(l), (d === 45 || d === 61) && (l = t.skipChars(l, d), l = t.skipSpaces(l), l >= u)))) {
          f = d === 61 ? 1 : 2;
          break;
        }
        if (!(t.sCount[h] < 0)) {
          for (o = !1, c = 0, i = x.length; c < i; c++)
            if (x[c](t, h, s, !0)) {
              o = !0;
              break;
            }
          if (o)
            break;
        }
      }
    return f ? (r = t.getLines(n, h, t.blkIndent, !1).trim(), t.line = h + 1, a = t.push("heading_open", "h" + String(f), 1), a.markup = String.fromCharCode(d), a.map = [n, t.line], a = t.push("inline", "", 0), a.content = r, a.map = [n, t.line - 1], a.children = [], a = t.push("heading_close", "h" + String(f), -1), a.markup = String.fromCharCode(d), t.parentType = m, !0) : !1;
  }), eo;
}
var to, ca;
function sG() {
  return ca || (ca = 1, to = function(t, n, s) {
    var r, o, c, i, a, l, u = n + 1, f = t.md.block.ruler.getRules("paragraph");
    for (l = t.parentType, t.parentType = "paragraph"; u < s && !t.isEmpty(u); u++)
      if (!(t.sCount[u] - t.blkIndent > 3) && !(t.sCount[u] < 0)) {
        for (o = !1, c = 0, i = f.length; c < i; c++)
          if (f[c](t, u, s, !0)) {
            o = !0;
            break;
          }
        if (o)
          break;
      }
    return r = t.getLines(n, u, t.blkIndent, !1).trim(), t.line = u, a = t.push("paragraph_open", "p", 1), a.map = [n, t.line], a = t.push("inline", "", 0), a.content = r, a.map = [n, t.line], a.children = [], a = t.push("paragraph_close", "p", -1), t.parentType = l, !0;
  }), to;
}
var no, ia;
function rG() {
  if (ia) return no;
  ia = 1;
  var e = fc(), t = xe().isSpace;
  function n(s, r, o, c) {
    var i, a, l, u, f, d, h, m;
    for (this.src = s, this.md = r, this.env = o, this.tokens = c, this.bMarks = [], this.eMarks = [], this.tShift = [], this.sCount = [], this.bsCount = [], this.blkIndent = 0, this.line = 0, this.lineMax = 0, this.tight = !1, this.ddIndent = -1, this.listIndent = -1, this.parentType = "root", this.level = 0, this.result = "", a = this.src, m = !1, l = u = d = h = 0, f = a.length; u < f; u++) {
      if (i = a.charCodeAt(u), !m)
        if (t(i)) {
          d++, i === 9 ? h += 4 - h % 4 : h++;
          continue;
        } else
          m = !0;
      (i === 10 || u === f - 1) && (i !== 10 && u++, this.bMarks.push(l), this.eMarks.push(u), this.tShift.push(d), this.sCount.push(h), this.bsCount.push(0), m = !1, d = 0, h = 0, l = u + 1);
    }
    this.bMarks.push(a.length), this.eMarks.push(a.length), this.tShift.push(0), this.sCount.push(0), this.bsCount.push(0), this.lineMax = this.bMarks.length - 1;
  }
  return n.prototype.push = function(s, r, o) {
    var c = new e(s, r, o);
    return c.block = !0, o < 0 && this.level--, c.level = this.level, o > 0 && this.level++, this.tokens.push(c), c;
  }, n.prototype.isEmpty = function(r) {
    return this.bMarks[r] + this.tShift[r] >= this.eMarks[r];
  }, n.prototype.skipEmptyLines = function(r) {
    for (var o = this.lineMax; r < o && !(this.bMarks[r] + this.tShift[r] < this.eMarks[r]); r++)
      ;
    return r;
  }, n.prototype.skipSpaces = function(r) {
    for (var o, c = this.src.length; r < c && (o = this.src.charCodeAt(r), !!t(o)); r++)
      ;
    return r;
  }, n.prototype.skipSpacesBack = function(r, o) {
    if (r <= o)
      return r;
    for (; r > o; )
      if (!t(this.src.charCodeAt(--r)))
        return r + 1;
    return r;
  }, n.prototype.skipChars = function(r, o) {
    for (var c = this.src.length; r < c && this.src.charCodeAt(r) === o; r++)
      ;
    return r;
  }, n.prototype.skipCharsBack = function(r, o, c) {
    if (r <= c)
      return r;
    for (; r > c; )
      if (o !== this.src.charCodeAt(--r))
        return r + 1;
    return r;
  }, n.prototype.getLines = function(r, o, c, i) {
    var a, l, u, f, d, h, m, x = r;
    if (r >= o)
      return "";
    for (h = new Array(o - r), a = 0; x < o; x++, a++) {
      for (l = 0, m = f = this.bMarks[x], x + 1 < o || i ? d = this.eMarks[x] + 1 : d = this.eMarks[x]; f < d && l < c; ) {
        if (u = this.src.charCodeAt(f), t(u))
          u === 9 ? l += 4 - (l + this.bsCount[x]) % 4 : l++;
        else if (f - m < this.tShift[x])
          l++;
        else
          break;
        f++;
      }
      l > c ? h[a] = new Array(l - c + 1).join(" ") + this.src.slice(f, d) : h[a] = this.src.slice(f, d);
    }
    return h.join("");
  }, n.prototype.Token = e, no = n, no;
}
var so, aa;
function oG() {
  if (aa) return so;
  aa = 1;
  var e = uc(), t = [
    // First 2 params - rule name & source. Secondary array - list of rules,
    // which can be terminated by this one.
    ["table", Gj(), ["paragraph", "reference"]],
    ["code", Kj()],
    ["fence", Zj(), ["paragraph", "reference", "blockquote", "list"]],
    ["blockquote", Wj(), ["paragraph", "reference", "blockquote", "list"]],
    ["hr", Jj(), ["paragraph", "reference", "blockquote", "list"]],
    ["list", Yj(), ["paragraph", "reference", "blockquote"]],
    ["reference", Xj()],
    ["html_block", eG(), ["paragraph", "reference", "blockquote"]],
    ["heading", tG(), ["paragraph", "reference", "blockquote"]],
    ["lheading", nG()],
    ["paragraph", sG()]
  ];
  function n() {
    this.ruler = new e();
    for (var s = 0; s < t.length; s++)
      this.ruler.push(t[s][0], t[s][1], { alt: (t[s][2] || []).slice() });
  }
  return n.prototype.tokenize = function(s, r, o) {
    for (var c, i, a, l = this.ruler.getRules(""), u = l.length, f = r, d = !1, h = s.md.options.maxNesting; f < o && (s.line = f = s.skipEmptyLines(f), !(f >= o || s.sCount[f] < s.blkIndent)); ) {
      if (s.level >= h) {
        s.line = o;
        break;
      }
      for (a = s.line, i = 0; i < u; i++)
        if (c = l[i](s, f, o, !1), c) {
          if (a >= s.line)
            throw new Error("block rule didn't increment state.line");
          break;
        }
      if (!c) throw new Error("none of the block rules matched");
      s.tight = !d, s.isEmpty(s.line - 1) && (d = !0), f = s.line, f < o && s.isEmpty(f) && (d = !0, f++, s.line = f);
    }
  }, n.prototype.parse = function(s, r, o, c) {
    var i;
    s && (i = new this.State(s, r, o, c), this.tokenize(i, i.line, i.lineMax));
  }, n.prototype.State = rG(), so = n, so;
}
var ro, la;
function cG() {
  if (la) return ro;
  la = 1;
  function e(t) {
    switch (t) {
      case 10:
      case 33:
      case 35:
      case 36:
      case 37:
      case 38:
      case 42:
      case 43:
      case 45:
      case 58:
      case 60:
      case 61:
      case 62:
      case 64:
      case 91:
      case 92:
      case 93:
      case 94:
      case 95:
      case 96:
      case 123:
      case 125:
      case 126:
        return !0;
      default:
        return !1;
    }
  }
  return ro = function(n, s) {
    for (var r = n.pos; r < n.posMax && !e(n.src.charCodeAt(r)); )
      r++;
    return r === n.pos ? !1 : (s || (n.pending += n.src.slice(n.pos, r)), n.pos = r, !0);
  }, ro;
}
var oo, ua;
function iG() {
  if (ua) return oo;
  ua = 1;
  var e = /(?:^|[^a-z0-9.+-])([a-z][a-z0-9.+-]*)$/i;
  return oo = function(n, s) {
    var r, o, c, i, a, l, u, f;
    return !n.md.options.linkify || n.linkLevel > 0 || (r = n.pos, o = n.posMax, r + 3 > o) || n.src.charCodeAt(r) !== 58 || n.src.charCodeAt(r + 1) !== 47 || n.src.charCodeAt(r + 2) !== 47 || (c = n.pending.match(e), !c) || (i = c[1], a = n.md.linkify.matchAtStart(n.src.slice(r - i.length)), !a) || (l = a.url, l.length <= i.length) || (l = l.replace(/\*+$/, ""), u = n.md.normalizeLink(l), !n.md.validateLink(u)) ? !1 : (s || (n.pending = n.pending.slice(0, -i.length), f = n.push("link_open", "a", 1), f.attrs = [["href", u]], f.markup = "linkify", f.info = "auto", f = n.push("text", "", 0), f.content = n.md.normalizeLinkText(l), f = n.push("link_close", "a", -1), f.markup = "linkify", f.info = "auto"), n.pos += l.length - i.length, !0);
  }, oo;
}
var co, fa;
function aG() {
  if (fa) return co;
  fa = 1;
  var e = xe().isSpace;
  return co = function(n, s) {
    var r, o, c, i = n.pos;
    if (n.src.charCodeAt(i) !== 10)
      return !1;
    if (r = n.pending.length - 1, o = n.posMax, !s)
      if (r >= 0 && n.pending.charCodeAt(r) === 32)
        if (r >= 1 && n.pending.charCodeAt(r - 1) === 32) {
          for (c = r - 1; c >= 1 && n.pending.charCodeAt(c - 1) === 32; ) c--;
          n.pending = n.pending.slice(0, c), n.push("hardbreak", "br", 0);
        } else
          n.pending = n.pending.slice(0, -1), n.push("softbreak", "br", 0);
      else
        n.push("softbreak", "br", 0);
    for (i++; i < o && e(n.src.charCodeAt(i)); )
      i++;
    return n.pos = i, !0;
  }, co;
}
var io, ha;
function lG() {
  if (ha) return io;
  ha = 1;
  for (var e = xe().isSpace, t = [], n = 0; n < 256; n++)
    t.push(0);
  return "\\!\"#$%&'()*+,./:;<=>?@[]^_`{|}~-".split("").forEach(function(s) {
    t[s.charCodeAt(0)] = 1;
  }), io = function(r, o) {
    var c, i, a, l, u, f = r.pos, d = r.posMax;
    if (r.src.charCodeAt(f) !== 92 || (f++, f >= d)) return !1;
    if (c = r.src.charCodeAt(f), c === 10) {
      for (o || r.push("hardbreak", "br", 0), f++; f < d && (c = r.src.charCodeAt(f), !!e(c)); )
        f++;
      return r.pos = f, !0;
    }
    return l = r.src[f], c >= 55296 && c <= 56319 && f + 1 < d && (i = r.src.charCodeAt(f + 1), i >= 56320 && i <= 57343 && (l += r.src[f + 1], f++)), a = "\\" + l, o || (u = r.push("text_special", "", 0), c < 256 && t[c] !== 0 ? u.content = l : u.content = a, u.markup = a, u.info = "escape"), r.pos = f + 1, !0;
  }, io;
}
var ao, da;
function uG() {
  return da || (da = 1, ao = function(t, n) {
    var s, r, o, c, i, a, l, u, f = t.pos, d = t.src.charCodeAt(f);
    if (d !== 96)
      return !1;
    for (s = f, f++, r = t.posMax; f < r && t.src.charCodeAt(f) === 96; )
      f++;
    if (o = t.src.slice(s, f), l = o.length, t.backticksScanned && (t.backticks[l] || 0) <= s)
      return n || (t.pending += o), t.pos += l, !0;
    for (a = f; (i = t.src.indexOf("`", a)) !== -1; ) {
      for (a = i + 1; a < r && t.src.charCodeAt(a) === 96; )
        a++;
      if (u = a - i, u === l)
        return n || (c = t.push("code_inline", "code", 0), c.markup = o, c.content = t.src.slice(f, i).replace(/\n/g, " ").replace(/^ (.+) $/, "$1")), t.pos = a, !0;
      t.backticks[u] = i;
    }
    return t.backticksScanned = !0, n || (t.pending += o), t.pos += l, !0;
  }), ao;
}
var gs = {}, pa;
function ga() {
  if (pa) return gs;
  pa = 1, gs.tokenize = function(n, s) {
    var r, o, c, i, a, l = n.pos, u = n.src.charCodeAt(l);
    if (s || u !== 126 || (o = n.scanDelims(n.pos, !0), i = o.length, a = String.fromCharCode(u), i < 2))
      return !1;
    for (i % 2 && (c = n.push("text", "", 0), c.content = a, i--), r = 0; r < i; r += 2)
      c = n.push("text", "", 0), c.content = a + a, n.delimiters.push({
        marker: u,
        length: 0,
        // disable "rule of 3" length checks meant for emphasis
        token: n.tokens.length - 1,
        end: -1,
        open: o.can_open,
        close: o.can_close
      });
    return n.pos += o.length, !0;
  };
  function e(t, n) {
    var s, r, o, c, i, a = [], l = n.length;
    for (s = 0; s < l; s++)
      o = n[s], o.marker === 126 && o.end !== -1 && (c = n[o.end], i = t.tokens[o.token], i.type = "s_open", i.tag = "s", i.nesting = 1, i.markup = "~~", i.content = "", i = t.tokens[c.token], i.type = "s_close", i.tag = "s", i.nesting = -1, i.markup = "~~", i.content = "", t.tokens[c.token - 1].type === "text" && t.tokens[c.token - 1].content === "~" && a.push(c.token - 1));
    for (; a.length; ) {
      for (s = a.pop(), r = s + 1; r < t.tokens.length && t.tokens[r].type === "s_close"; )
        r++;
      r--, s !== r && (i = t.tokens[r], t.tokens[r] = t.tokens[s], t.tokens[s] = i);
    }
  }
  return gs.postProcess = function(n) {
    var s, r = n.tokens_meta, o = n.tokens_meta.length;
    for (e(n, n.delimiters), s = 0; s < o; s++)
      r[s] && r[s].delimiters && e(n, r[s].delimiters);
  }, gs;
}
var _s = {}, _a;
function ma() {
  if (_a) return _s;
  _a = 1, _s.tokenize = function(n, s) {
    var r, o, c, i = n.pos, a = n.src.charCodeAt(i);
    if (s || a !== 95 && a !== 42)
      return !1;
    for (o = n.scanDelims(n.pos, a === 42), r = 0; r < o.length; r++)
      c = n.push("text", "", 0), c.content = String.fromCharCode(a), n.delimiters.push({
        // Char code of the starting marker (number).
        //
        marker: a,
        // Total length of these series of delimiters.
        //
        length: o.length,
        // A position of the token this delimiter corresponds to.
        //
        token: n.tokens.length - 1,
        // If this delimiter is matched as a valid opener, `end` will be
        // equal to its position, otherwise it's `-1`.
        //
        end: -1,
        // Boolean flags that determine if this delimiter could open or close
        // an emphasis.
        //
        open: o.can_open,
        close: o.can_close
      });
    return n.pos += o.length, !0;
  };
  function e(t, n) {
    var s, r, o, c, i, a, l = n.length;
    for (s = l - 1; s >= 0; s--)
      r = n[s], !(r.marker !== 95 && r.marker !== 42) && r.end !== -1 && (o = n[r.end], a = s > 0 && n[s - 1].end === r.end + 1 && // check that first two markers match and adjacent
      n[s - 1].marker === r.marker && n[s - 1].token === r.token - 1 && // check that last two markers are adjacent (we can safely assume they match)
      n[r.end + 1].token === o.token + 1, i = String.fromCharCode(r.marker), c = t.tokens[r.token], c.type = a ? "strong_open" : "em_open", c.tag = a ? "strong" : "em", c.nesting = 1, c.markup = a ? i + i : i, c.content = "", c = t.tokens[o.token], c.type = a ? "strong_close" : "em_close", c.tag = a ? "strong" : "em", c.nesting = -1, c.markup = a ? i + i : i, c.content = "", a && (t.tokens[n[s - 1].token].content = "", t.tokens[n[r.end + 1].token].content = "", s--));
  }
  return _s.postProcess = function(n) {
    var s, r = n.tokens_meta, o = n.tokens_meta.length;
    for (e(n, n.delimiters), s = 0; s < o; s++)
      r[s] && r[s].delimiters && e(n, r[s].delimiters);
  }, _s;
}
var lo, ba;
function fG() {
  if (ba) return lo;
  ba = 1;
  var e = xe().normalizeReference, t = xe().isSpace;
  return lo = function(s, r) {
    var o, c, i, a, l, u, f, d, h, m = "", x = "", A = s.pos, v = s.posMax, k = s.pos, b = !0;
    if (s.src.charCodeAt(s.pos) !== 91 || (l = s.pos + 1, a = s.md.helpers.parseLinkLabel(s, s.pos, !0), a < 0))
      return !1;
    if (u = a + 1, u < v && s.src.charCodeAt(u) === 40) {
      for (b = !1, u++; u < v && (c = s.src.charCodeAt(u), !(!t(c) && c !== 10)); u++)
        ;
      if (u >= v)
        return !1;
      if (k = u, f = s.md.helpers.parseLinkDestination(s.src, u, s.posMax), f.ok) {
        for (m = s.md.normalizeLink(f.str), s.md.validateLink(m) ? u = f.pos : m = "", k = u; u < v && (c = s.src.charCodeAt(u), !(!t(c) && c !== 10)); u++)
          ;
        if (f = s.md.helpers.parseLinkTitle(s.src, u, s.posMax), u < v && k !== u && f.ok)
          for (x = f.str, u = f.pos; u < v && (c = s.src.charCodeAt(u), !(!t(c) && c !== 10)); u++)
            ;
      }
      (u >= v || s.src.charCodeAt(u) !== 41) && (b = !0), u++;
    }
    if (b) {
      if (typeof s.env.references > "u")
        return !1;
      if (u < v && s.src.charCodeAt(u) === 91 ? (k = u + 1, u = s.md.helpers.parseLinkLabel(s, u), u >= 0 ? i = s.src.slice(k, u++) : u = a + 1) : u = a + 1, i || (i = s.src.slice(l, a)), d = s.env.references[e(i)], !d)
        return s.pos = A, !1;
      m = d.href, x = d.title;
    }
    return r || (s.pos = l, s.posMax = a, h = s.push("link_open", "a", 1), h.attrs = o = [["href", m]], x && o.push(["title", x]), s.linkLevel++, s.md.inline.tokenize(s), s.linkLevel--, h = s.push("link_close", "a", -1)), s.pos = u, s.posMax = v, !0;
  }, lo;
}
var uo, va;
function hG() {
  if (va) return uo;
  va = 1;
  var e = xe().normalizeReference, t = xe().isSpace;
  return uo = function(s, r) {
    var o, c, i, a, l, u, f, d, h, m, x, A, v, k = "", b = s.pos, p = s.posMax;
    if (s.src.charCodeAt(s.pos) !== 33 || s.src.charCodeAt(s.pos + 1) !== 91 || (u = s.pos + 2, l = s.md.helpers.parseLinkLabel(s, s.pos + 1, !1), l < 0))
      return !1;
    if (f = l + 1, f < p && s.src.charCodeAt(f) === 40) {
      for (f++; f < p && (c = s.src.charCodeAt(f), !(!t(c) && c !== 10)); f++)
        ;
      if (f >= p)
        return !1;
      for (v = f, h = s.md.helpers.parseLinkDestination(s.src, f, s.posMax), h.ok && (k = s.md.normalizeLink(h.str), s.md.validateLink(k) ? f = h.pos : k = ""), v = f; f < p && (c = s.src.charCodeAt(f), !(!t(c) && c !== 10)); f++)
        ;
      if (h = s.md.helpers.parseLinkTitle(s.src, f, s.posMax), f < p && v !== f && h.ok)
        for (m = h.str, f = h.pos; f < p && (c = s.src.charCodeAt(f), !(!t(c) && c !== 10)); f++)
          ;
      else
        m = "";
      if (f >= p || s.src.charCodeAt(f) !== 41)
        return s.pos = b, !1;
      f++;
    } else {
      if (typeof s.env.references > "u")
        return !1;
      if (f < p && s.src.charCodeAt(f) === 91 ? (v = f + 1, f = s.md.helpers.parseLinkLabel(s, f), f >= 0 ? a = s.src.slice(v, f++) : f = l + 1) : f = l + 1, a || (a = s.src.slice(u, l)), d = s.env.references[e(a)], !d)
        return s.pos = b, !1;
      k = d.href, m = d.title;
    }
    return r || (i = s.src.slice(u, l), s.md.inline.parse(
      i,
      s.md,
      s.env,
      A = []
    ), x = s.push("image", "img", 0), x.attrs = o = [["src", k], ["alt", ""]], x.children = A, x.content = i, m && o.push(["title", m])), s.pos = f, s.posMax = p, !0;
  }, uo;
}
var fo, ya;
function dG() {
  if (ya) return fo;
  ya = 1;
  var e = /^([a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)$/, t = /^([a-zA-Z][a-zA-Z0-9+.\-]{1,31}):([^<>\x00-\x20]*)$/;
  return fo = function(s, r) {
    var o, c, i, a, l, u, f = s.pos;
    if (s.src.charCodeAt(f) !== 60)
      return !1;
    for (l = s.pos, u = s.posMax; ; ) {
      if (++f >= u || (a = s.src.charCodeAt(f), a === 60)) return !1;
      if (a === 62) break;
    }
    return o = s.src.slice(l + 1, f), t.test(o) ? (c = s.md.normalizeLink(o), s.md.validateLink(c) ? (r || (i = s.push("link_open", "a", 1), i.attrs = [["href", c]], i.markup = "autolink", i.info = "auto", i = s.push("text", "", 0), i.content = s.md.normalizeLinkText(o), i = s.push("link_close", "a", -1), i.markup = "autolink", i.info = "auto"), s.pos += o.length + 2, !0) : !1) : e.test(o) ? (c = s.md.normalizeLink("mailto:" + o), s.md.validateLink(c) ? (r || (i = s.push("link_open", "a", 1), i.attrs = [["href", c]], i.markup = "autolink", i.info = "auto", i = s.push("text", "", 0), i.content = s.md.normalizeLinkText(o), i = s.push("link_close", "a", -1), i.markup = "autolink", i.info = "auto"), s.pos += o.length + 2, !0) : !1) : !1;
  }, fo;
}
var ho, xa;
function pG() {
  if (xa) return ho;
  xa = 1;
  var e = vu().HTML_TAG_RE;
  function t(r) {
    return /^<a[>\s]/i.test(r);
  }
  function n(r) {
    return /^<\/a\s*>/i.test(r);
  }
  function s(r) {
    var o = r | 32;
    return o >= 97 && o <= 122;
  }
  return ho = function(o, c) {
    var i, a, l, u, f = o.pos;
    return !o.md.options.html || (l = o.posMax, o.src.charCodeAt(f) !== 60 || f + 2 >= l) || (i = o.src.charCodeAt(f + 1), i !== 33 && i !== 63 && i !== 47 && !s(i)) || (a = o.src.slice(f).match(e), !a) ? !1 : (c || (u = o.push("html_inline", "", 0), u.content = a[0], t(u.content) && o.linkLevel++, n(u.content) && o.linkLevel--), o.pos += a[0].length, !0);
  }, ho;
}
var po, ka;
function gG() {
  if (ka) return po;
  ka = 1;
  var e = pu(), t = xe().has, n = xe().isValidEntityCode, s = xe().fromCodePoint, r = /^&#((?:x[a-f0-9]{1,6}|[0-9]{1,7}));/i, o = /^&([a-z][a-z0-9]{1,31});/i;
  return po = function(i, a) {
    var l, u, f, d, h = i.pos, m = i.posMax;
    if (i.src.charCodeAt(h) !== 38 || h + 1 >= m) return !1;
    if (l = i.src.charCodeAt(h + 1), l === 35) {
      if (f = i.src.slice(h).match(r), f)
        return a || (u = f[1][0].toLowerCase() === "x" ? parseInt(f[1].slice(1), 16) : parseInt(f[1], 10), d = i.push("text_special", "", 0), d.content = n(u) ? s(u) : s(65533), d.markup = f[0], d.info = "entity"), i.pos += f[0].length, !0;
    } else if (f = i.src.slice(h).match(o), f && t(e, f[1]))
      return a || (d = i.push("text_special", "", 0), d.content = e[f[1]], d.markup = f[0], d.info = "entity"), i.pos += f[0].length, !0;
    return !1;
  }, po;
}
var go, Ea;
function _G() {
  if (Ea) return go;
  Ea = 1;
  function e(t) {
    var n, s, r, o, c, i, a, l, u = {}, f = t.length;
    if (f) {
      var d = 0, h = -2, m = [];
      for (n = 0; n < f; n++)
        if (r = t[n], m.push(0), (t[d].marker !== r.marker || h !== r.token - 1) && (d = n), h = r.token, r.length = r.length || 0, !!r.close) {
          for (u.hasOwnProperty(r.marker) || (u[r.marker] = [-1, -1, -1, -1, -1, -1]), c = u[r.marker][(r.open ? 3 : 0) + r.length % 3], s = d - m[d] - 1, i = s; s > c; s -= m[s] + 1)
            if (o = t[s], o.marker === r.marker && o.open && o.end < 0 && (a = !1, (o.close || r.open) && (o.length + r.length) % 3 === 0 && (o.length % 3 !== 0 || r.length % 3 !== 0) && (a = !0), !a)) {
              l = s > 0 && !t[s - 1].open ? m[s - 1] + 1 : 0, m[n] = n - s + l, m[s] = l, r.open = !1, o.end = n, o.close = !1, i = -1, h = -2;
              break;
            }
          i !== -1 && (u[r.marker][(r.open ? 3 : 0) + (r.length || 0) % 3] = i);
        }
    }
  }
  return go = function(n) {
    var s, r = n.tokens_meta, o = n.tokens_meta.length;
    for (e(n.delimiters), s = 0; s < o; s++)
      r[s] && r[s].delimiters && e(r[s].delimiters);
  }, go;
}
var _o, Ca;
function mG() {
  return Ca || (Ca = 1, _o = function(t) {
    var n, s, r = 0, o = t.tokens, c = t.tokens.length;
    for (n = s = 0; n < c; n++)
      o[n].nesting < 0 && r--, o[n].level = r, o[n].nesting > 0 && r++, o[n].type === "text" && n + 1 < c && o[n + 1].type === "text" ? o[n + 1].content = o[n].content + o[n + 1].content : (n !== s && (o[s] = o[n]), s++);
    n !== s && (o.length = s);
  }), _o;
}
var mo, Aa;
function bG() {
  if (Aa) return mo;
  Aa = 1;
  var e = fc(), t = xe().isWhiteSpace, n = xe().isPunctChar, s = xe().isMdAsciiPunct;
  function r(o, c, i, a) {
    this.src = o, this.env = i, this.md = c, this.tokens = a, this.tokens_meta = Array(a.length), this.pos = 0, this.posMax = this.src.length, this.level = 0, this.pending = "", this.pendingLevel = 0, this.cache = {}, this.delimiters = [], this._prev_delimiters = [], this.backticks = {}, this.backticksScanned = !1, this.linkLevel = 0;
  }
  return r.prototype.pushPending = function() {
    var o = new e("text", "", 0);
    return o.content = this.pending, o.level = this.pendingLevel, this.tokens.push(o), this.pending = "", o;
  }, r.prototype.push = function(o, c, i) {
    this.pending && this.pushPending();
    var a = new e(o, c, i), l = null;
    return i < 0 && (this.level--, this.delimiters = this._prev_delimiters.pop()), a.level = this.level, i > 0 && (this.level++, this._prev_delimiters.push(this.delimiters), this.delimiters = [], l = { delimiters: this.delimiters }), this.pendingLevel = this.level, this.tokens.push(a), this.tokens_meta.push(l), a;
  }, r.prototype.scanDelims = function(o, c) {
    var i = o, a, l, u, f, d, h, m, x, A, v = !0, k = !0, b = this.posMax, p = this.src.charCodeAt(o);
    for (a = o > 0 ? this.src.charCodeAt(o - 1) : 32; i < b && this.src.charCodeAt(i) === p; )
      i++;
    return u = i - o, l = i < b ? this.src.charCodeAt(i) : 32, m = s(a) || n(String.fromCharCode(a)), A = s(l) || n(String.fromCharCode(l)), h = t(a), x = t(l), x ? v = !1 : A && (h || m || (v = !1)), h ? k = !1 : m && (x || A || (k = !1)), c ? (f = v, d = k) : (f = v && (!k || m), d = k && (!v || A)), {
      can_open: f,
      can_close: d,
      length: u
    };
  }, r.prototype.Token = e, mo = r, mo;
}
var bo, wa;
function vG() {
  if (wa) return bo;
  wa = 1;
  var e = uc(), t = [
    ["text", cG()],
    ["linkify", iG()],
    ["newline", aG()],
    ["escape", lG()],
    ["backticks", uG()],
    ["strikethrough", ga().tokenize],
    ["emphasis", ma().tokenize],
    ["link", fG()],
    ["image", hG()],
    ["autolink", dG()],
    ["html_inline", pG()],
    ["entity", gG()]
  ], n = [
    ["balance_pairs", _G()],
    ["strikethrough", ga().postProcess],
    ["emphasis", ma().postProcess],
    // rules for pairs separate '**' into its own text tokens, which may be left unused,
    // rule below merges unused segments back with the rest of the text
    ["fragments_join", mG()]
  ];
  function s() {
    var r;
    for (this.ruler = new e(), r = 0; r < t.length; r++)
      this.ruler.push(t[r][0], t[r][1]);
    for (this.ruler2 = new e(), r = 0; r < n.length; r++)
      this.ruler2.push(n[r][0], n[r][1]);
  }
  return s.prototype.skipToken = function(r) {
    var o, c, i = r.pos, a = this.ruler.getRules(""), l = a.length, u = r.md.options.maxNesting, f = r.cache;
    if (typeof f[i] < "u") {
      r.pos = f[i];
      return;
    }
    if (r.level < u) {
      for (c = 0; c < l; c++)
        if (r.level++, o = a[c](r, !0), r.level--, o) {
          if (i >= r.pos)
            throw new Error("inline rule didn't increment state.pos");
          break;
        }
    } else
      r.pos = r.posMax;
    o || r.pos++, f[i] = r.pos;
  }, s.prototype.tokenize = function(r) {
    for (var o, c, i, a = this.ruler.getRules(""), l = a.length, u = r.posMax, f = r.md.options.maxNesting; r.pos < u; ) {
      if (i = r.pos, r.level < f) {
        for (c = 0; c < l; c++)
          if (o = a[c](r, !1), o) {
            if (i >= r.pos)
              throw new Error("inline rule didn't increment state.pos");
            break;
          }
      }
      if (o) {
        if (r.pos >= u)
          break;
        continue;
      }
      r.pending += r.src[r.pos++];
    }
    r.pending && r.pushPending();
  }, s.prototype.parse = function(r, o, c, i) {
    var a, l, u, f = new this.State(r, o, c, i);
    for (this.tokenize(f), l = this.ruler2.getRules(""), u = l.length, a = 0; a < u; a++)
      l[a](f);
  }, s.prototype.State = bG(), bo = s, bo;
}
var vo, Sa;
function yG() {
  return Sa || (Sa = 1, vo = function(e) {
    var t = {};
    e = e || {}, t.src_Any = _u().source, t.src_Cc = mu().source, t.src_Z = bu().source, t.src_P = lc().source, t.src_ZPCc = [t.src_Z, t.src_P, t.src_Cc].join("|"), t.src_ZCc = [t.src_Z, t.src_Cc].join("|");
    var n = "[><｜]";
    return t.src_pseudo_letter = "(?:(?!" + n + "|" + t.src_ZPCc + ")" + t.src_Any + ")", t.src_ip4 = "(?:(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)", t.src_auth = "(?:(?:(?!" + t.src_ZCc + "|[@/\\[\\]()]).)+@)?", t.src_port = "(?::(?:6(?:[0-4]\\d{3}|5(?:[0-4]\\d{2}|5(?:[0-2]\\d|3[0-5])))|[1-5]?\\d{1,4}))?", t.src_host_terminator = "(?=$|" + n + "|" + t.src_ZPCc + ")(?!" + (e["---"] ? "-(?!--)|" : "-|") + "_|:\\d|\\.-|\\.(?!$|" + t.src_ZPCc + "))", t.src_path = "(?:[/?#](?:(?!" + t.src_ZCc + "|" + n + `|[()[\\]{}.,"'?!\\-;]).|\\[(?:(?!` + t.src_ZCc + "|\\]).)*\\]|\\((?:(?!" + t.src_ZCc + "|[)]).)*\\)|\\{(?:(?!" + t.src_ZCc + '|[}]).)*\\}|\\"(?:(?!' + t.src_ZCc + `|["]).)+\\"|\\'(?:(?!` + t.src_ZCc + "|[']).)+\\'|\\'(?=" + t.src_pseudo_letter + "|[-])|\\.{2,}[a-zA-Z0-9%/&]|\\.(?!" + t.src_ZCc + "|[.]|$)|" + (e["---"] ? "\\-(?!--(?:[^-]|$))(?:-*)|" : "\\-+|") + ",(?!" + t.src_ZCc + "|$)|;(?!" + t.src_ZCc + "|$)|\\!+(?!" + t.src_ZCc + "|[!]|$)|\\?(?!" + t.src_ZCc + "|[?]|$))+|\\/)?", t.src_email_name = '[\\-;:&=\\+\\$,\\.a-zA-Z0-9_][\\-;:&=\\+\\$,\\"\\.a-zA-Z0-9_]*', t.src_xn = "xn--[a-z0-9\\-]{1,59}", t.src_domain_root = // Allow letters & digits (http://test1)
    "(?:" + t.src_xn + "|" + t.src_pseudo_letter + "{1,63})", t.src_domain = "(?:" + t.src_xn + "|(?:" + t.src_pseudo_letter + ")|(?:" + t.src_pseudo_letter + "(?:-|" + t.src_pseudo_letter + "){0,61}" + t.src_pseudo_letter + "))", t.src_host = "(?:(?:(?:(?:" + t.src_domain + ")\\.)*" + t.src_domain + "))", t.tpl_host_fuzzy = "(?:" + t.src_ip4 + "|(?:(?:(?:" + t.src_domain + ")\\.)+(?:%TLDS%)))", t.tpl_host_no_ip_fuzzy = "(?:(?:(?:" + t.src_domain + ")\\.)+(?:%TLDS%))", t.src_host_strict = t.src_host + t.src_host_terminator, t.tpl_host_fuzzy_strict = t.tpl_host_fuzzy + t.src_host_terminator, t.src_host_port_strict = t.src_host + t.src_port + t.src_host_terminator, t.tpl_host_port_fuzzy_strict = t.tpl_host_fuzzy + t.src_port + t.src_host_terminator, t.tpl_host_port_no_ip_fuzzy_strict = t.tpl_host_no_ip_fuzzy + t.src_port + t.src_host_terminator, t.tpl_host_fuzzy_test = "localhost|www\\.|\\.\\d{1,3}\\.|(?:\\.(?:%TLDS%)(?:" + t.src_ZPCc + "|>|$))", t.tpl_email_fuzzy = "(^|" + n + '|"|\\(|' + t.src_ZCc + ")(" + t.src_email_name + "@" + t.tpl_host_fuzzy_strict + ")", t.tpl_link_fuzzy = // Fuzzy link can't be prepended with .:/\- and non punctuation.
    // but can start with > (markdown blockquote)
    "(^|(?![.:/\\-_@])(?:[$+<=>^`|｜]|" + t.src_ZPCc + "))((?![$+<=>^`|｜])" + t.tpl_host_port_fuzzy_strict + t.src_path + ")", t.tpl_link_no_ip_fuzzy = // Fuzzy link can't be prepended with .:/\- and non punctuation.
    // but can start with > (markdown blockquote)
    "(^|(?![.:/\\-_@])(?:[$+<=>^`|｜]|" + t.src_ZPCc + "))((?![$+<=>^`|｜])" + t.tpl_host_port_no_ip_fuzzy_strict + t.src_path + ")", t;
  }), vo;
}
var yo, Ta;
function xG() {
  if (Ta) return yo;
  Ta = 1;
  function e(b) {
    var p = Array.prototype.slice.call(arguments, 1);
    return p.forEach(function(E) {
      E && Object.keys(E).forEach(function(C) {
        b[C] = E[C];
      });
    }), b;
  }
  function t(b) {
    return Object.prototype.toString.call(b);
  }
  function n(b) {
    return t(b) === "[object String]";
  }
  function s(b) {
    return t(b) === "[object Object]";
  }
  function r(b) {
    return t(b) === "[object RegExp]";
  }
  function o(b) {
    return t(b) === "[object Function]";
  }
  function c(b) {
    return b.replace(/[.?*+^$[\]\\(){}|-]/g, "\\$&");
  }
  var i = {
    fuzzyLink: !0,
    fuzzyEmail: !0,
    fuzzyIP: !1
  };
  function a(b) {
    return Object.keys(b || {}).reduce(function(p, E) {
      return p || i.hasOwnProperty(E);
    }, !1);
  }
  var l = {
    "http:": {
      validate: function(b, p, E) {
        var C = b.slice(p);
        return E.re.http || (E.re.http = new RegExp(
          "^\\/\\/" + E.re.src_auth + E.re.src_host_port_strict + E.re.src_path,
          "i"
        )), E.re.http.test(C) ? C.match(E.re.http)[0].length : 0;
      }
    },
    "https:": "http:",
    "ftp:": "http:",
    "//": {
      validate: function(b, p, E) {
        var C = b.slice(p);
        return E.re.no_http || (E.re.no_http = new RegExp(
          "^" + E.re.src_auth + // Don't allow single-level domains, because of false positives like '//test'
          // with code comments
          "(?:localhost|(?:(?:" + E.re.src_domain + ")\\.)+" + E.re.src_domain_root + ")" + E.re.src_port + E.re.src_host_terminator + E.re.src_path,
          "i"
        )), E.re.no_http.test(C) ? p >= 3 && b[p - 3] === ":" || p >= 3 && b[p - 3] === "/" ? 0 : C.match(E.re.no_http)[0].length : 0;
      }
    },
    "mailto:": {
      validate: function(b, p, E) {
        var C = b.slice(p);
        return E.re.mailto || (E.re.mailto = new RegExp(
          "^" + E.re.src_email_name + "@" + E.re.src_host_strict,
          "i"
        )), E.re.mailto.test(C) ? C.match(E.re.mailto)[0].length : 0;
      }
    }
  }, u = "a[cdefgilmnoqrstuwxz]|b[abdefghijmnorstvwyz]|c[acdfghiklmnoruvwxyz]|d[ejkmoz]|e[cegrstu]|f[ijkmor]|g[abdefghilmnpqrstuwy]|h[kmnrtu]|i[delmnoqrst]|j[emop]|k[eghimnprwyz]|l[abcikrstuvy]|m[acdeghklmnopqrstuvwxyz]|n[acefgilopruz]|om|p[aefghklmnrstwy]|qa|r[eosuw]|s[abcdeghijklmnortuvxyz]|t[cdfghjklmnortvwz]|u[agksyz]|v[aceginu]|w[fs]|y[et]|z[amw]", f = "biz|com|edu|gov|net|org|pro|web|xxx|aero|asia|coop|info|museum|name|shop|рф".split("|");
  function d(b) {
    b.__index__ = -1, b.__text_cache__ = "";
  }
  function h(b) {
    return function(p, E) {
      var C = p.slice(E);
      return b.test(C) ? C.match(b)[0].length : 0;
    };
  }
  function m() {
    return function(b, p) {
      p.normalize(b);
    };
  }
  function x(b) {
    var p = b.re = yG()(b.__opts__), E = b.__tlds__.slice();
    b.onCompile(), b.__tlds_replaced__ || E.push(u), E.push(p.src_xn), p.src_tlds = E.join("|");
    function C(M) {
      return M.replace("%TLDS%", p.src_tlds);
    }
    p.email_fuzzy = RegExp(C(p.tpl_email_fuzzy), "i"), p.link_fuzzy = RegExp(C(p.tpl_link_fuzzy), "i"), p.link_no_ip_fuzzy = RegExp(C(p.tpl_link_no_ip_fuzzy), "i"), p.host_fuzzy_test = RegExp(C(p.tpl_host_fuzzy_test), "i");
    var z = [];
    b.__compiled__ = {};
    function T(M, q) {
      throw new Error('(LinkifyIt) Invalid schema "' + M + '": ' + q);
    }
    Object.keys(b.__schemas__).forEach(function(M) {
      var q = b.__schemas__[M];
      if (q !== null) {
        var I = { validate: null, link: null };
        if (b.__compiled__[M] = I, s(q)) {
          r(q.validate) ? I.validate = h(q.validate) : o(q.validate) ? I.validate = q.validate : T(M, q), o(q.normalize) ? I.normalize = q.normalize : q.normalize ? T(M, q) : I.normalize = m();
          return;
        }
        if (n(q)) {
          z.push(M);
          return;
        }
        T(M, q);
      }
    }), z.forEach(function(M) {
      b.__compiled__[b.__schemas__[M]] && (b.__compiled__[M].validate = b.__compiled__[b.__schemas__[M]].validate, b.__compiled__[M].normalize = b.__compiled__[b.__schemas__[M]].normalize);
    }), b.__compiled__[""] = { validate: null, normalize: m() };
    var R = Object.keys(b.__compiled__).filter(function(M) {
      return M.length > 0 && b.__compiled__[M];
    }).map(c).join("|");
    b.re.schema_test = RegExp("(^|(?!_)(?:[><｜]|" + p.src_ZPCc + "))(" + R + ")", "i"), b.re.schema_search = RegExp("(^|(?!_)(?:[><｜]|" + p.src_ZPCc + "))(" + R + ")", "ig"), b.re.schema_at_start = RegExp("^" + b.re.schema_search.source, "i"), b.re.pretest = RegExp(
      "(" + b.re.schema_test.source + ")|(" + b.re.host_fuzzy_test.source + ")|@",
      "i"
    ), d(b);
  }
  function A(b, p) {
    var E = b.__index__, C = b.__last_index__, z = b.__text_cache__.slice(E, C);
    this.schema = b.__schema__.toLowerCase(), this.index = E + p, this.lastIndex = C + p, this.raw = z, this.text = z, this.url = z;
  }
  function v(b, p) {
    var E = new A(b, p);
    return b.__compiled__[E.schema].normalize(E, b), E;
  }
  function k(b, p) {
    if (!(this instanceof k))
      return new k(b, p);
    p || a(b) && (p = b, b = {}), this.__opts__ = e({}, i, p), this.__index__ = -1, this.__last_index__ = -1, this.__schema__ = "", this.__text_cache__ = "", this.__schemas__ = e({}, l, b), this.__compiled__ = {}, this.__tlds__ = f, this.__tlds_replaced__ = !1, this.re = {}, x(this);
  }
  return k.prototype.add = function(p, E) {
    return this.__schemas__[p] = E, x(this), this;
  }, k.prototype.set = function(p) {
    return this.__opts__ = e(this.__opts__, p), this;
  }, k.prototype.test = function(p) {
    if (this.__text_cache__ = p, this.__index__ = -1, !p.length)
      return !1;
    var E, C, z, T, R, M, q, I, se;
    if (this.re.schema_test.test(p)) {
      for (q = this.re.schema_search, q.lastIndex = 0; (E = q.exec(p)) !== null; )
        if (T = this.testSchemaAt(p, E[2], q.lastIndex), T) {
          this.__schema__ = E[2], this.__index__ = E.index + E[1].length, this.__last_index__ = E.index + E[0].length + T;
          break;
        }
    }
    return this.__opts__.fuzzyLink && this.__compiled__["http:"] && (I = p.search(this.re.host_fuzzy_test), I >= 0 && (this.__index__ < 0 || I < this.__index__) && (C = p.match(this.__opts__.fuzzyIP ? this.re.link_fuzzy : this.re.link_no_ip_fuzzy)) !== null && (R = C.index + C[1].length, (this.__index__ < 0 || R < this.__index__) && (this.__schema__ = "", this.__index__ = R, this.__last_index__ = C.index + C[0].length))), this.__opts__.fuzzyEmail && this.__compiled__["mailto:"] && (se = p.indexOf("@"), se >= 0 && (z = p.match(this.re.email_fuzzy)) !== null && (R = z.index + z[1].length, M = z.index + z[0].length, (this.__index__ < 0 || R < this.__index__ || R === this.__index__ && M > this.__last_index__) && (this.__schema__ = "mailto:", this.__index__ = R, this.__last_index__ = M))), this.__index__ >= 0;
  }, k.prototype.pretest = function(p) {
    return this.re.pretest.test(p);
  }, k.prototype.testSchemaAt = function(p, E, C) {
    return this.__compiled__[E.toLowerCase()] ? this.__compiled__[E.toLowerCase()].validate(p, C, this) : 0;
  }, k.prototype.match = function(p) {
    var E = 0, C = [];
    this.__index__ >= 0 && this.__text_cache__ === p && (C.push(v(this, E)), E = this.__last_index__);
    for (var z = E ? p.slice(E) : p; this.test(z); )
      C.push(v(this, E)), z = z.slice(this.__last_index__), E += this.__last_index__;
    return C.length ? C : null;
  }, k.prototype.matchAtStart = function(p) {
    if (this.__text_cache__ = p, this.__index__ = -1, !p.length) return null;
    var E = this.re.schema_at_start.exec(p);
    if (!E) return null;
    var C = this.testSchemaAt(p, E[2], E[0].length);
    return C ? (this.__schema__ = E[2], this.__index__ = E.index + E[1].length, this.__last_index__ = E.index + E[0].length + C, v(this, 0)) : null;
  }, k.prototype.tlds = function(p, E) {
    return p = Array.isArray(p) ? p : [p], E ? (this.__tlds__ = this.__tlds__.concat(p).sort().filter(function(C, z, T) {
      return C !== T[z - 1];
    }).reverse(), x(this), this) : (this.__tlds__ = p.slice(), this.__tlds_replaced__ = !0, x(this), this);
  }, k.prototype.normalize = function(p) {
    p.schema || (p.url = "http://" + p.url), p.schema === "mailto:" && !/^mailto:/i.test(p.url) && (p.url = "mailto:" + p.url);
  }, k.prototype.onCompile = function() {
  }, yo = k, yo;
}
const wn = 2147483647, wt = 36, hc = 1, Xn = 26, kG = 38, EG = 700, yu = 72, xu = 128, ku = "-", CG = /^xn--/, AG = /[^\0-\x7F]/, wG = /[\x2E\u3002\uFF0E\uFF61]/g, SG = {
  overflow: "Overflow: input needs wider integers to process",
  "not-basic": "Illegal input >= 0x80 (not a basic code point)",
  "invalid-input": "Invalid input"
}, xo = wt - hc, St = Math.floor, ko = String.fromCharCode;
function jt(e) {
  throw new RangeError(SG[e]);
}
function TG(e, t) {
  const n = [];
  let s = e.length;
  for (; s--; )
    n[s] = t(e[s]);
  return n;
}
function Eu(e, t) {
  const n = e.split("@");
  let s = "";
  n.length > 1 && (s = n[0] + "@", e = n[1]), e = e.replace(wG, ".");
  const r = e.split("."), o = TG(r, t).join(".");
  return s + o;
}
function dc(e) {
  const t = [];
  let n = 0;
  const s = e.length;
  for (; n < s; ) {
    const r = e.charCodeAt(n++);
    if (r >= 55296 && r <= 56319 && n < s) {
      const o = e.charCodeAt(n++);
      (o & 64512) == 56320 ? t.push(((r & 1023) << 10) + (o & 1023) + 65536) : (t.push(r), n--);
    } else
      t.push(r);
  }
  return t;
}
const Cu = (e) => String.fromCodePoint(...e), RG = function(e) {
  return e >= 48 && e < 58 ? 26 + (e - 48) : e >= 65 && e < 91 ? e - 65 : e >= 97 && e < 123 ? e - 97 : wt;
}, Ra = function(e, t) {
  return e + 22 + 75 * (e < 26) - ((t != 0) << 5);
}, Au = function(e, t, n) {
  let s = 0;
  for (e = n ? St(e / EG) : e >> 1, e += St(e / t); e > xo * Xn >> 1; s += wt)
    e = St(e / xo);
  return St(s + (xo + 1) * e / (e + kG));
}, pc = function(e) {
  const t = [], n = e.length;
  let s = 0, r = xu, o = yu, c = e.lastIndexOf(ku);
  c < 0 && (c = 0);
  for (let i = 0; i < c; ++i)
    e.charCodeAt(i) >= 128 && jt("not-basic"), t.push(e.charCodeAt(i));
  for (let i = c > 0 ? c + 1 : 0; i < n; ) {
    const a = s;
    for (let u = 1, f = wt; ; f += wt) {
      i >= n && jt("invalid-input");
      const d = RG(e.charCodeAt(i++));
      d >= wt && jt("invalid-input"), d > St((wn - s) / u) && jt("overflow"), s += d * u;
      const h = f <= o ? hc : f >= o + Xn ? Xn : f - o;
      if (d < h)
        break;
      const m = wt - h;
      u > St(wn / m) && jt("overflow"), u *= m;
    }
    const l = t.length + 1;
    o = Au(s - a, l, a == 0), St(s / l) > wn - r && jt("overflow"), r += St(s / l), s %= l, t.splice(s++, 0, r);
  }
  return String.fromCodePoint(...t);
}, gc = function(e) {
  const t = [];
  e = dc(e);
  const n = e.length;
  let s = xu, r = 0, o = yu;
  for (const a of e)
    a < 128 && t.push(ko(a));
  const c = t.length;
  let i = c;
  for (c && t.push(ku); i < n; ) {
    let a = wn;
    for (const u of e)
      u >= s && u < a && (a = u);
    const l = i + 1;
    a - s > St((wn - r) / l) && jt("overflow"), r += (a - s) * l, s = a;
    for (const u of e)
      if (u < s && ++r > wn && jt("overflow"), u === s) {
        let f = r;
        for (let d = wt; ; d += wt) {
          const h = d <= o ? hc : d >= o + Xn ? Xn : d - o;
          if (f < h)
            break;
          const m = f - h, x = wt - h;
          t.push(
            ko(Ra(h + m % x, 0))
          ), f = St(m / x);
        }
        t.push(ko(Ra(f, 0))), o = Au(r, l, i === c), r = 0, ++i;
      }
    ++r, ++s;
  }
  return t.join("");
}, wu = function(e) {
  return Eu(e, function(t) {
    return CG.test(t) ? pc(t.slice(4).toLowerCase()) : t;
  });
}, Su = function(e) {
  return Eu(e, function(t) {
    return AG.test(t) ? "xn--" + gc(t) : t;
  });
}, DG = {
  /**
   * A string representing the current Punycode.js version number.
   * @memberOf punycode
   * @type String
   */
  version: "2.3.1",
  /**
   * An object of methods to convert from JavaScript's internal character
   * representation (UCS-2) to Unicode code points, and back.
   * @see <https://mathiasbynens.be/notes/javascript-encoding>
   * @memberOf punycode
   * @type Object
   */
  ucs2: {
    decode: dc,
    encode: Cu
  },
  decode: pc,
  encode: gc,
  toASCII: Su,
  toUnicode: wu
}, MG = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  decode: pc,
  default: DG,
  encode: gc,
  toASCII: Su,
  toUnicode: wu,
  ucs2decode: dc,
  ucs2encode: Cu
}, Symbol.toStringTag, { value: "Module" })), IG = /* @__PURE__ */ zd(MG);
var Eo, Da;
function NG() {
  return Da || (Da = 1, Eo = {
    options: {
      html: !1,
      // Enable HTML tags in source
      xhtmlOut: !1,
      // Use '/' to close single tags (<br />)
      breaks: !1,
      // Convert '\n' in paragraphs into <br>
      langPrefix: "language-",
      // CSS language prefix for fenced blocks
      linkify: !1,
      // autoconvert URL-like texts to links
      // Enable some language-neutral replacements + quotes beautification
      typographer: !1,
      // Double + single quotes replacement pairs, when typographer enabled,
      // and smartquotes on. Could be either a String or an Array.
      //
      // For example, you can use '«»„“' for Russian, '„“‚‘' for German,
      // and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
      quotes: "“”‘’",
      /* “”‘’ */
      // Highlighter function. Should return escaped HTML,
      // or '' if the source string is not changed and should be escaped externaly.
      // If result starts with <pre... internal wrapper is skipped.
      //
      // function (/*str, lang*/) { return ''; }
      //
      highlight: null,
      maxNesting: 100
      // Internal protection, recursion limit
    },
    components: {
      core: {},
      block: {},
      inline: {}
    }
  }), Eo;
}
var Co, Ma;
function LG() {
  return Ma || (Ma = 1, Co = {
    options: {
      html: !1,
      // Enable HTML tags in source
      xhtmlOut: !1,
      // Use '/' to close single tags (<br />)
      breaks: !1,
      // Convert '\n' in paragraphs into <br>
      langPrefix: "language-",
      // CSS language prefix for fenced blocks
      linkify: !1,
      // autoconvert URL-like texts to links
      // Enable some language-neutral replacements + quotes beautification
      typographer: !1,
      // Double + single quotes replacement pairs, when typographer enabled,
      // and smartquotes on. Could be either a String or an Array.
      //
      // For example, you can use '«»„“' for Russian, '„“‚‘' for German,
      // and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
      quotes: "“”‘’",
      /* “”‘’ */
      // Highlighter function. Should return escaped HTML,
      // or '' if the source string is not changed and should be escaped externaly.
      // If result starts with <pre... internal wrapper is skipped.
      //
      // function (/*str, lang*/) { return ''; }
      //
      highlight: null,
      maxNesting: 20
      // Internal protection, recursion limit
    },
    components: {
      core: {
        rules: [
          "normalize",
          "block",
          "inline",
          "text_join"
        ]
      },
      block: {
        rules: [
          "paragraph"
        ]
      },
      inline: {
        rules: [
          "text"
        ],
        rules2: [
          "balance_pairs",
          "fragments_join"
        ]
      }
    }
  }), Co;
}
var Ao, Ia;
function OG() {
  return Ia || (Ia = 1, Ao = {
    options: {
      html: !0,
      // Enable HTML tags in source
      xhtmlOut: !0,
      // Use '/' to close single tags (<br />)
      breaks: !1,
      // Convert '\n' in paragraphs into <br>
      langPrefix: "language-",
      // CSS language prefix for fenced blocks
      linkify: !1,
      // autoconvert URL-like texts to links
      // Enable some language-neutral replacements + quotes beautification
      typographer: !1,
      // Double + single quotes replacement pairs, when typographer enabled,
      // and smartquotes on. Could be either a String or an Array.
      //
      // For example, you can use '«»„“' for Russian, '„“‚‘' for German,
      // and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
      quotes: "“”‘’",
      /* “”‘’ */
      // Highlighter function. Should return escaped HTML,
      // or '' if the source string is not changed and should be escaped externaly.
      // If result starts with <pre... internal wrapper is skipped.
      //
      // function (/*str, lang*/) { return ''; }
      //
      highlight: null,
      maxNesting: 20
      // Internal protection, recursion limit
    },
    components: {
      core: {
        rules: [
          "normalize",
          "block",
          "inline",
          "text_join"
        ]
      },
      block: {
        rules: [
          "blockquote",
          "code",
          "fence",
          "heading",
          "hr",
          "html_block",
          "lheading",
          "list",
          "reference",
          "paragraph"
        ]
      },
      inline: {
        rules: [
          "autolink",
          "backticks",
          "emphasis",
          "entity",
          "escape",
          "html_inline",
          "image",
          "link",
          "newline",
          "text"
        ],
        rules2: [
          "balance_pairs",
          "emphasis",
          "fragments_join"
        ]
      }
    }
  }), Ao;
}
var wo, Na;
function FG() {
  if (Na) return wo;
  Na = 1;
  var e = xe(), t = Oj(), n = Fj(), s = jj(), r = oG(), o = vG(), c = xG(), i = gu(), a = IG, l = {
    default: NG(),
    zero: LG(),
    commonmark: OG()
  }, u = /^(vbscript|javascript|file|data):/, f = /^data:image\/(gif|png|jpeg|webp);/;
  function d(v) {
    var k = v.trim().toLowerCase();
    return u.test(k) ? !!f.test(k) : !0;
  }
  var h = ["http:", "https:", "mailto:"];
  function m(v) {
    var k = i.parse(v, !0);
    if (k.hostname && (!k.protocol || h.indexOf(k.protocol) >= 0))
      try {
        k.hostname = a.toASCII(k.hostname);
      } catch {
      }
    return i.encode(i.format(k));
  }
  function x(v) {
    var k = i.parse(v, !0);
    if (k.hostname && (!k.protocol || h.indexOf(k.protocol) >= 0))
      try {
        k.hostname = a.toUnicode(k.hostname);
      } catch {
      }
    return i.decode(i.format(k), i.decode.defaultChars + "%");
  }
  function A(v, k) {
    if (!(this instanceof A))
      return new A(v, k);
    k || e.isString(v) || (k = v || {}, v = "default"), this.inline = new o(), this.block = new r(), this.core = new s(), this.renderer = new n(), this.linkify = new c(), this.validateLink = d, this.normalizeLink = m, this.normalizeLinkText = x, this.utils = e, this.helpers = e.assign({}, t), this.options = {}, this.configure(v), k && this.set(k);
  }
  return A.prototype.set = function(v) {
    return e.assign(this.options, v), this;
  }, A.prototype.configure = function(v) {
    var k = this, b;
    if (e.isString(v) && (b = v, v = l[b], !v))
      throw new Error('Wrong `markdown-it` preset "' + b + '", check name');
    if (!v)
      throw new Error("Wrong `markdown-it` preset, can't be empty");
    return v.options && k.set(v.options), v.components && Object.keys(v.components).forEach(function(p) {
      v.components[p].rules && k[p].ruler.enableOnly(v.components[p].rules), v.components[p].rules2 && k[p].ruler2.enableOnly(v.components[p].rules2);
    }), this;
  }, A.prototype.enable = function(v, k) {
    var b = [];
    Array.isArray(v) || (v = [v]), ["core", "block", "inline"].forEach(function(E) {
      b = b.concat(this[E].ruler.enable(v, !0));
    }, this), b = b.concat(this.inline.ruler2.enable(v, !0));
    var p = v.filter(function(E) {
      return b.indexOf(E) < 0;
    });
    if (p.length && !k)
      throw new Error("MarkdownIt. Failed to enable unknown rule(s): " + p);
    return this;
  }, A.prototype.disable = function(v, k) {
    var b = [];
    Array.isArray(v) || (v = [v]), ["core", "block", "inline"].forEach(function(E) {
      b = b.concat(this[E].ruler.disable(v, !0));
    }, this), b = b.concat(this.inline.ruler2.disable(v, !0));
    var p = v.filter(function(E) {
      return b.indexOf(E) < 0;
    });
    if (p.length && !k)
      throw new Error("MarkdownIt. Failed to disable unknown rule(s): " + p);
    return this;
  }, A.prototype.use = function(v) {
    var k = [this].concat(Array.prototype.slice.call(arguments, 1));
    return v.apply(v, k), this;
  }, A.prototype.parse = function(v, k) {
    if (typeof v != "string")
      throw new Error("Input data should be a String");
    var b = new this.core.State(v, this, k);
    return this.core.process(b), b.tokens;
  }, A.prototype.render = function(v, k) {
    return k = k || {}, this.renderer.render(this.parse(v, k), this.options, k);
  }, A.prototype.parseInline = function(v, k) {
    var b = new this.core.State(v, this, k);
    return b.inlineMode = !0, this.core.process(b), b.tokens;
  }, A.prototype.renderInline = function(v, k) {
    return k = k || {}, this.renderer.render(this.parseInline(v, k), this.options, k);
  }, wo = A, wo;
}
var So, La;
function qG() {
  return La || (La = 1, So = FG()), So;
}
var PG = qG();
const BG = /* @__PURE__ */ ic(PG), $G = /* @__PURE__ */ _t({
  name: "VueMarkdown",
  props: {
    source: {
      type: String,
      required: !0
    },
    options: {
      type: Object,
      required: !1
    },
    plugins: {
      type: Array,
      required: !1
    }
  },
  setup(e) {
    const t = Je(new BG(e.options ?? {}));
    for (const s of e.plugins ?? [])
      t.value.use(s);
    const n = nt(() => t.value.render(e.source));
    return () => Gl("div", { innerHTML: n.value });
  }
}), zG = {
  key: 0,
  class: "chat-message-actions"
}, UG = {
  key: 2,
  class: "chat-message-files"
}, $o = /* @__PURE__ */ _t({
  __name: "Message",
  props: {
    message: {}
  },
  setup(e, { expose: t }) {
    const n = e;
    Lt.registerLanguage("javascript", ru), Lt.registerLanguage("typescript", rg), Lt.registerLanguage("python", ng), Lt.registerLanguage("xml", ou), Lt.registerLanguage("bash", tg);
    const { message: s } = Lf(n), { options: r } = ns(), o = Je(null), c = Je({}), i = nt(() => s.value.text || "&lt;Empty response&gt;"), a = nt(() => ({
      "chat-message-from-user": s.value.sender === "user",
      "chat-message-from-bot": s.value.sender === "bot",
      "chat-message-transparent": s.value.transparent === !0
    })), l = (m) => {
      m.use(ig, {
        attrs: {
          target: "_blank",
          rel: "noopener"
        }
      });
    }, u = () => {
      var m;
      (m = o.value) != null && m.scrollIntoView && o.value.scrollIntoView({
        block: "start"
      });
    }, f = {
      highlight(m, x) {
        if (x && Lt.getLanguage(x))
          try {
            return Lt.highlight(m, { language: x }).value;
          } catch {
          }
        return "";
      }
    }, d = { ...(r == null ? void 0 : r.messageComponents) ?? {} };
    t({ scrollToView: u });
    const h = async (m) => await new Promise((x, A) => {
      const v = new FileReader();
      v.onload = () => x(v.result), v.onerror = A, v.readAsDataURL(m);
    });
    return Xt(async () => {
      if (s.value.files)
        for (const m of s.value.files)
          try {
            const x = await h(m);
            c.value[m.name] = x;
          } catch (x) {
            console.error("Error reading file:", x);
          }
    }), (m, x) => (Q(), ge("div", {
      ref_key: "messageContainer",
      ref: o,
      class: Tn(["chat-message", a.value])
    }, [
      m.$slots.beforeMessage ? (Q(), ge("div", zG, [
        Kt(m.$slots, "beforeMessage", Rc(Hl({ message: de(s) })))
      ])) : lt("", !0),
      Kt(m.$slots, "default", {}, () => [
        de(s).type === "component" && d[de(s).key] ? (Q(), Fe(rh(d[de(s).key]), Rc(oc({ key: 0 }, de(s).arguments)), null, 16)) : (Q(), Fe(de($G), {
          key: 1,
          class: "chat-message-markdown",
          source: i.value,
          options: f,
          plugins: [l]
        }, null, 8, ["source", "plugins"])),
        (de(s).files ?? []).length > 0 ? (Q(), ge("div", UG, [
          (Q(!0), ge(Ve, null, ws(de(s).files ?? [], (A) => (Q(), ge("div", {
            key: A.name,
            class: "chat-message-file"
          }, [
            Se(cu, {
              file: A,
              "is-removable": !1,
              "is-previewable": !0
            }, null, 8, ["file"])
          ]))), 128))
        ])) : lt("", !0)
      ])
    ], 2));
  }
}), HG = /* @__PURE__ */ _t({
  __name: "MessageTyping",
  props: {
    animation: { default: "bouncing" }
  },
  setup(e) {
    const t = e, n = {
      id: "typing",
      text: "",
      sender: "bot"
    }, s = Je(), r = nt(() => ({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      "chat-message-typing": !0,
      [`chat-message-typing-animation-${t.animation}`]: !0
    }));
    return Xt(() => {
      var o;
      (o = s.value) == null || o.scrollToView();
    }), (o, c) => (Q(), Fe(de($o), {
      ref_key: "messageContainer",
      ref: s,
      class: Tn(r.value),
      message: n,
      "data-test-id": "chat-message-typing"
    }, {
      default: Rt(() => c[0] || (c[0] = [
        Ee("div", { class: "chat-message-typing-body" }, [
          Ee("span", { class: "chat-message-typing-circle" }),
          Ee("span", { class: "chat-message-typing-circle" }),
          Ee("span", { class: "chat-message-typing-circle" })
        ], -1)
      ])),
      _: 1
    }, 8, ["class"]));
  }
}), VG = {
  key: 0,
  class: "empty-container"
}, jG = {
  class: "empty",
  "data-test-id": "chat-messages-empty"
}, GG = {
  key: 1,
  class: "chat-messages-list"
}, KG = /* @__PURE__ */ _t({
  __name: "MessagesList",
  props: {
    messages: {},
    emptyText: {}
  },
  setup(e) {
    const t = ac(), n = Je([]), { initialMessages: s, waitingForResponse: r } = t;
    return bs(
      () => n.value.length,
      () => {
        const o = n.value[n.value.length - 1];
        o && o.scrollToView();
      }
    ), (o, c) => {
      const i = Lc("N8nIcon"), a = Lc("N8nText");
      return o.emptyText && de(s).length === 0 && o.messages.length === 0 ? (Q(), ge("div", VG, [
        Ee("div", jG, [
          Se(i, {
            icon: "comment",
            size: "large",
            class: "emptyIcon"
          }),
          Se(a, {
            tag: "p",
            size: "medium",
            color: "text-base"
          }, {
            default: Rt(() => [
              Us(fn(o.emptyText), 1)
            ]),
            _: 1
          })
        ])
      ])) : (Q(), ge("div", GG, [
        (Q(!0), ge(Ve, null, ws(de(s), (l) => (Q(), Fe($o, {
          key: l.id,
          message: l
        }, null, 8, ["message"]))), 128)),
        (Q(!0), ge(Ve, null, ws(o.messages, (l) => (Q(), Fe($o, {
          key: l.id,
          ref_for: !0,
          ref_key: "messageComponents",
          ref: n,
          message: l
        }, {
          beforeMessage: Rt(({ message: u }) => [
            Kt(o.$slots, "beforeMessage", oc({ ref_for: !0 }, { message: u }))
          ]),
          _: 2
        }, 1032, ["message"]))), 128)),
        de(r) ? (Q(), Fe(HG, { key: 0 })) : lt("", !0)
      ]));
    };
  }
}), ZG = { class: "chat-heading" }, WG = ["title"], JG = { key: 0 }, Tu = /* @__PURE__ */ _t({
  __name: "Chat",
  setup(e) {
    const { t } = js(), n = ac(), { messages: s, currentSessionId: r } = n, { options: o } = ns(), c = nt(() => o.mode === "window" && o.showWindowCloseButton);
    async function i() {
      n.startNewSession && (n.startNewSession(), Sn(() => {
        ot.emit("scrollToBottom");
      }));
    }
    async function a() {
      n.loadPreviousSession && (await n.loadPreviousSession(), Sn(() => {
        ot.emit("scrollToBottom");
      }));
    }
    function l() {
      ot.emit("close");
    }
    return Xt(async () => {
      await a(), !o.showWelcomeScreen && !r.value && await i();
    }), (u, f) => (Q(), Fe(eg, { class: "chat-wrapper" }, {
      header: Rt(() => [
        Ee("div", ZG, [
          Ee("h1", null, fn(de(t)("title")), 1),
          c.value ? (Q(), ge("button", {
            key: 0,
            class: "chat-close-button",
            title: de(t)("closeButtonTooltip"),
            onClick: l
          }, [
            Se(de(ep), {
              height: "18",
              width: "18"
            })
          ], 8, WG)) : lt("", !0)
        ]),
        de(t)("subtitle") ? (Q(), ge("p", JG, fn(de(t)("subtitle")), 1)) : lt("", !0)
      ]),
      footer: Rt(() => [
        de(r) ? (Q(), Fe(Jp, { key: 0 })) : (Q(), Fe(lp, { key: 1 }))
      ]),
      default: Rt(() => [
        !de(r) && de(o).showWelcomeScreen ? (Q(), Fe(np, {
          key: 0,
          "onClick:button": i
        })) : (Q(), Fe(KG, {
          key: 1,
          messages: de(s)
        }, null, 8, ["messages"]))
      ]),
      _: 1
    }));
  }
}), YG = {
  viewBox: "0 0 24 24",
  width: "1.2em",
  height: "1.2em"
};
function XG(e, t) {
  return Q(), ge("svg", YG, t[0] || (t[0] = [
    Ee("path", {
      fill: "currentColor",
      d: "M12 3c5.5 0 10 3.58 10 8s-4.5 8-10 8c-1.24 0-2.43-.18-3.53-.5C5.55 21 2 21 2 21c2.33-2.33 2.7-3.9 2.75-4.5C3.05 15.07 2 13.13 2 11c0-4.42 4.5-8 10-8"
    }, null, -1)
  ]));
}
const QG = { name: "mdi-chat", render: XG }, e7 = {
  viewBox: "0 0 24 24",
  width: "1.2em",
  height: "1.2em"
};
function t7(e, t) {
  return Q(), ge("svg", e7, t[0] || (t[0] = [
    Ee("path", {
      fill: "currentColor",
      d: "M7.41 8.58L12 13.17l4.59-4.59L18 10l-6 6l-6-6z"
    }, null, -1)
  ]));
}
const n7 = { name: "mdi-chevron-down", render: t7 }, s7 = { class: "chat-window-wrapper" }, r7 = { class: "chat-window" }, o7 = /* @__PURE__ */ _t({
  __name: "ChatWindow",
  setup(e) {
    const t = Je(!1);
    function n() {
      t.value = !t.value, t.value && Sn(() => {
        ot.emit("scrollToBottom");
      });
    }
    return (s, r) => (Q(), ge("div", s7, [
      Se(Wc, { name: "chat-window-transition" }, {
        default: Rt(() => [
          ul(Ee("div", r7, [
            Se(Tu)
          ], 512), [
            [sd, t.value]
          ])
        ]),
        _: 1
      }),
      Ee("div", {
        class: "chat-window-toggle",
        onClick: n
      }, [
        Se(Wc, {
          name: "chat-window-toggle-transition",
          mode: "out-in"
        }, {
          default: Rt(() => [
            t.value ? (Q(), Fe(de(n7), {
              key: 1,
              height: "32",
              width: "32"
            })) : (Q(), Fe(de(QG), {
              key: 0,
              height: "32",
              width: "32"
            }))
          ]),
          _: 1
        })
      ])
    ]));
  }
}), c7 = /* @__PURE__ */ _t({
  __name: "App",
  props: {},
  setup(e) {
    const { options: t } = ns(), n = nt(() => t.mode === "fullscreen");
    return Xt(() => {
      Lt.registerLanguage("xml", ou), Lt.registerLanguage("javascript", ru);
    }), (s, r) => n.value ? (Q(), Fe(de(Tu), {
      key: 0,
      class: "n8n-chat"
    })) : (Q(), Fe(de(o7), {
      key: 1,
      class: "n8n-chat"
    }));
  }
});
function i7(e) {
  var r, o;
  const t = {
    ...On,
    ...e,
    webhookConfig: {
      ...On.webhookConfig,
      ...e == null ? void 0 : e.webhookConfig
    },
    i18n: {
      ...On.i18n,
      ...e == null ? void 0 : e.i18n,
      en: {
        ...(r = On.i18n) == null ? void 0 : r.en,
        ...(o = e == null ? void 0 : e.i18n) == null ? void 0 : o.en
      }
    },
    theme: {
      ...On.theme,
      ...e == null ? void 0 : e.theme
    }
  }, n = t.target ?? Td;
  typeof n == "string" && Bd(n);
  const s = Ad(c7);
  return s.use($d, t), s.mount(n), s;
}
export {
  i7 as createChat
};
