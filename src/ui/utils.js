/*
 * utils.js
 *
 * This file contains some handy dandy functions that handle some rather
 * tedious tasks such as DOM manipulation and adding
 */

// Create a global singleton that scopes the globally exposed functions from
// this application
// eslint-disable-next-line prefer-const, no-use-before-define, no-var
var peerWeb = peerWeb || {}

// Scope all functions exposed by this file to utils
peerWeb.utils = peerWeb.utils || {}

;(function scope () {
  // addClass adds a CSS class to a DOM element and returns the new
  // string-separated list of class names as a result
  peerWeb.utils.addClass = function addClass (element, c) {
    // Ensure we don't add an empty space at the beginning if there are no
    // currently existing classes
    if (element.className == null || element.className.length === 0) {
      return c
    }

    return `${element.className} ${c}`
  }

  // removeClass removes a CSS class element from a DOM element and returns
  // the new string-separated list of class names as a result
  peerWeb.utils.removeClass = function removeClass (element, c) {
    // If there are no class names, we have no work to do
    if (element.className == null || element.className.length === 0) {
      return ''
    }

    // Grab the current list of space-separated class names
    return element.className
        // Split around spaces to get an array of class names
        .split(' ')
        // Filter the list, removing any name that matches the class
        .filter((v) => v !== c)
        // Turn it back into a space-separated list
        .join(' ')
  }

  // hasClass takes a DOM element and returns true if the DOM element has the
  // CSS class name provided
  peerWeb.utils.hasClass = function hasClass (element, c) {
    // If the element has no classNames, just return false
    if (element.className == null) {
      return false
    }

    // return true if the element has the class name, false otherwise
    return element.className
            .split(' ')
            // This is gross. To understand what is happening here, first read
            // the documentation on the reduce function for arrays in
            // JavaScript. We are starting the reduce function with the initial
            // value of `false`. We then or the previous value with the strict
            // equality of the class name we are looking for. If at any point,
            // a value in the array is equal to the class name provided to this
            // function, the `or` operation will evaluate to true, meaning the
            // rest of the checks will evaluate to true
            .reduce((p, v) => p || v === c, false)
  }

  // getId takes an element and returns the Unique ID of that element. This
  // assumes that the element conforms to the standard of `TYPE-ID` for the
  // CSS id name that has been established by this project
  peerWeb.utils.getId = function getId (element) {
    // We make sure that the element has an id, and that the id has the
    // function `split`. If so, we return null, since we cant determine an
    // id
    if (element.id == null ||
        typeof element.id.split !== 'function') {
      return null
    }

    // Split the element around `-` and return the id which should be the
    // second component
    return element.id.split('-')[1]
  }
})()
