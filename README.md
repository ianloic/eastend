# East End

A small, simple Promise-first Javascript module loader for modern browsers.
It's inspired by the AMD loader spec but it uses Promises rather than callbacks.
It can also load non-AMD Javascript libraries.

It's really quite small - just over 1k before compression.

A single implementation (`eastend.js`) works in both Window and Worker contexts.

It's named after the east end of Alameda, where I live. Because there's another module loader with Promises called 
[Alameda](https://github.com/requirejs/alameda).

## License
&copy; 2016 [Ian McKellar](https://ian.mckellar.org/) <ian@mckellar.org>

Distributed under the [MIT](COPYING) license.

## Usage
### Module naming
Modules are referred to by URL. This is a departure from the AMD approach, but it seems easier to reason about. 
Modules URLs are relative to where they're being referenced, so in a page they're relative to that page's location 
but in module dependencies they're relative to the module's URL.

This also allows East End to load scripts that are't written as modules in a consistent way.

### Module API
Modules are Javascript files. Each file can only contain one module. Modules declare a list of dependencies and a 
function that returns the module's value. That value can be a promise.

#### Define a module:
There's a global function called `define(dependencies, factory)` that takes an array of module dependencies and a 
function that when called returns the value of the module. The simplest modules look like:

    define([], function() {
        return {"hello": "world"};
    });
    
#### Define a module with dependencies:

    define(['dep1.js', 'dep2.js'], function(dep1, dep2) {
        return {dep1("hello"): dep2("world")};
    });
    
#### Define a module with a Promise factory:

    define([], function() {
        return new Promise(function(resolve, reject) {
            // do stuff
            resolve({"hello": "world"});
        }
    });

### Loader API
Use the `require()` method to load a module. Pass it a module URL and it will return a promise that will resolve with 
that module, or reject if an error occurs.

#### Import a module:

    require('library.js').then(function(library) {
        // use the library
    }).catch(function() {
        // handle errors
    });
    
#### Import a non-module JS script:
The same interface is supported for Javascript libraries that don't use `define()` to declare themselves but set a 
global variable. Pass the name of the global variable as the second argument.

    require('https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.16/d3.js', 'd3').then(function(d3) {
        // Do stuff.
    });
    
#### Import a script that uses a callback:
If a script uses a callback to indicate that it has loaded or to supply data then simply end the url with `=`. For
example:

    require('https://apis.google.com/js/client.js?onload=', 'gapi').then(function(gapi) {
        // Work it.
    });
    
This is useful for loading JSONP too:

    require('https://api.github.com/gists/public?callback=').then(function(gists) {
        // Do things.
    });
    
## Requirements

East End depends on the `URL` and `Promise` objects and `document.head`. They can be polyfilled.

## Supported environments
Both page and worker Javascript contexts are supported.

### Without polyfill
 * recent Chrome
 * recent Firefox
 * recent Safari
 
### With polyfills
 * IE 9-Edge

## Tests
There are some tests in the tests/ directory. Load tests/runner.html in a browser.
