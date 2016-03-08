# East End

A small, simple Javascript module loader for modern browsers. Inspired by the AMD loader spec, it uses Promises rather
than callbacks. It can also load non-AMD libraries.

## Usage

Define a module:

    define([], function() {
        return {"hello": "world"};
    });
    
Define a module with dependencies:

    define(['dep1.js', 'dep2js'], function(dep1, dep2) {
        return {dep1(hello"): dep2("world")};
    });
    
Define a module with a Promise factory:

    define([], function() {
        return new Promise(function(resolve, reject) {
            // do stuff
            resolve({"hello": "world"});
        }
    });
    
Import a module:

    require('library.js').then(function(library) {
        // use the library
    }).catch(function() {
        // handle errors
    });
    
Import a non-module JS library:

    require('jquery.js', '$').then(function($) {
        // Do stuff.
    });

## Requirements

East End depends on the URL and Promise objects.

## Supported environments
### Without polyfill
 * latest Chrome
 * latest Firefox
 * latest Safari
 
### With URL and Promise polyfills
 * ???
 
### Needs testing
 * Chrome for Android
 * Mobile Safari
 * IE Edge
 * Other IE
 
 