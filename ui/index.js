// Convention in this file is to name functions called in respoonse DOM
// element events with an `_` and all other functions in camelCase.
function check_submit(e) {
  console.log('keypress')
  if(!e) return null
  if(e.keyCode === 13) {
    console.log('enter')
    return submitUrl(e.target.value)
  }
}

function submitUrl(url) {
  var webviews = window.document.getElementsByTagName('webview')
  for(var i = 0; i < webviews.length; i++) {
    var webview = webviews[i]
    if(webview.className.indexOf('selected') !== -1) {
      break
    }
  }
  console.log(url)
  console.log(webview)
  webview.loadURL(url)
}

window.addEventListener('load',function() {
  document.getElementById('search-bar')
    .addEventListener('keypress',check_submit)
  new_tab()
})
