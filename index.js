// Create an electron app
var path = require('path')
var electron = require('electron')
var app = electron.app
var protocol = 'peer'
var WebTorrent = require('webtorrent')
var announce = require('./announce.js')
var client = new WebTorrent()

// registerTorrentProtocol takes an instance of electron and registers a
// handler for the peer:// protocol, which resolves http requests via torrent
function registerTorrentProtocol(electron, cb) {
  electron
    .protocol
    .registerFileProtocol(protocol, peerProtocolHandler,
                          function registeredProtocol(e) {
                            return cb(e)
                            // Don't treat our new protocol like http
                            electron.registerStandardSchemes([protocol])
                            return cb()
                          })
}

// peerProtocolHandler resolves a peer:// request against a torrent, returning
// the requested file as the result
function peerProtocolHandler(request, callback) {
  console.log(request)
  var hash = request.url.substring((protocol+'://').length)
  var opts = {
    announce: announce,
    path: path.join(__dirname,'downloads',hash)
  }
  //console.log(hash)
  client.add(hash, opts, function loaded(torrent) {
    var index = null
    torrent.files.forEach(function(file) {
      var name = file.path.substring((torrent.name+'/').length)
      //console.log(name)
      if(name === 'index.html') {
        index = file
      }
    })
    var file_path = path.normalize(__dirname+'/downloads/'+hash+'/'+index.path)
    console.log(file_path)
    return callback({path: file_path })
  })
}

app.on('ready', function(e) {
  // electron is now ready to be configured
  registerTorrentProtocol(electron, function init2(e) {
    if(e) throw e
    // peer:// protocol has been registered
    var opts = {
      frame: false,
    }
    var mainWindow = new electron.BrowserWindow(opts)
    mainWindow.loadURL('file://'+__dirname+'/ui/index.html')
  })
})
