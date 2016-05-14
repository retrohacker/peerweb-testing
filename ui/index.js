// TODO: Rethink this file, rename, refactor, and comment

/* Define required globals */

// The newTab function is provided by /ui/tabs.js
/* global newTab */

/* Done with globals */

// Convention in this file is to name functions called in respoonse DOM
// element events with an `_` and all other functions in camelCase.
function submitUrl (url) {
  const webviews = window.document.getElementsByTagName('webview')
  let webview = null
  for (let i = 0; i < webviews.length; i++) {
    webview = webviews[i]
    if (webview.className.indexOf('selected') !== -1) {
      break
    }
  }
  webview.loadURL(url)
}

function checkSubmit (e) {
  if (e == null) return null
  if (e.keyCode === 13) {
    return submitUrl(e.target.value)
  }
  return null
}

window.addEventListener('load', function addSearchBarEventListener () {
  document.getElementById('search-bar')
    .addEventListener('keypress', checkSubmit)
  newTab()
})
