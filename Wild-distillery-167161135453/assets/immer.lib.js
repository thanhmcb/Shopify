/* esm.sh - esbuild bundle(immer@10.0.2) es2022 production */
var V = Symbol.for('immer-nothing'),
  R = Symbol.for('immer-draftable'),
  a = Symbol.for('immer-state');
function u(e, ...t) {
  throw new Error(
    `[Immer] minified error nr: ${e}. Full error at: https://bit.ly/3cXEKWf`,
  );
}
var h = Object.getPrototypeOf;
function y(e) {
  return !!e && !!e[a];
}
function p(e) {
  return e
    ? B(e) || Array.isArray(e) || !!e[R] || !!e.constructor?.[R] || z(e) || S(e)
    : !1;
}
var q = Object.prototype.constructor.toString();
function B(e) {
  if (!e || typeof e != 'object') return !1;
  let t = h(e);
  if (t === null) return !0;
  let r = Object.hasOwnProperty.call(t, 'constructor') && t.constructor;
  return r === Object
    ? !0
    : typeof r == 'function' && Function.toString.call(r) === q;
}
function m(e, t) {
  v(e) === 0
    ? Object.entries(e).forEach(([r, n]) => {
        t(r, n, e);
      })
    : e.forEach((r, n) => t(n, r, e));
}
function v(e) {
  let t = e[a];
  return t ? t.type_ : Array.isArray(e) ? 1 : z(e) ? 2 : S(e) ? 3 : 0;
}
function A(e, t) {
  return v(e) === 2 ? e.has(t) : Object.prototype.hasOwnProperty.call(e, t);
}
function G(e, t, r) {
  let n = v(e);
  n === 2 ? e.set(t, r) : n === 3 ? e.add(r) : (e[t] = r);
}
function Q(e, t) {
  return e === t ? e !== 0 || 1 / e === 1 / t : e !== e && t !== t;
}
function z(e) {
  return e instanceof Map;
}
function S(e) {
  return e instanceof Set;
}
function d(e) {
  return e.copy_ || e.base_;
}
function F(e, t) {
  if (z(e)) return new Map(e);
  if (S(e)) return new Set(e);
  if (Array.isArray(e)) return Array.prototype.slice.call(e);
  if (!t && B(e))
    return h(e)
      ? {
          ...e,
        }
      : Object.assign(Object.create(null), e);
  let r = Object.getOwnPropertyDescriptors(e);
  delete r[a];
  let n = Reflect.ownKeys(r);
  for (let i = 0; i < n.length; i++) {
    let o = n[i],
      s = r[o];
    s.writable === !1 && ((s.writable = !0), (s.configurable = !0)),
      (s.get || s.set) &&
        (r[o] = {
          configurable: !0,
          writable: !0,
          enumerable: s.enumerable,
          value: e[o],
        });
  }
  return Object.create(h(e), r);
}
function I(e, t = !1) {
  return (
    O(e) ||
      y(e) ||
      !p(e) ||
      (v(e) > 1 && (e.set = e.add = e.clear = e.delete = Y),
      Object.freeze(e),
      t && m(e, (r, n) => I(n, !0), !0)),
    e
  );
}
function Y() {
  u(2);
}
function O(e) {
  return Object.isFrozen(e);
}
var Z = {};
function _(e) {
  let t = Z[e];
  return t || u(0, e), t;
}
var g;
function K() {
  return g;
}
function L(e, t) {
  return {
    drafts_: [],
    parent_: e,
    immer_: t,
    canAutoFreeze_: !0,
    unfinalizedDrafts_: 0,
  };
}
function T(e, t) {
  t &&
    (_('Patches'),
    (e.patches_ = []),
    (e.inversePatches_ = []),
    (e.patchListener_ = t));
}
function N(e) {
  M(e), e.drafts_.forEach(ee), (e.drafts_ = null);
}
function M(e) {
  e === g && (g = e.parent_);
}
function $(e) {
  return (g = L(g, e));
}
function ee(e) {
  let t = e[a];
  t.type_ === 0 || t.type_ === 1 ? t.revoke_() : (t.revoked_ = !0);
}
function U(e, t) {
  t.unfinalizedDrafts_ = t.drafts_.length;
  let r = t.drafts_[0];
  return (
    e !== void 0 && e !== r
      ? (r[a].modified_ && (N(t), u(4)),
        p(e) && ((e = P(t, e)), t.parent_ || b(t, e)),
        t.patches_ &&
          _('Patches').generateReplacementPatches_(
            r[a].base_,
            e,
            t.patches_,
            t.inversePatches_,
          ))
      : (e = P(t, r, [])),
    N(t),
    t.patches_ && t.patchListener_(t.patches_, t.inversePatches_),
    e !== V ? e : void 0
  );
}
function P(e, t, r) {
  if (O(t)) return t;
  let n = t[a];
  if (!n) return m(t, (i, o) => W(e, n, t, i, o, r), !0), t;
  if (n.scope_ !== e) return t;
  if (!n.modified_) return b(e, n.base_, !0), n.base_;
  if (!n.finalized_) {
    (n.finalized_ = !0), n.scope_.unfinalizedDrafts_--;
    let i = n.copy_,
      o = i,
      s = !1;
    n.type_ === 3 && ((o = new Set(i)), i.clear(), (s = !0)),
      m(o, (c, l) => W(e, n, i, c, l, r, s)),
      b(e, i, !1),
      r &&
        e.patches_ &&
        _('Patches').generatePatches_(n, r, e.patches_, e.inversePatches_);
  }
  return n.copy_;
}
function W(e, t, r, n, i, o, s) {
  if (y(i)) {
    let c =
        o && t && t.type_ !== 3 && !A(t.assigned_, n) ? o.concat(n) : void 0,
      l = P(e, i, c);
    if ((G(r, n, l), y(l))) e.canAutoFreeze_ = !1;
    else return;
  } else s && r.add(i);
  if (p(i) && !O(i)) {
    if (!e.immer_.autoFreeze_ && e.unfinalizedDrafts_ < 1) return;
    P(e, i), (!t || !t.scope_.parent_) && b(e, i);
  }
}
function b(e, t, r = !1) {
  !e.parent_ && e.immer_.autoFreeze_ && e.canAutoFreeze_ && I(t, r);
}
function te(e, t) {
  let r = Array.isArray(e),
    n = {
      type_: r ? 1 : 0,
      scope_: t ? t.scope_ : K(),
      modified_: !1,
      finalized_: !1,
      assigned_: {},
      parent_: t,
      base_: e,
      draft_: null,
      copy_: null,
      revoke_: null,
      isManual_: !1,
    },
    i = n,
    o = k;
  r && ((i = [n]), (o = w));
  let { revoke: s, proxy: c } = Proxy.revocable(i, o);
  return (n.draft_ = c), (n.revoke_ = s), c;
}
var k = {
    get(e, t) {
      if (t === a) return e;
      let r = d(e);
      if (!A(r, t)) return re(e, r, t);
      let n = r[t];
      return e.finalized_ || !p(n)
        ? n
        : n === D(e.base_, t)
        ? (E(e), (e.copy_[t] = x(n, e)))
        : n;
    },
    has(e, t) {
      return t in d(e);
    },
    ownKeys(e) {
      return Reflect.ownKeys(d(e));
    },
    set(e, t, r) {
      let n = j(d(e), t);
      if (n?.set) return n.set.call(e.draft_, r), !0;
      if (!e.modified_) {
        let i = D(d(e), t),
          o = i?.[a];
        if (o && o.base_ === r)
          return (e.copy_[t] = r), (e.assigned_[t] = !1), !0;
        if (Q(r, i) && (r !== void 0 || A(e.base_, t))) return !0;
        E(e), C(e);
      }
      return (
        (e.copy_[t] === r && (r !== void 0 || t in e.copy_)) ||
          (Number.isNaN(r) && Number.isNaN(e.copy_[t])) ||
          ((e.copy_[t] = r), (e.assigned_[t] = !0)),
        !0
      );
    },
    deleteProperty(e, t) {
      return (
        D(e.base_, t) !== void 0 || t in e.base_
          ? ((e.assigned_[t] = !1), E(e), C(e))
          : delete e.assigned_[t],
        e.copy_ && delete e.copy_[t],
        !0
      );
    },
    getOwnPropertyDescriptor(e, t) {
      let r = d(e),
        n = Reflect.getOwnPropertyDescriptor(r, t);
      return (
        n && {
          writable: !0,
          configurable: e.type_ !== 1 || t !== 'length',
          enumerable: n.enumerable,
          value: r[t],
        }
      );
    },
    defineProperty() {
      u(11);
    },
    getPrototypeOf(e) {
      return h(e.base_);
    },
    setPrototypeOf() {
      u(12);
    },
  },
  w = {};
