#!/usr/bin/env node

/*
 * Builds app binaries for a new release of PeerWeb
 *
 *      \o/ - woot
 */

/* eslint-disable no-console */

// We are going to pull in some stuff from our package.json to prevent
// duplicating values
const pkg = require('../package.json')

const packager = require('electron-packager')
const path = require('path')
const zip = require('cross-zip')
const async = require('async')

/* Begin global configuration */
const buildName = `${pkg.productName}-v${pkg.version}`
const buildDir = path.join(__dirname, '..', 'build')
const outputDir = path.join(__dirname, '..', 'output')
const sourceDir = path.join(__dirname, '..')
/* End global configuration */

const buildConfAll = {
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

const buildConfLinux = {
  platform: 'linux'
}

const buildConfWindows = {
  platform: 'win32',
  arch: 'ia32'
}

const buildConfDarwin = {
  platform: 'darwin',
  arch: 'x64'
}

function buildLinux (cb) {
  const conf = Object.assign({}, buildConfAll, buildConfLinux)
  packager(conf, function linuxBuilt (e, output) {
    if (e) return cb(e)
    console.log(`Linux: ${output}`)
    console.log('Linux: Creating zip...')

    function packageZips (outDir, cb2) {
      const inPath = path.join(outDir)
      const base = path.basename(outDir).split('-')
      const arch = base.pop()
      const outPath = path.join(outputDir, `${buildName}-linux-${arch}.zip`)
      zip.zip(inPath, outPath, function darwinZipped (e2) {
        return cb2(e2)
      })
    }

    return async.each(output, packageZips, cb)
  })
}

function buildWindows (cb) {
  const conf = Object.assign({}, buildConfAll, buildConfWindows)
  packager(conf, function windowsBuilt (e, output) {
    if (e) return cb(e)
    console.log(`Windows: ${output}`)
    console.log('Windows: Creating zip...')

    const inPath = path.join(output[0])
    const outPath = path.join(outputDir, `${buildName}-win.zip`)
    return zip.zip(inPath, outPath, function darwinZipped (ee) {
      return cb(ee)
    })
  })
}

function buildDarwin (cb) {
  const conf = Object.assign({}, buildConfAll, buildConfDarwin)
  packager(conf, function darwinBuilt (e, output) {
    if (e) return cb(e)
    console.log(`Darwin: ${output}`)
    console.log('Darwin: Creating zip...')

    const inPath = path.join(output[0], `${pkg.productName}.app`)
    const outPath = path.join(outputDir, `${buildName}-darwin.zip`)
    return zip.zip(inPath, outPath, function darwinZipped (e2) {
      return cb(e2)
    })
  })
}

// Build packages for all three OSs
function build () {
  buildLinux(function linuxBuilt (e) {
    if (e) console.error(e.message || e)
    buildWindows(function windowsBuilt (e2) {
      if (e2) console.error(e2.message || e2)
      buildDarwin(function darwinBuilt (e3) {
        if (e3) console.error(e3.message || e3)
      })
    })
  })
}

// Kick off the builds
build()
