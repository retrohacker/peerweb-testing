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
    const webviews = window.document.getElementsByTagName('webview')
    for (let i = 0; i < webviews.length; i++) {
      const webview = webviews[i]
      // Remove `selected` from all of the webviews, even the one that is
      // being selected. This prevents us from adding `selected` to the same
      // element multiple times.
      webview.className = peerWeb.utils.removeClass(webview, 'selected')
      // If this webview matches the id of the selected tab, add the CSS class
      // `selected` to it. We force id to be a string for this comparison so
      // that we can use strict equality.
      if (peerWeb.utils.getId(webview) === id.toString()) {
        webview.className = peerWeb.utils.addClass(webview, 'selected')

        // Update the searchbar to match the webview's content
        const searchBar = window.document.getElementById('search-bar')
        searchBar.value = webview.src

        // Make the navigation buttons inactive if there is no history
        const navBack = window.document.getElementById('search-back')
        const navForward = window.document.getElementById('search-forward')
        navBack.className = peerWeb.utils.removeClass(navBack, 'inactive')
        navForward
          .className = peerWeb.utils.removeClass(navForward, 'inactive')
        navBack.className = peerWeb.utils.addClass(navBack, 'inactive')
        navForward.className = peerWeb.utils.addClass(navForward, 'inactive')

        try {
          if (webview.canGoBack()) {
            navBack.className = peerWeb.utils.removeClass(navBack, 'inactive')
          }

          if (webview.canGoForward()) {
            navForward
            .className = peerWeb.utils.removeClass(navForward, 'inactive')
          }
        } catch (e) {
          webview.addEventListener('dom-ready', function webviewReady () {
            if (webview.canGoBack()) {
              navBack.className = peerWeb.utils.removeClass(navBack, 'inactive')
            }

            if (webview.canGoForward()) {
              navForward
              .className = peerWeb.utils.removeClass(navForward, 'inactive')
            }
          })
        }
      }
    }

        // Do the same thing for tabs that we did for webviews above
    const tabs = window.document.getElementsByClassName('tab')
    for (let i = 0; i < tabs.length; i++) {
      const tab = tabs[i]
      tab.className = peerWeb.utils.removeClass(tab, 'selected')
      if (peerWeb.utils.getId(tab) === id.toString()) {
        tab.className = peerWeb.utils.addClass(tab, 'selected')
      }
    }

    // Do the same thing for the progressBars
    const progressBars = window.document.getElementsByClassName('progress')
    for (let i = 0; i < progressBars.length; i++) {
      const progressBar = progressBars[i]
      progressBar.className = peerWeb.utils.removeClass(progressBar, 'selected')
      if (peerWeb.utils.getId(progressBar) === id.toString()) {
        progressBar.className = peerWeb.utils.addClass(progressBar, 'selected')
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

    // Do the same thing for the progressBars
    const progressBars = window.document.getElementsByClassName('progress')
    for (let i = 0; i < progressBars.length; i++) {
      const progressBar = progressBars[i]
      if (peerWeb.utils.getId(progressBar) === id.toString()) {
        progressBar.remove()
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
        if (peerWeb.utils.hasClass(tab, 'selected')) {
          if (tabs[i + 1] != null) {
            peerWeb.ui.claimOwnership(peerWeb.utils.getId(tabs[i + 1]))
          } else if (tabs[i - 1] != null) {
            peerWeb.ui.claimOwnership(peerWeb.utils.getId(tabs[i - 1]))
          }
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
    let tabNameText = window.document.createTextNode('New Tab')
    tabName.appendChild(tabNameText)
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

    // Register event listeners for the webview to wire up its state to the UI
    newWebViewElement.addEventListener('did-stop-loading',
                                       peerWeb.ui.endLoading)
    newWebViewElement.addEventListener('did-start-loading',
                                       peerWeb.ui.beginLoading)

    // Next, we create the progress bar that will belong to the webview
    const newProgressBar = window.document.createElement('div')
    newProgressBar.id = `progress-${id}`
    newProgressBar.className = 'progress'
    const newProgressComplete = window.document.createElement('div')
    newProgressComplete.className = 'complete'
    newProgressBar.appendChild(newProgressComplete)

    // Finally, we add everything to the document so the user can see it
    window.document.getElementById('tab-row').appendChild(newTabElement)
    window.document.getElementById('content').appendChild(newProgressBar)
    window.document.getElementById('content').appendChild(newWebViewElement)

    // Give the user something to look at for their new tab
    newWebViewElement.src = 'http://will.blankenship.io/peerweb'

    // Wire up the tab's title to the webview
    newWebViewElement
      .addEventListener('page-title-updated', function updateTabTitle (event) {
        tabNameText.remove()
        tabNameText = window.document.createTextNode(event.title)
        tabName.appendChild(tabNameText)
      })

    // If the webview element is currently selected, update the navbar to
    // reflect its src when this function is called
    function updateNavBar (url) {
      // If the webview isn't selected, there is nothing to do
      if (!peerWeb.utils.hasClass(newWebViewElement, 'selected')) {
        return null
      }

      // Update the UI to reflect the new src
      return peerWeb.ui.claimOwnership(id)
    }

    // Whenever the webview changes its src, update the navbar
    newWebViewElement.addEventListener('did-navigate', updateNavBar)
    newWebViewElement.addEventListener('did-navigate-in-page', updateNavBar)

    peerWeb.ui.claimOwnership(id)
  }

  // beginLoading handles updating the browser state to reflect that a tab has
  // started loading new content. It is an event listener that should be
  // registered in response to an event emitted from a webview
  peerWeb.ui.beginLoading = function beginLoading () {
    // `this` refers to the webview that triggered the event
    const id = peerWeb.utils.getId(this)
    const progressBar = window.document.getElementById(`progress-${id}`)
    // We will use the `progress` attribute to calculate how much time has
    // passed since the download began. The width of the `completed` bar inside
    // the progress bar will be a function of the amount of time that has
    // passed
    progressBar.setAttribute('progress', Date.now())
    progressBar.className = peerWeb.utils.addClass(progressBar, 'loading')
  }

  // endLoading handles updating the browser state to reflect that a tab has
  // finished loading new content. It is an event listener that should be
  // registered in response to an event emitted from a webview
  peerWeb.ui.endLoading = function endLoading () {
    // `this` refers to the webview that triggered the event
    const id = peerWeb.utils.getId(this)
    const progressBar = window.document.getElementById(`progress-${id}`)
    // We no longer need to track the progress of this download
    progressBar.removeAttribute('progress')
    progressBar.className = peerWeb.utils.removeClass(progressBar, 'loading')
  }

  // navigate will take a url and will update the browser state to prepare for
  // the user to be sent to a new webpage. This makes the assumption that the
  // navigation is happening on the _currently selected_ tab.
  peerWeb.ui.navigate = function navigate (url) {
    // collect all the webviews and find which one is currently selected
    const webviews = window.document.getElementsByTagName('webview')
    // We create the webview variable outside of the for loop, and terminate
    // the loop immediately when we find the webview we are looking for. This
    // ensures webview will either be the currently selected webview or that
    // we will navigate the last tab in the event there is no selected webview
    // (which would be a bug)
    let webview = null
    for (let i = 0; i < webviews.length; i++) {
      webview = webviews[i]
      if (peerWeb.utils.hasClass(webview, 'selected')) {
        break
      }
    }

    // We have found the webview we are looking for as defined above, now lets
    // send it to the page we are looking for
    webview.loadURL(url)
  }

  // updateProgress will go through the UI and update all progress bars that
  // belong to a webview that is loading content and is visible
  peerWeb.ui.updateProgress = function updateProgress () {
    // Get the currently loading and visible progress bar if one exists.
    // There will only ever be one of these at a time, since two progressBars
    // can not be visible, and it is possible that the visible webview will not
    // be loading so there may not be work to do here
    const progressBar = window.document
                        .querySelector('.progress.selected.loading .complete')

    // If we didn't find a visible progress bar that belonged to a loading
    // webview, we don't have any work left to do
    if (progressBar == null) {
      return null
    }

    // We store the initial start time of the webview download as the progress
    // attribute on the DOM element of the progress bar, so lets grab that
    // and turn it into a JavaScript date.
    const started = progressBar.parentElement.getAttribute('progress')

    // Lets get how much time has passed since the download started
    const progress = Date.now() - started

    // Lets calculate the width of the progress bar using a logaritmic function
    // that starts out having the progress bar be "really" fast, and then slows
    // down quickly to inch its way towards 100%. This function will take quite
    // a while to reach 100%. You may wonder why the width is not a function of
    // the actual download progress and instead a function of time. Well, we
    // would be hard pressed to know how much data any one website needs to
    // pull over the wire, since a successfully downloaded file could trigger
    // the download of even more files. Instead of implementing the extremely
    // complex logic of tracking the files pending download, and updating that
    // when new files are added and reflecting all of that in the progress bar,
    // we opted in for a simpler feedback mechanism.
    let width = Math.log(progress) * 10

    // Make sure progress never exceeds 100%
    if (width > 99.9) width = 99.9

    // Finally, lets update the width of the progress bar
    progressBar.setAttribute('style', `width:${width}`)

    return null
  }

  // Create an interval that updates all progress bars that are visible and
  // loading. I suspect this will be hot code, and I'm a little concerned about
  // querying the DOM in this. We will gather metrics in the future to see how
  // this is impacting performance
  setInterval(peerWeb.ui.updateProgress, 100)
})()