m(k, (e, t) => {
  w[e] = function () {
    return (arguments[0] = arguments[0][0]), t.apply(this, arguments);
  };
});
w.deleteProperty = function (e, t) {
  return w.set.call(this, e, t, void 0);
};
w.set = function (e, t, r) {
  return k.set.call(this, e[0], t, r, e[0]);
};
function D(e, t) {
  let r = e[a];
  return (r ? d(r) : e)[t];
}
function re(e, t, r) {
  let n = j(t, r);
  return n ? ('value' in n ? n.value : n.get?.call(e.draft_)) : void 0;
}
function j(e, t) {
  if (!(t in e)) return;
  let r = h(e);
  for (; r; ) {
    let n = Object.getOwnPropertyDescriptor(r, t);
    if (n) return n;
    r = h(r);
  }
}
function C(e) {
  e.modified_ || ((e.modified_ = !0), e.parent_ && C(e.parent_));
}
function E(e) {
  e.copy_ || (e.copy_ = F(e.base_, e.scope_.immer_.useStrictShallowCopy_));
}
var ne = class {
  constructor(e) {
    (this.autoFreeze_ = !0),
      (this.useStrictShallowCopy_ = !1),
      (this.produce = (t, r, n) => {
        if (typeof t == 'function' && typeof r != 'function') {
          let o = r;
          r = t;
          let s = this;
          return function (l = o, ...J) {
            return s.produce(l, (X) => r.call(this, X, ...J));
          };
        }
        typeof r != 'function' && u(6),
          n !== void 0 && typeof n != 'function' && u(7);
        let i;
        if (p(t)) {
          let o = $(this),
            s = x(t, void 0),
            c = !0;
          try {
            (i = r(s)), (c = !1);
          } finally {
            c ? N(o) : M(o);
          }
          return T(o, n), U(i, o);
        } else if (!t || typeof t != 'object') {
          if (
            ((i = r(t)),
            i === void 0 && (i = t),
            i === V && (i = void 0),
            this.autoFreeze_ && I(i, !0),
            n)
          ) {
            let o = [],
              s = [];
            _('Patches').generateReplacementPatches_(t, i, o, s), n(o, s);
          }
          return i;
        } else u(1, t);
      }),
      (this.produceWithPatches = (t, r) => {
        if (typeof t == 'function')
          return (s, ...c) => this.produceWithPatches(s, (l) => t(l, ...c));
        let n, i;
        return [
          this.produce(t, r, (s, c) => {
            (n = s), (i = c);
          }),
          n,
          i,
        ];
      }),
      typeof e?.autoFreeze == 'boolean' && this.setAutoFreeze(e.autoFreeze),
      typeof e?.useStrictShallowCopy == 'boolean' &&
        this.setUseStrictShallowCopy(e.useStrictShallowCopy);
  }
  createDraft(e) {
    p(e) || u(8), y(e) && (e = ie(e));
    let t = $(this),
      r = x(e, void 0);
    return (r[a].isManual_ = !0), M(t), r;
  }
  finishDraft(e, t) {
    let r = e && e[a];
    (!r || !r.isManual_) && u(9);
    let { scope_: n } = r;
    return T(n, t), U(void 0, n);
  }
  setAutoFreeze(e) {
    this.autoFreeze_ = e;
  }
  setUseStrictShallowCopy(e) {
    this.useStrictShallowCopy_ = e;
  }
  applyPatches(e, t) {
    let r;
    for (r = t.length - 1; r >= 0; r--) {
      let i = t[r];
      if (i.path.length === 0 && i.op === 'replace') {
        e = i.value;
        break;
      }
    }
    r > -1 && (t = t.slice(r + 1));
    let n = _('Patches').applyPatches_;
    return y(e) ? n(e, t) : this.produce(e, (i) => n(i, t));
  }
};
function x(e, t) {
  let r = z(e)
    ? _('MapSet').proxyMap_(e, t)
    : S(e)
    ? _('MapSet').proxySet_(e, t)
    : te(e, t);
  return (t ? t.scope_ : K()).drafts_.push(r), r;
}
function ie(e) {
  return y(e) || u(10, e), H(e);
}
function H(e) {
  if (!p(e) || O(e)) return e;
  let t = e[a],
    r;
  if (t) {
    if (!t.modified_) return t.base_;
    (t.finalized_ = !0), (r = F(e, t.scope_.immer_.useStrictShallowCopy_));
  } else r = F(e, !0);
  return (
    m(r, (n, i) => {
      G(r, n, H(i));
    }),
    t && (t.finalized_ = !1),
    r
  );
}
var f = new ne(),
  oe = f.produce,
  se = f.produceWithPatches.bind(f),
  ce = f.setAutoFreeze.bind(f),
  ae = f.setUseStrictShallowCopy.bind(f),
  fe = f.applyPatches.bind(f),
  ue = f.createDraft.bind(f),
  le = f.finishDraft.bind(f);
export { oe as produce };
