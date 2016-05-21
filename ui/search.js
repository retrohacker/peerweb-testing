/*
 * search.js
 *
 * This file contains all of the code immediately relevant to the search bar
 * at the top of the page. The search bar is an overloaded term, its really
 * just the bar you type URLs into for navigation. It currently offers no
 * search.
 */

// Create a global singleton that scopes the globally exposed functions from
// this application
// eslint-disable-next-line prefer-const, no-use-before-define, no-var
var peerWeb = peerWeb || {}

// Scope all functions exposed by this file to search
peerWeb.search = peerWeb.search || {}

;(function scope () {
  // checkSubmit is an event listener for the search bar in the UI. It waits
  // until a user presses enter and then sends the user to the URL typed into
  // the search bar
  peerWeb.search.checkSubmit = function checkSubmit (e) {
    // If event is defined and the keyCode of the event is the enter key, go
    // ahead and try to send the user to the url they typed in
    if (e != null && e.keyCode === 13) {
      peerWeb.ui.navigate(e.target.value)
    }
  }
})()
