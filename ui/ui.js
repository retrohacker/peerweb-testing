/*
 * ui.js
 *
 * At the time of writting, this is the most meta-thinking file in this
 * directory. I suspect it may not be immediately obvious why this file exists
 * and why it is necessary.
 *
 * Essentially, in our browser, we have a state that drives the entire user
 * experience. That state is the currently selected tab. When we change tabs,
 * a majority of the UI needs to be updated to reflect the newly selected tab.
 * This includes everything from the navigation buttons to the visible webview.
 *
 * ui.js has a collection of functions which together localize all of the logic
 * behind tab operations to this file.
 */

// Create a global singleton that scopes the globally exposed functions from
// this application
// eslint-disable-next-line prefer-const, no-use-before-define, no-var
var peerWeb = peerWeb || {}

// Scope all functions exposed by this file to ui
peerWeb.ui = peerWeb.ui || {}

// Scope all functions in this file to prevent polluting the global space
;(function scope () {
  // claimOwnership will take the ID of a tab, and handle all the logic
  // necessary to update the UI showing that the tab is selected
  peerWeb.ui.claimOwnership = function claimOwnership (id) {
    // We need to fetch all of the webviews on the page, remove the CSS class
    // `selected` from any that have it set, and add the CSS class name
    // `selected` to the webview that belongs to this tab.
    const webviews = window.document.getElementsByClassName('webview')
    for (let i = 0; i < webviews.length; i++) {
      const webview = webviews[i]
      // Remove `selected` from all of the webviews, even the one that is
      // being selected. This prevents us from adding `selected` to the same
      // element multiple times.
      webview.className = peerWeb.utils.removeClass(webview, 'selected')
      // If this webview matches the id of the selected tab, add the CSS class
      // `selected` to it. The id of that webview is encoded as `webview-ID`.
      // We force id to be a string for this comparison so that we can use
      // strict equality.
      if (webview.id.split('-')[1] === id.toString()) {
        webview.className = peerWeb.utils.addClass(webview, 'selected')
      }
    }

    // Do the same thing for tabs that we did for webviews above
    const tabs = window.document.getElementsByClassName('tab')
    for (let i = 0; i < tabs.length; i++) {
      const tab = tabs[i]
      tab.className = peerWeb.utils.removeClass(tab, 'selected')
      if (tab.id.split('-') === id.toString()) {
        tab.className = peerWeb.utils.addClass('selected')
      }
    }
  }

  // remove will take the ID of a tab, and handle all the logic necessary to
  // remove the tab and it's dependencies from the UI.
  peerWeb.ui.remove = function remove (id) {
    // Lets get all of the webviews so we can find the one we need to remove
    const webviews = window.document.getElementsByTagName('webview')
    // Search through all the webviews until we find the one with the proper id
    for (let i = 0; i < webviews.length; i++) {
      const webview = webviews[i]
      // Check this webview for the id
      if (peerWeb.utils.getId(webview) === id) {
        // If this webview is the one we are looking for, simply remove it from
        // the document
        webview.remove()
        // Since we have found the webview, there is nothing left to do
        break
      }
    }

    // Now we will do the same exact thing for tabs that we did for the
    // webviews above
    const tabs = window.document.getElementsByClassName('tab')

    for (let i = 0; i < tabs.length; i++) {
      const tab = tabs[i]
      if (peerWeb.utils.getId(tab) === id) {
        // We will also need to check if this tab is the currently selected
        // one. If so, we need to switch the user to another tab before
        // deleting the one they are currently using.
        if (peerWeb.utils.hasClass('selected')) {
          // Set it to the first tab for simplicty. We may add more
          // intelligence to this in the future
          peerWeb.ui.claimOwnership(peerWeb.utils.getId(tabs[0]))
        }

        tab.remove()
        break
      }
    }
  }

  // add will take the ID of a tab, and handle all the logic necessary to
  // create a new tab with that ID and add it to the browser.
  peerWeb.ui.add = function add (id) {
    // First, we create a new tab element
    const newTabElement = window.document.createElement('span')
    const tabName = window.document.createElement('span')
    tabName.appendChild(window.document.createTextNode('New Tab'))
    tabName.className = 'tab-name'
    newTabElement.appendChild(tabName)
    newTabElement.id = `tab-${id}`
    newTabElement.className = 'tab'
    const closeTabElement = window.document.createElement('span')
    closeTabElement.appendChild(window.document.createTextNode('x'))
    closeTabElement.className = 'close-tab'
    newTabElement.appendChild(closeTabElement)

    // Next, we wire up all of the listeners for the new tab
    closeTabElement.addEventListener('click', peerWeb.tabs.closeTab)
    newTabElement.addEventListener('click', peerWeb.tabs.tabClick)

    // Next, we will create the webview that the tab will own
    const newWebViewElement = window.document.createElement('webview')
    newWebViewElement.id = `webview-${id}`

    // Finally, we add everything to the document so the user can see it
    window.document.getElementById('tab-row').appendChild(newTabElement)
    window.document.getElementById('content').appendChild(newWebViewElement)

    // Give the user something to look at for their new tab
    newWebViewElement.src = 'http://will.blankenship.io/peerweb'

    peerWeb.ui.claimOwnership(id)
  }
})()
