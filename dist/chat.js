"use strict";

function isUIDInArray(e, i) {
  for (var n = e.length - 1; n >= 0; n--) {
    if (e[n].UID === i) return !0;
  }return !1;
}function removeUIDFromArray(e, i) {
  for (var n = e.length - 1; n >= 0; n--) {
    e[n].UID === i && e.splice(n, 1);
  }
}function clearReceivedCheckTimer() {
  receivedCheckTimer && (clearInterval(receivedCheckTimer), receivedCheckTimer = null);
}function clearTimeoutEndTimer() {
  timeoutEndTimer && clearTimeout(timeoutEndTimer);
}function clientResponded(e) {
  removeUIDFromArray(awaitingClientResponse, e);
}function awaitClientResponse(e, i, n) {
  isUIDInArray(awaitingClientResponse, e) || (awaitingClientResponse.push({ UID: e }), loopCheckIfReceived(n, e));
}function checkIfReceived(e, i) {
  if (isUIDInArray(awaitingClientResponse, i)) return !1;clearReceivedCheckTimer(), clearTimeoutEndTimer(), $(e + " p:last").last().append($('<span class="sentCheck">').html('<i class="fa fa-check"></i>'));var n = $(e);return n.scrollTop(n.prop("scrollHeight")), !0;
}function loopCheckIfReceived(e, i) {
  receivedCheckTimer || (receivedCheckTimer = setInterval(function () {
    checkIfReceived(e, i);
  }, 500), timeoutEndTimer = setTimeout(function () {
    if (clearReceivedCheckTimer(), !checkIfReceived(e, i)) {
      removeUIDFromArray(awaitingClientResponse, i);var n = "Error: Your message couldn't be delivered.";"Ita" === localLanguage && (n = "Errore: Impossibile inviare messaggio.");var s = $(e);s.append($('<p class="infoMsg">').text(n)), s.scrollTop(s.prop("scrollHeight"));
    }
  }, messageTimeout));
}function getUserName() {
  return user.google ? user.google.name : user.facebook ? user.facebook.name : "User";
}function getUserPictre() {
  return user.google ? user.google.picture : user.facebook ? user.facebook.picture : "";
}function appendMessageToChat(e, i, n) {
  var s = $("#" + e).parent().find(".messages");s.append($('<p class="' + i + '">').text(n)), s.scrollTop(s.prop("scrollHeight"));
}var sessionID = null,
    receivedCheckTimer = null,
    timeoutEndTimer = null,
    awaitingClientResponse = [],
    messageTimeout = 5e3,
    userName = getUserName(),
    userPicture = getUserPictre();$(function () {
  var e = io();e.on("sessionID", function (i) {
    i.id ? (sessionID = i.id, e.emit("updateOnline", { uniqueID: user._id, name: userName, picture: userPicture, socketID: sessionID, lat: user.lat, lng: user.lng })) : console.log("Error: Could not retrive ID");
  }), $("body").on("submit", "form", function (i) {
    i.preventDefault();var n = $(".m", this).val();if (n) {
      var s = this.getAttribute("data-pmid"),
          r = this.getAttribute("data-pmuid"),
          t = $(this).parent().find(".chatUserName").text(),
          a = "#" + s;$(a).find(".sentCheck").remove(), appendMessageToChat(r, "sentMessage", n), awaitClientResponse(r, user._id, a), e.emit("PM", r, n, { name: userName, picture: userPicture, id: sessionID, uniqueID: user._id, lat: user.lat, lng: user.lng });var o = "ChatHistoryCookie " + r,
          u = Cookies.getJSON(o) || "";u = u.history || "", u += '<p class="sentMessage">' + n, Cookies.set(o, { name: t, history: u }, { expires: 7 }), n = "", $(".m", this).val(n);
    }
  }), e.on("PMsg", function (i, n) {
    if (openChatWindow(n.name, n.picture, n.id, n.uniqueID, n.lat, n.lng, !1, !1), isChatAlreadyOpen(n.uniqueID)) appendMessageToChat(n.uniqueID, "receivedMessage", i);else if (!isUniqueIDInArray(hasUnreadMessages, n.uniqueID)) {
      var s = '<span ng-if="contact.unreadMessages" class="glyphicon glyphicon-envelope unread"></span>';$("[data-contactUID=" + n.uniqueID + "]").append(s), $("#contactsSpan").append(s), hasUnreadMessages.push({ uniqueID: n.uniqueID });
    }var r = "ChatHistoryCookie " + n.uniqueID,
        t = Cookies.getJSON(r) || "";t = t.history || "", t += '<p class="receivedMessage">' + i, Cookies.set(r, { name: n.name, history: t }, { expires: 7 }), document.hasFocus() || new Audio("audio/notification.mp3").play(), e.emit("received", n.id, user._id);
  }), e.on("receivedOK", function (e) {
    clientResponded(e);
  }), e.on("logoutEveryClient", function () {
    window.location.href = "/logout";
  }), setInterval(function () {
    isUniqueIDInArray(usersOnline, user._id) || e.emit("updateOnline", { uniqueID: user._id, name: userName, picture: userPicture, socketID: sessionID, lat: user.lat, lng: user.lng });
  }, 12e3);
});