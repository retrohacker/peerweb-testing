#!/usr/bin/env node

var electron = require('electron-prebuilt')
var cp = require('child_process')
var path = require('path')

var child = cp.spawn(electron,
                     [path.join(__dirname, '..')],
                     {stdio: 'inherit'},
                     {'NODE_ENV': 'production'})

child.on('close', function (code) {
  process.exitCode = code
})
