# East End

A small, simple Promise-first Javascript module loader for modern browsers.
It's inspired by the AMD loader spec but it uses Promises rather than callbacks.
It can also load non-AMD Javascript libraries.

There's an implementation of the API for running in pages (`eastend.js`) and one for use in Workers (`eastend-worker.js`).

It's named after the east end of Alameda, where I live. Because there's another module loader with Promises called [Alameda](https://github.com/requirejs/alameda).

## Usage
### Module naming
Modules are refered to by URL. This is a departure from the AMD approach, but it seems easier to reason about. Modules URLs are relative to where they're being referenced, so in a page they're relative to that page's location but in module dependencies they're relative to the module's URL. 

### Module API
Modules are Javascript files. Each file can only contain one module. Modules declare a list of dependencies and a function that returns the module's value. That value can be a promise.

#### Define a module:

    define([], function() {
        return {"hello": "world"};
    });
    
#### Define a module with dependencies:

    define(['dep1.js', 'dep2.js'], function(dep1, dep2) {
        return {dep1(hello"): dep2("world")};
    });
    
#### Define a module with a Promise factory:

    define([], function() {
        return new Promise(function(resolve, reject) {
            // do stuff
            resolve({"hello": "world"});
        }
    });

### Loader API
Use the `require()` method to load a module. Pass it a module URL and it will return a promise that will resolve with that module, or reject if an error occurs.

#### Import a module:

    require('library.js').then(function(library) {
        // use the library
    }).catch(function() {
        // handle errors
    });
    
#### Import a non-module JS library:
The same interface is supported for Javascript libraries that don't use `define()` to declare themselves.

    require('https://apis.google.com/js/client.js', 'gapi').then(function(gapi) {
        // Do stuff.
    });

## Requirements

East End depends on the `URL` and `Promise` objects and `document.head`. They can be polyfilled.

## Supported environments
Both page and worker Javascript contexts are supported, but for simplicity & code size they are separate implementations.

### Without polyfill
 * recent Chrome
 * recent Firefox
 * recent Safari
 
### With polyfills
 * IE 9-Edge

## Tests
There are some tests in the tests/ directory.

## TODO
In no particular order.
 * Better support loading JS libraries that use a callback to indicate that they're ready. For [example](https://developers.google.com/api-client-library/javascript/start/start-js).
 * IE 8?
 * Make dependencies optional in `define()`.
 * Allow require to take an array of modules to load.
 * Should module names include `.js`?
 * Support `module.exports` for easy use with CommonJS-style modules.
 * Support use in node.js?
 * Automated tests.