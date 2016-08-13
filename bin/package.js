#!/usr/bin/env node

/*
 * Builds app binaries for a new release of PeerWeb
 *
 *      \o/ - woot
 */

// We are going to pull in some stuff from our package.json to prevent
// duplicating values
var pkg = require('../package.json')

var packager = require('electron-packager')
var path = require('path')
var zip = require('cross-zip')
var async = require('async')

/* Begin global configuration */
// var artifactName = `${pkg.productName}-v${pkg.version}`
var buildName = `${pkg.productName}-v${pkg.version}`
var buildDir = path.join(__dirname, '..', 'build')
var outputDir = path.join(__dirname, '..', 'output')
var sourceDir = path.join(__dirname, '..')
/* End global configuration */

// Build packages for all three OSs
function build () {
  buildLinux(function linuxBuilt (e) {
    if (e) console.error(e.message || e)
    buildWindows(function windowsBuilt (e) {
      if (e) console.error(e.message || e)
      buildDarwin(function darwinBuilt (e) {
        if (e) console.error(e.message || e)
      })
    })
  })
}

var buildConfAll = {
  arch: 'all',
  name: pkg.productName,
  dir: sourceDir,
  out: outputDir,
  overwrite: true,
  prune: true,
  tmpdir: buildDir,
  'app-version': pkg.version,
  ignore: [
    /build/,
    /output/
  ]
}

var buildConfLinux = {
  platform: 'linux'
}

var buildConfWindows = {
  platform: 'win32',
  arch: 'ia32'
}

var buildConfDarwin = {
  platform: 'darwin',
  arch: 'x64'
}

function buildLinux (cb) {
  var conf = Object.assign({}, buildConfAll, buildConfLinux)
  packager(conf, function linuxBuilt (e, output) {
    if (e) return cb(e)
    console.log(`Linux: ${output}`)
    console.log('Linux: Creating zip...')

    function packageZips (outDir, cb) {
      var inPath = path.join(outDir)
      var base = path.basename(outDir).split('-')
      var arch = base.pop()
      var outPath = path.join(outputDir, `${buildName}-linux-${arch}.zip`)
      zip.zip(inPath, outPath, function darwinZipped (e) {
        return cb(e)
      })
    }

    async.each(output, packageZips, cb)
  })
}

function buildWindows (cb) {
  var conf = Object.assign({}, buildConfAll, buildConfWindows)
  packager(conf, function windowsBuilt (e, output) {
    if (e) return cb(e)
    console.log(`Windows: ${output}`)
    console.log('Windows: Creating zip...')

    var inPath = path.join(output[0])
    var outPath = path.join(outputDir, `${buildName}-win.zip`)
    zip.zip(inPath, outPath, function darwinZipped (e) {
      return cb(e)
    })
  })
}

function buildDarwin (cb) {
  var conf = Object.assign({}, buildConfAll, buildConfDarwin)
  packager(conf, function darwinBuilt (e, output) {
    if (e) return cb(e)
    console.log(`Darwin: ${output}`)
    console.log('Darwin: Creating zip...')

    var inPath = path.join(output[0], `${pkg.productName}.app`)
    var outPath = path.join(outputDir, `${buildName}-darwin.zip`)
    zip.zip(inPath, outPath, function darwinZipped (e) {
      return cb(e)
    })
  })
}

// Kick off the builds
build()
