/*! js-cookie v3.0.5 | MIT */
function e(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t];
    for (var n in r) e[n] = r[n];
  }
  return e;
}
var t = (function t(r, n) {
  function o(t, o, i) {
    if ('undefined' != typeof document) {
      'number' == typeof (i = e({}, n, i)).expires &&
        (i.expires = new Date(Date.now() + 864e5 * i.expires)),
        i.expires && (i.expires = i.expires.toUTCString()),
        (t = encodeURIComponent(t)
          .replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent)
          .replace(/[()]/g, escape));
      var c = '';
      for (var u in i)
        i[u] &&
          ((c += '; ' + u), !0 !== i[u] && (c += '=' + i[u].split(';')[0]));
      return (document.cookie = t + '=' + r.write(o, t) + c);
    }
  }
  return Object.create(
    {
      set: o,
      get: function (e) {
        if ('undefined' != typeof document && (!arguments.length || e)) {
          for (
            var t = document.cookie ? document.cookie.split('; ') : [],
              n = {},
              o = 0;
            o < t.length;
            o++
          ) {
            var i = t[o].split('='),
              c = i.slice(1).join('=');
            try {
              var u = decodeURIComponent(i[0]);
              if (((n[u] = r.read(c, u)), e === u)) break;
            } catch (e) {}
          }
          return e ? n[e] : n;
        }
      },
      remove: function (t, r) {
        o(t, '', e({}, r, { expires: -1 }));
      },
      withAttributes: function (r) {
        return t(this.converter, e({}, this.attributes, r));
      },
      withConverter: function (r) {
        return t(e({}, this.converter, r), this.attributes);
      },
    },
    {
      attributes: { value: Object.freeze(n) },
      converter: { value: Object.freeze(r) },
    },
  );
})(
  {
    read: function (e) {
      return (
        '"' === e[0] && (e = e.slice(1, -1)),
        e.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent)
      );
    },
    write: function (e) {
      return encodeURIComponent(e).replace(
        /%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g,
        decodeURIComponent,
      );
    },
  },
  { path: '/' },
);
export { t as default };
