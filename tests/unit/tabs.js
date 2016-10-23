'use strict'

/* eslint-disable func-names */
const test = require('tape')
const buildBinary = require('../build.js')
const spectron = require('spectron')
const asyncLib = require('async')

/* Define globals for tests */
let app = null
/* Done defining globals */

// This is a hack. Since tape runs tests serially, we can have this test run
// before everything else in this file. This lets us get a path to the binary
// (the module will build it for us if necessary) and then the rest of the
// tests can use the global variable defined above.
test('Get path to binary', function (t) {
  buildBinary.getPath(function (e, path) {
    app = new spectron.Application({
      path
    })
    t.end()
  })
})

// We want to make sure the nav-bar loads and is visible, so we start the
// browser and query the DOM
test('UI Loads', function (t) {
  app.start()
    .then(function () {
      return app.client.isVisibleWithinViewport('#nav-bar')
    })
    .then(function (isVisible) {
      t.equal(isVisible, true, 'Nav Bar should be visible')
    })
    .catch(function (e) {
      t.fail(e)
      return
    })
    .then(function () {
      return app.stop()
    })
    .catch(function (e) {
      t.fail(e)
      return
    })
    .then(function (e) {
      t.end()
      return
    })
})

// Lets make sure that clicking the "add tab" button actually adds a tab
test('Tab functionality', function (t) {
  app.start()
    // Click the "add tab" button 3 times, resulting in 4 tabs on the page
    .then(function () {
      return app.client.click('#add-tab')
    })
    .then(function () {
      return app.client.click('#add-tab')
    })
    .then(function () {
      return app.client.click('#add-tab')
    })
    .then(function (isVisible) {
      return app.client.elements('.tab')
    })
    .then(function (tabs) {
      t.equal(tabs.value.length, 4, 'clicking add-tab 3 times added 3 tabs')
      return
    })
    .then(function () {
      return app.client.click('#tab-2')
    })
    .then(function () {
      return app.client.isVisibleWithinViewport('#webview-2')
    })
    .then(function (isVisible) {
      t.equal(isVisible,
              true,
              'webview becomes visible when corresponding tab is clicked')
    })
    .then(function () {
      return app.client.click('.close-tab')
    })
    .then(function () {
      return app.client.elements('.tab')
    })
    .then(function (tabs) {
      t.equal(tabs.value.length, 3, 'clicking close-tab removes a tab')
      return
    })
    .catch(function (e) {
      t.fail(e)
      return
    })
    .then(function () {
      return app.stop()
    })
    .catch(function (e) {
      t.fail(e)
      return
    })
    .then(function (e) {
      t.end()
      return
    })
})

// Let's make sure the nav bar updates the tab after page load
test('Navbar updates tab value', function (t) {
  app.start()
    // Set the URL to google and then press enter
    .then(function () {
      return app.client.setValue('#search-bar', 'http://www.google.com')
    })
    .then(function () {
      return app.client.click('#search-bar')
    })
    .then(function (bar) {
      return app.client.keys('Enter')
    })
    // Keep checking to see if the page has loaded
    .then(function () {
      return new Promise(function (resolve, reject) {
        asyncLib.retry(
          { times: 10, interval: 2000 },
          function (cb) {
            app.client.selectorExecute('webview', function (webview) {
              return `${webview[0].isLoading()}`
            })
            .then(function (isLoading) {
              if (isLoading === 'false') {
                // Give UI a chance to render. Magic numbers...
                return setTimeout(cb, 1000)
              }
              return cb(new Error('WebView still loading...'))
            })
            .catch(cb)
          },
          function (e) {
            if (e) return reject(e)
            return resolve()
          }
        )
      })
    })
    // Make sure tab value was updated
    .then(function () {
      return app.client.selectorExecute('.tab-name', function (tabs) {
        return tabs[0].innerHTML
      })
    })
    .then(function (text) {
      if (text !== 'Google') throw new Error(`Invalid tab title: ${text}`)
      return null
    })
    .catch(function (e) {
      t.fail(e)
      return
    })
    .then(function () {
      return app.stop()
    })
    .catch(function (e) {
      t.fail(e)
      return
    })
    .then(function (e) {
      t.end()
      return
    })
})

/* eslint-enable func-names */
