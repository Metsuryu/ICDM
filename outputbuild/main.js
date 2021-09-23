"use strict";
function setOpenWindwosLimit() {
  var t = $(window).width(),
      n = Math.floor((t - 200) / 265);openChatWindowsLimit = n < 2 ? 1 : n;
}function getDistanceGoogleAPI(t, n, a, i) {
  new google.maps.DistanceMatrixService().getDistanceMatrix({ origins: [t], destinations: [n], travelMode: "DRIVING" }, function (t, n) {
    if ("OK" === n) {
      var e = t.rows[0].elements[0];if ("OK" === e.status) {
        var s = e.distance.text;a(s, i);
      }
    }
  });
}function deg2rad(t) {
  return t * (Math.PI / 180);
}function getDistanceFromLatLonInKm(t, n, a, i) {
  var e = deg2rad(a - t),
      s = deg2rad(i - n),
      o = Math.sin(e / 2) * Math.sin(e / 2) + Math.cos(deg2rad(t)) * Math.cos(deg2rad(a)) * Math.sin(s / 2) * Math.sin(s / 2);return 2 * Math.atan2(Math.sqrt(o), Math.sqrt(1 - o)) * 6371;
}function minimizeChatWindow(t) {
  t.animate({ height: "2em" }, 100, function () {
    t.attr("data-min", "true");
  }), t.find(".chatSettings").toggle();
}function maximizeChatWindow(t) {
  t.animate({ height: "340px" }, 100, function () {
    t.attr("data-min", "false");
  }), t.find(".chatSettings").toggle();
}function positionChatWindow(t, n) {
  var a = 200;isMobile && (a = 0);var i = 265 * n + (a + 5);t.css("right", i + "px");
}function slideChatWindows(t) {
  for (var n = parseInt(t) + 1, a = parseInt(t) - 1, i = n; i <= openChatWindows + 1; i++) {
    var e = $("#" + i);positionChatWindow(e, a), a += 1, e.attr("id", a);
  }
}function isChatAlreadyOpen(t) {
  return !!$("#" + t).length;
}function openNewChatWindow(t, n, a, i, e, s, o, r) {
  n || (n = "/img/noPic.jpg");var c = openChatWindows + 1,
      d = "#" + i,
      l = "",
      h = "",
      p = $('\n<div id="" class="chatWindow" data-min="false">\n    <div id="" class="chatWindowHeader">\n        <span class="chatUserName">User</span>\n        <span class="chatCloseButton">x</span>\n        <span class="fa fa-cog chatSettings"></span>\n    </div>\n    <ul class="messages"></ul>\n    <form class="chatForm" action="">\n        <input class="m" autocomplete="off" placeholder="Type something and press enter." />\n    </form>\n</div>\t\n\t ');p.find(".chatUserName").html(t), p.find(".chatForm").attr("data-pmid", a), p.find(".chatForm").attr("data-pmuid", i), p.find(".chatWindowHeader").attr("id", i), p.find(".messages").attr("id", a), p.attr("id", c), o && p.find(".m").attr("disabled", "disabled"), isMobile && (p.find("input").after('<span id="sendButton" class="fa fa-paper-plane"></span>'), p.find(".chatForm").addClass("formMobile"), p.find("input").addClass("inputMobile")), "Ita" === localLanguage ? (h = "Distanza", l = "Sconosciuta <a target='_blank' href='/faqita#distance'>(?)</a>", p.find("input").attr("placeholder", "Digita qualcosa e premi invio.")) : (h = "Distance", l = "Unknown <a target='_blank' href='/faq#distance'>(?)</a>"), positionChatWindow(p, openChatWindows), $("body").append(p), r && p.find("input").focus(), openChatWindows += 1;for (var u = hasUnreadMessages.length - 1; u >= 0; u--) {
    hasUnreadMessages[u].uniqueID === i && hasUnreadMessages.splice(u, 1);
  }$("[data-contactUID=" + i + "]").find($("span")).remove(), 0 === hasUnreadMessages.length && $("#contactsSpan").find($("span")).remove();var f = '<img class="profilePic" src="' + n + '">',
      g = "",
      m = "ChatHistoryCookie " + i,
      v = Cookies.getJSON(m) || "";if (v = v.history || "", $(p).find(".messages").html(v + "<br>"), !e && !s || !user.lat && !user.lng) g = l, o || $(p).find(".messages").append($('<div class="infoMsg">').html(f + "<p>" + h + ": <span id='distanceSpan'>" + g + "</span> </p>"));else {
    var w = function w(t, n) {
      $(n).find("#distanceSpan").text(t);
    };g = getDistanceFromLatLonInKm(user.lat, user.lng, e, s).toFixed(2) + " Km", o || $(p).find(".messages").append($('<div class="infoMsg">').html(f + "<p>" + h + ": <span id='distanceSpan'>" + g + "</span> </p>")), getDistanceGoogleAPI(new google.maps.LatLng(user.lat, user.lng), new google.maps.LatLng(e, s), w, d);
  }var C = $(d).parent().find(".messages");$(C).scrollTop(C.prop("scrollHeight"));
}function openChatWindow(t, n, a, i, e, s, o, r) {
  if (isChatAlreadyOpen(i)) {
    if (r) {
      var c = $("#" + i).parent(),
          d = c.attr("data-min");"false" === d ? c.find("input").focus() : "true" === d && (maximizeChatWindow(c), c.find("input").focus());
    }
  } else {
    if (openChatWindows >= openChatWindowsLimit) {
      if (!r) return;closeAllOpenChatWindows();
    }openNewChatWindow(t, n, a, i, e, s, o, r);
  }
}function closeAllOpenChatWindows() {
  $(".chatWindow").remove(), openChatWindows = 0;
}function removeFBUrlHash() {
  "#_=_" == window.location.hash && (history.replaceState ? history.replaceState(null, null, window.location.href.split("#")[0]) : window.location.hash = "");
}var contactsMinimized = !1,
    usersOnlineNumber = "",
    openChatWindowsLimit = 1;setOpenWindwosLimit();var openChatWindows = 0,
    hasUnreadMessages = [],
    app = angular.module("ICDM", []);app.controller("ctrl", ["$scope", "$http", "$interval", function (t, n, a) {
  function i() {
    sessionID ? t.ssID = sessionID : a(i, 1e3);
  }function e() {
    user._id ? t.uID = user._id : a(e, 1e3);
  }function s() {
    var n = [],
        a = Cookies.get();for (var i in a) {
      if (i.startsWith("ChatHistoryCookie ")) {
        var e = i.substring("ChatHistoryCookie ".length),
            s = Cookies.getJSON(i);s.UID = e, n.push(s);
      }
    }t.historyList = n;
  }function o() {
    n({ url: "/contacts", method: "GET" }).then(function (n) {
      for (var a = n.data, i = a.length - 1; i >= 0; i--) {
        for (var e = hasUnreadMessages.length - 1; e >= 0; e--) {
          a[i].uniqueID === hasUnreadMessages[e].uniqueID && (a[i].unreadMessages = !0);
        }
      }t.contactsListGET = a, usersOnline = t.contactsListGET, t.usersOnlineNumber = usersOnline.length.toString();
    });
  }i(), e(), o(), s(), a(o, 1e4), a(s, 6e4);
}]), $(document).ready(function () {
  function t() {
    contactsMinimized ? ($("#searchField").removeClass("searchFieldMinimized"), $("#contactsBox").css("padding-bottom", "4em"), $("#contactsBox").css("overflow", "initial"), $("#contactsBox").animate({ height: "50%" }, 100, function () {
      contactsMinimized = !1;
    })) : ($("#searchField").addClass("searchFieldMinimized"), $("#contactsBox").css("padding-bottom", "0"), $("#contactsBox").css("overflow", "hidden"), isMobile ? $("#contactsBox").animate({ height: "2em" }, 100, function () {
      contactsMinimized = !0;
    }) : $("#contactsBox").animate({ height: "1.5em" }, 100, function () {
      contactsMinimized = !0;
    }));
  }isMobile && !contactsMinimized && t(), removeFBUrlHash(), $("body").on("click", "#sendButton", function (t) {
    var n = $(t.target).parent().find("input");n.focus(), n.submit();
  }), $("#contactsBox").on("click", ".contactClass", function (t) {
    var n = t.target,
        a = n.innerText,
        i = n.getAttribute("data-contactid"),
        e = n.getAttribute("data-contactUID");openChatWindow(a, n.getAttribute("data-contactPicture"), i, e, Number(n.getAttribute("data-contactLat")), Number(n.getAttribute("data-contactLng")), n.getAttribute("data-history"), !0);
  }), $("body").on("click", ".chatCloseButton", function (t) {
    var n = $(t.target).parent().parent(),
        a = n.attr("id");n.remove(), 1 + (openChatWindows -= 1) > a && slideChatWindows(a);
  }), $("body").on("click", ".chatSettings", function (t) {
    var n = $(t.target),
        a = "Delete chat history";"Ita" === localLanguage && (a = "Elimina cronologia");var i = $('\t\t\t<div class="settings">\t\t\t<p> <span class="fa fa-trash-o"></span> ' + a + "</p> </div>");n.find(".settings").length ? n.find(".settings").remove() : n.append(i);
  }), $("body").on("click", ".settings", function (t) {
    var n = $(t.target).parent().parent();n.find(".settings").remove();var a = "Delete chat history?\nBy doing so, you will only delete the chat history saved on this device.";if ("Ita" === localLanguage && (a = "Eliminare la cronologia?\nLa cronologia verrà eliminata solo sul tuo dispositivo."), confirm(a)) {
      var i = n.parent().parent(),
          e = i.find(".chatForm").attr("data-pmuid"),
          s = "ChatHistoryCookie " + e;Cookies.remove(s), i.find(".messages").empty();
    }
  }), $("body").on("click", ".chatWindowHeader", function (t) {
    var n = $(t.target).parent(),
        a = (n.attr("id"), n.attr("data-min"));"false" === a ? minimizeChatWindow(n) : "true" === a && maximizeChatWindow(n);
  }), $("#contactsHandle").click(function () {
    t();
  }), $("#onlineTab").click(function () {
    $("#contactsList").toggle();
  }), $("#offlineTab").click(function () {
    $("#offlineList").toggle();
  });
});