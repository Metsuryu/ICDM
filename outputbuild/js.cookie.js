"use strict";

var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _typeof = "function" == typeof Symbol && "symbol" == _typeof2(Symbol.iterator) ? function (e) {
  return typeof e === "undefined" ? "undefined" : _typeof2(e);
} : function (e) {
  return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e === "undefined" ? "undefined" : _typeof2(e);
};!function (e) {
  var o = !1;if ("function" == typeof define && define.amd && (define(e), o = !0), "object" === ("undefined" == typeof exports ? "undefined" : _typeof(exports)) && (module.exports = e(), o = !0), !o) {
    var t = window.Cookies,
        n = window.Cookies = e();n.noConflict = function () {
      return window.Cookies = t, n;
    };
  }
}(function () {
  function e() {
    for (var e = 0, o = {}; e < arguments.length; e++) {
      var t = arguments[e];for (var n in t) {
        o[n] = t[n];
      }
    }return o;
  }function o(t) {
    function n(o, r, i) {
      var c;if ("undefined" != typeof document) {
        if (arguments.length > 1) {
          if (i = e({ path: "/" }, n.defaults, i), "number" == typeof i.expires) {
            var f = new Date();f.setMilliseconds(f.getMilliseconds() + 864e5 * i.expires), i.expires = f;
          }i.expires = i.expires ? i.expires.toUTCString() : "";try {
            c = JSON.stringify(r), /^[\{\[]/.test(c) && (r = c);
          } catch (e) {}r = t.write ? t.write(r, o) : encodeURIComponent(String(r)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent), o = encodeURIComponent(String(o)), o = o.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent), o = o.replace(/[\(\)]/g, escape);var p = "";for (var s in i) {
            i[s] && (p += "; " + s, !0 !== i[s] && (p += "=" + i[s]));
          }return document.cookie = o + "=" + r + p;
        }o || (c = {});for (var u = document.cookie ? document.cookie.split("; ") : [], a = 0; a < u.length; a++) {
          var d = u[a].split("="),
              l = d.slice(1).join("=");'"' === l.charAt(0) && (l = l.slice(1, -1));try {
            var y = d[0].replace(/(%[0-9A-Z]{2})+/g, decodeURIComponent);if (l = t.read ? t.read(l, y) : t(l, y) || l.replace(/(%[0-9A-Z]{2})+/g, decodeURIComponent), this.json) try {
              l = JSON.parse(l);
            } catch (e) {}if (o === y) {
              c = l;break;
            }o || (c[y] = l);
          } catch (e) {}
        }return c;
      }
    }return n.set = n, n.get = function (e) {
      return n.call(n, e);
    }, n.getJSON = function () {
      return n.apply({ json: !0 }, [].slice.call(arguments));
    }, n.defaults = {}, n.remove = function (o, t) {
      n(o, "", e(t, { expires: -1 }));
    }, n.withConverter = o, n;
  }return o(function () {});
});