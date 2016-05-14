// TODO: Rethink this file, refactor and better commments
// TODO: Scope all globals, create global APP object to attach globals
// Convention in this file is to name functions called in respoonse DOM
// element events with an `_` and all other functions in camelCase.

function closeTab (e) {
  const tab = e.target.parentElement
  const id = tab.id.split('-')[1]

  const webviews = window.document.getElementsByTagName('webview')
  let webview = null
  for (let i = 0; i < webviews.length; i++) {
    webview = webviews[i]
    if (webview.id.split('-')[1] === id) {
      break
    }
  }

  tab.remove()
  webview.remove()
}

// Changes the active tab in the UI to the tab with the specified id
function changeTab (id) {
  // Iterate through all the webviews and hide all but the one associated with
  // the supplied tab id
  const webviews = window.document.getElementsByTagName('webview')
  let webview = null
  for (let i = 0; i < webviews.length; i++) {
    webview = webviews[i]
    webview.className =
      webview.className.split(' ').filter((v) => v !== 'selected').join(' ')
    if (webview.id.split('-')[1] === id.toString()) {
      webview.className += ' selected'
    }
  }

  // Remove selected class from all tabs, then add it to the active tab
  const tabs = window.document.getElementsByClassName('tab')
  for (let i = 0; i < tabs.length; i++) {
    const tab = tabs[i]
    tab.className =
      tab.className.split(' ').filter((v) => v !== 'selected').join(' ')
    if (tab.id.split('-')[1] === id.toString()) {
      tab.className += ' selected'
    }
  }
}

// The checkTabClick listener is registered to the tab DOM elements, and
// determines if an event should be triggered for a click. If the click happend
// on the close button, we ignore the event. Otherwise we scrub the event to
// find the right tab element and call changeTab
function checkTabClick (e) {
  let target = e.target
  if (target.className === 'close-tab') {
    return null
  }
  if (target.className === 'tab-name') {
    target = target.parentNode
  }
  changeTab(target.id.split('-')[1])
  return null
}

// UUID for tabs
let tabCount = 0

// This listener is registered to the tab add button in the UI. When clicked,
// it triggers a series of events leading to a new tab being added to the UI,
// along with a new webview added to the content section for webpages to
// render in.
// eslint-disable-next-line no-unused-vars
function newTab () {
  /* Begin creating a new tab element for the UI */
  const newTabElement = window.document.createElement('span')
  const tabName = window.document.createElement('span')
  tabName.appendChild(window.document.createTextNode('New Tab'))
  tabName.className = 'tab-name'
  newTabElement.appendChild(tabName)
  newTabElement.id = `tab-${tabCount}`
  newTabElement.className = 'tab'
  // Add the close button to the tab and wire up an event listener
  const closeTabElement = window.document.createElement('span')
  closeTabElement.appendChild(window.document.createTextNode('x'))
  closeTabElement.className = 'close-tab'
  closeTabElement.addEventListener('click', closeTab)
  newTabElement.appendChild(closeTabElement)
  // Handle mouse clicks for the tab
  newTabElement.addEventListener('click', checkTabClick)
  /* End creating tab element */

  // Create webview
  const newWebViewElement = window.document.createElement('webview')
  newWebViewElement.id = `webview-${tabCount}`

  // Add everything to the document
  window.document.getElementById('tab-row').appendChild(newTabElement)
  window.document.getElementById('content').appendChild(newWebViewElement)

  // Give the user a default start page
  newWebViewElement.src = 'http://www.google.com'

  // Set tab as active
  changeTab(tabCount)

  // Increment the tab uuid
  tabCount++
}
