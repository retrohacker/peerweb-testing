// State for keeping track of tabs
var tabCount = 0
var selectedTab = null

function new_tab() {
  // Create tab
  var newTab = window.document.createElement('span')
  var tabName = window.document.createElement('span')
  tabName.appendChild(window.document.createTextNode('New Tab'))
  tabName.className = 'tab-name'
  newTab.appendChild(tabName)
  newTab.id = 'tab-'+tabCount
  newTab.className = 'tab'
  var closeTab = window.document.createElement('span')
  closeTab.appendChild(window.document.createTextNode('x'))
  closeTab.className = 'close-tab'
  closeTab.addEventListener('click',close_tab)
  newTab.appendChild(closeTab)

  // Handle mouse clicks
  newTab.addEventListener('click', check_tab_click)

  // Create webview
  var newWebView = window.document.createElement('webview')
  newWebView.id = 'webview-'+tabCount

  // Hide all webviews
  var webviews = window.document.getElementsByTagName('webview')
  for(var i = 0; i < webviews.length; i++) {
    webviews[i].style.display = 'none'
  }

  // Add everything to the document
  window.document.getElementById('tab-row').appendChild(newTab)
  window.document.getElementById('content').appendChild(newWebView)
  selectedTab = tabCount
  newWebView.src='http://www.google.com'
  tabCount++
}

function check_tab_click(e) {
  var target = e.target
  if(target.className === 'close-tab') {
    return null
  }
  if(target.className === 'tab-name') {
    target = target.parentNode
  }
  change_tab(target.id.split('-')[1])
}

function change_tab(id) {
  console.log(id)
  var webviews = window.document.getElementsByTagName('webview')
  for(var i = 0; i < webviews.length; i++) {
    var webview = webviews[i]
    if(webview.id.split('-')[1] == id) {
      webview.style.display = "flex"
    } else {
      webview.style.display = "none"
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

function check_submit(e) {
  if(!e) return null
  if(e.keyCode === 13) {
    return submitUrl(e.target.value, selectedTab)
  }
}

function submitUrl(url, id) {
  var webviews = window.document.getElementsByTagName('webview')
  for(var i = 0; i < webviews.length; i++) {
    var webview = webviews[i]
    if(webview.id.split('-')[1] == id) {
      break
    }
  }

  webview.loadURL(url)
}

window.addEventListener('load',function() {
  document.getElementById('search-bar')
    .addEventListener('keypress',check_submit)
  new_tab()
})
