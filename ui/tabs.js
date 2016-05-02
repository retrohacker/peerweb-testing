// Convention in this file is to name functions called in respoonse DOM
// element events with an `_` and all other functions in camelCase.

// UUID for tabs
var tabCount = 0

// This listener is registered to the tab add button in the UI. When clicked,
// it triggers a series of events leading to a new tab being added to the UI,
// along with a new webview added to the content section for webpages to
// render in.
function new_tab() {
  /* Begin creating a new tab element for the UI */
  var newTab = window.document.createElement('span')
  var tabName = window.document.createElement('span')
  tabName.appendChild(window.document.createTextNode('New Tab'))
  tabName.className = 'tab-name'
  newTab.appendChild(tabName)
  newTab.id = 'tab-'+tabCount
  newTab.className = 'tab'
  // Add the close button to the tab and wire up an event listener
  var closeTab = window.document.createElement('span')
  closeTab.appendChild(window.document.createTextNode('x'))
  closeTab.className = 'close-tab'
  closeTab.addEventListener('click',close_tab)
  newTab.appendChild(closeTab)
  // Handle mouse clicks for the tab
  newTab.addEventListener('click', check_tab_click)
  /* End creating tab element */

  // Create webview
  var newWebView = window.document.createElement('webview')
  newWebView.id = 'webview-'+tabCount

  // Add everything to the document
  window.document.getElementById('tab-row').appendChild(newTab)
  window.document.getElementById('content').appendChild(newWebView)

  // Give the user a default start page
  newWebView.src='http://www.google.com'

  // Set tab as active
  changeTab(tabCount)

  // Increment the tab uuid
  tabCount++
}

// The check_tab_click listener is registered to the tab DOM elements, and
// determines if an event should be triggered for a click. If the click happend
// on the close button, we ignore the event. Otherwise we scrub the event to
// find the right tab element and call changeTab
function check_tab_click(e) {
  var target = e.target
  if(target.className === 'close-tab') {
    return null
  }
  if(target.className === 'tab-name') {
    target = target.parentNode
  }
  changeTab(target.id.split('-')[1])
}

// Changes the active tab in the UI to the tab with the specified id
function changeTab(id) {
  // Iterate through all the webviews and hide all but the one associated with
  // the supplied tab id
  var webviews = window.document.getElementsByTagName('webview')
  for(var i = 0; i < webviews.length; i++) {
    var webview = webviews[i]
    webview.className =
      webview.className.split(' ').filter((v) => v !== 'selected').join(' ')
    if(webview.id.split('-')[1] == id) {
      webview.className+=' selected'
    }
  }

  // Remove selected class from all tabs, then add it to the active tab
  var tabs = window.document.getElementsByClassName('tab')
  for(i = 0; i < tabs.length; i++) {
    var tab = tabs[i]
    tab.className =
      tab.className.split(' ').filter((v) => v !== 'selected').join(' ')
    if(tab.id.split('-')[1] == id) {
      tab.className+=' selected'
    }
  }
}


function close_tab(e) {
  var tab = e.target.parentElement
  var id = tab.id.split('-')[1]

  var webviews = window.document.getElementsByTagName('webview')
  for(var i = 0; i < webviews.length; i++) {
    var webview = webviews[i]
    if(webview.id.split('-')[1] === id) {
      break
    }
  }

  tab.remove()
  webview.remove()
}
