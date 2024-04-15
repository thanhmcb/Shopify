/* esm.sh - esbuild bundle(zustand@4.4.1/vanilla) es2022 production */
var u = (o) => {
    let e,
      r = new Set(),
      s = (t, i) => {
        let n = typeof t == 'function' ? t(e) : t;
        if (!Object.is(n, e)) {
          let d = e;
          (e = i ?? typeof n != 'object' ? n : Object.assign({}, e, n)),
            r.forEach((l) => l(e, d));
        }
      },
      c = () => e,
      a = {
        setState: s,
        getState: c,
        subscribe: (t) => (r.add(t), () => r.delete(t)),
        destroy: () => {
          (import.meta.env ? import.meta.env.MODE : void 0) !== 'production' &&
            console.warn(
              '[DEPRECATED] The `destroy` method will be unsupported in a future version. Instead use unsubscribe function returned by subscribe. Everything will be garbage-collected if store is garbage-collected.',
            ),
            r.clear();
        },
      };
    return (e = o(s, c, a)), a;
  },
  b = (o) => (o ? u(o) : u);
export { b as createStore };
