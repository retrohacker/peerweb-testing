var path = require('path')
var electron = require('electron')
var app = electron.app
var WebTorrent = require('webtorrent')
var client = new WebTorrent()

/* Begin configuration */

// Defines the name of the protocol that will serve static websites over
// torrent. For example, if you set this to 'peer', then any url prefixed with
// 'peer://' will be handled by our torrent protocol
var protocol = 'peer'

// Load in the trackers we want to use
var announce = require('./announce.js')

/* End configuration */

// registerTorrentProtocol takes an instance of electron and registers a
// handler for our new protocol, allowing the instance of electron to resolve
// requests against a torrent
function registerTorrentProtocol(electron, cb) {
  electron
    .protocol
    .registerFileProtocol(protocol, peerProtocolHandler,
                          function registeredProtocol(e) {
                            return cb(e)
                            // Don't treat our new protocol like http
                            electron.registerStandardSchemes([protocol])
                            // Done setting up our new protocol
                            return cb()
                          })
}

// peerProtocolHandler resolves a peer:// request against a torrent, returning
// the requested file as the result
function peerProtocolHandler(request, callback) {
  // Grab the URL as an array, split around '/', and removing the prefixed
  // protocol. This allows us to break the path apart further down
  var url = request.url.substring((protocol+'://').length).split('/')

  // Our hash always comes first
  var hash = url[0]

  // If our url only contained a hash, then return the index.html file from
  // the requested torrent, otherwise return the requested file
  var requestedFile = 'index.html'
  if(url.length !== 1) {
    requestedFile = path.join.apply(null,url.slice(1))
  }

  // We want webtorrent to use the trackers from our config. We also create a
  // directory using the torrent's hash and have webtorrent download it's
  // contents there
  var opts = {
    announce: announce,
    path: path.join(__dirname,'downloads',hash)
  }

  // Lets kick off the download through webtorrent
  client.add(hash, opts, function loaded(torrent) {

    // Search the torrent for the requestedFile, if not found, return null
    var returnFile = null
    torrent.files.forEach(function(file) {
      // Webtorrent prepends the torrent name to the beginning of the file,
      // we want to remove that when searching for the requested file
      var name = file.path.substring((torrent.name+'/').length)
      if(name === requestedFile) {
        // found it!
        returnFile = file
      }
    })

    // If we found the file, get a path to the file, otherwise return null
    var file = null
    if(returnFile) {
      file = path.normalize(__dirname+'/downloads/'+hash+'/'+returnFile.path)
    }

    return callback({path: file })
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

    // Start the application
    var mainWindow = new electron.BrowserWindow(opts)
    mainWindow.loadURL('file://'+__dirname+'/ui/index.html')
  })
})
