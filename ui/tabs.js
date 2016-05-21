/*
 * tabs.js
 *
 * This file contains all of the code immediately relevant to the tabs in the
 * browser UI.
 *
 * All logic associated with updating the UI in response to an event triggered
 * by a tab is delegated to ui.js
 */

// Create a global singleton that scopes the globally exposed functions from
// this application
// eslint-disable-next-line prefer-const, no-use-before-define, no-var
var peerWeb = peerWeb || {}

// Scope all functions exposed by this file to tabs
peerWeb.tabs = peerWeb.tabs || {}

;(function scope () {
  // The closeTab function is added as an event listener to a newly created tab
  // in newTab. It listens for a click event on the close-tab button of a tab,
  // and removes the tab and it's dependencies from the browser.
  peerWeb.tabs.closeTab = function closeTab (e) {
    // Get the id of the tab we are closing. The tab id will be set as the
    // CSS id of the parent element of the close icon on the tab.
    const id = peerWeb.utils.getId(e.target.parentElement)
    peerWeb.ui.remove(id)
  }

  // tabClick is registered as an event listener on every tab. Its purpose
  // is to determine if a click event represents a user trying to click on a
  // tab. If the click was meant to go to the tab, then the work is passed off
  // to the claimOwnership function from ownership.js to handle updating the
  // browser accordingly.
  peerWeb.tabs.tabClick = function tabClick (e) {
    // Get the target DOM element of the event
    let target = e.target

    // Make sure the user wasn't trying to close the tab
    if (target.className === 'close-tab') {
      return null
    }

    // If the user clicked on 'tab-name' then they were clicking on the tab
    // itself, so select 'tab-name's parent, which is the tab container, and
    // use that as the target
    if (target.className === 'tab-name') {
      target = target.parentNode
    }

    // Get the id of the clicked tab
    const id = peerWeb.utils.getId(target)
    if (id == null) {
      // If we were unable to parse an id, there is nothing left for us to do
      // TODO: This would probably be a good place to report this error back to
      // the developers since this is an edge case that should never be reached
      return null
    }

    // Update the UI to reflect the new tab being active
    peerWeb.ui.claimOwnership(id)

    // All done!
    return null
  }

  // We use tabCount as a generator of unique IDs for the newTab function
  let tabCount = 0

  // newTab is an event listener that is wired up to the add tab button. When
  // clicked, it delegates a majority of its work to peerWeb.ui.add, and simply
  // keeps track of the tabCount UID generator.
  peerWeb.tabs.newTab = function newTab () {
    peerWeb.ui.add(tabCount++)
  }
})()
