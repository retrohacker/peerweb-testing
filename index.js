/* Configuration:
 *
 * config.protocol: defines the name of the protocol that will serve static
 *   websites over torrent. For example, if you set this to 'peer', then any
 *   url prefixed with 'peer://' will be handled by our torrent protocol
 *
 * config.announce is an array of trackers to publish and check for torrents on
 *
*/
var config = require('./config.json')
require('electron-debug')({showDevTools: true})

/* Begin Dependencies */

// We use path to locate files on the local filesystem
var path = require('path')

// Electron is used to render a browser for the user
var electron = require('electron')

// WebTorrent gives our application the ability to download/seed torrents
var WebTorrent = require('webtorrent')

/* End Dependencies */

// Create a new client responsible for seeding/downloading torrents
var client = new WebTorrent()

// registerTorrentProtocol takes an instance of electron and registers a
// handler for our new protocol, allowing the instance of electron to resolve
// requests against a torrent
function registerTorrentProtocol(electron, cb) {
  electron
    .protocol
    .registerFileProtocol(config.protocol, peerProtocolHandler,
                          function registeredProtocol(e) {
                            return cb(e)
                            // Don't treat our new protocol like http
                            electron.registerStandardSchemes([config.protocol])
                            // Done setting up our new protocol
                            return cb()
                          })
}

// peerProtocolHandler resolves a peer:// request against a torrent, returning
// the requested file as the result
function peerProtocolHandler(request, callback) {
  console.log("Starting download...")
  // Grab the URL as an array, split around '/', and removing the prefixed
  // protocol. This allows us to break the path apart further down
  var url = request.url.substring((config.protocol+'://').length).split('/')

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
    //announce: config.announce,
    path: path.join(__dirname,'downloads',hash)
  }

  // Lets kick off the download through webtorrent
  client.add(hash, opts, function loaded(torrent) {
    console.log("Download started...")

    // Search the torrent for the requestedFile, if not found, return null
    var returnFile = null
    for(var i = 0; i < torrent.files.length; i++) {
      console.log("Downloaded file",i)
      var file = torrent.files[i]
      // Webtorrent prepends the torrent name to the beginning of the file,
      // we want to remove that when searching for the requested file
      var name = file.path.substring((torrent.name+'/').length)
      if(name === requestedFile) {
        // found it!
        returnFile = file
      }
    }

    // If we found the file, get a path to the file, otherwise return null
    var file = null
    if(returnFile) {
      file = path.normalize(__dirname+'/downloads/'+hash+'/'+returnFile.path)
    }

    // Give electron a path to the file on the local fs
    return callback({path: file })
  })
}

// configureElectron registers the custom protocol with or electron app
function configureElectron() {
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
}


// The main logic of our application. This is what runs when called directly
// from the command line
function applicationLogic() {
  electron.app.on('ready', configureElectron)
}

// If we are called directly from the command line, kick off the application
return applicationLogic()

// Export all of our logic for testing
module.exports.registerTorrentProtocol = registerTorrentProtocol
module.exports.peerProtocolHandler = peerProtocolHandler
module.exports.configureElectron = configureElectron
module.exports.applicationLogic = applicationLogic
