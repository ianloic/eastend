// AMD loader using Promises etc.

// Depends on:
//  - document.head
//  - Promises
//  - URL

// TODO:
// - investigate dropping dependency on URL & document.head.

(function (window) {
    var document = window.document;

    // Dependency graph - maps module urls to arrays of urls of module dependencies.
    var depGraph = {};

    // Outstanding promise callbacks to be delivered for a particular module.
    var callbacks = {};

    // Modules, by URL.
    var modules = {};

    // The last thing that was define()d.
    var defined;

    function relative(url, base) {
        return (new URL(url, base)).toString();
    }

    /**
     * Complete the loading of a script. Call the appropriate callbacks.
     *
     * @param {string} url - the URL of the module.
     * @param {number} callback - 0 for the resolve callbacks, 1 for the reject callbacks.
     * @param {Object=} argument - the callback argument.
     * @returns {void}
     */
    function complete(url, callback, argument) {
        if (!callbacks[url]) {
            return;
        }
        for (var i = 0; i < callbacks[url].length; i++) {
            callbacks[url][i][callback](argument);
        }
        delete callbacks[url];
    }

    function resolveScript(url) {
        return complete(url, 0, modules[url]);
    }

    function rejectScript(url) {
        return complete(url, 1);
    }

    /**
     * Load a module or script.
     *
     * @param {string} url - the url to the module or script
     * @param {string=} global - the name of the global variable that a non-module script declares
     * @returns {Promise} - a promise that will resolve or reject when the script has loaded or failed to load.
     */
    function requireUrl(url, global) {
        if (modules[url]) {
            // Module already loaded - resolve immediately.
            return Promise.resolve(modules[url]);
        }
        if (callbacks[url]) {
            // Module is already being loaded, return a promise that will complete when the in-progress load completes.
            return new Promise(function (resolve, reject) {
                callbacks[url].push([resolve, reject]);
            });
        }

        callbacks[url] = [];

        return new Promise(function (resolve, reject) {
            callbacks[url].push([resolve, reject]);
            var script = document.createElement('script');
            script.src = url;
            script.onload = function () {
                if (defined) {
                    defineScript(url, defined[0], defined[1]);
                    defined = null;
                } else {
                    if (global) {
                        modules[url] = window[global];
                    } else {
                        modules[url] = true;
                    }
                    resolveScript(url);
                }
            };
            script.onerror = function () {
                rejectScript(url);
            };
            document.head.appendChild(script);
        });
    }

    /**
     * Find cycles in the {depGraph} dependency graph.
     * @param {string} node - the url of the module in the dependency graph.
     * @param {Object=} visited - an object to track which nodes have been visited.
     * @returns {boolean} - {true} if a cycle was found, {false} if not.
     */
    function findCycles(node, visited) {
        var v = visited || {};
        if (v[node]) {
            // The node has been visited.
            return true;
        }
        // Mar
        v[node] = 1;
        var deps = depGraph[node];
        if (!deps) {
            // Leaf.
            return false;
        }
        for (var dep in deps) {
            if (!deps.hasOwnProperty(dep)) {
                continue;
            }
            if (findCycles(dep, v)) {
                return true;
            }
        }
        return false;
    }

    function defineScript(url, deps, factory) {
        var moduleDeps = depGraph[url] || {};

        var dependencyPromises = [];
        for (var i = 0; i < deps.length; i++) {
            var depUrl = relative(deps[i], url);
            moduleDeps[depUrl] = 1;
            dependencyPromises.push(requireUrl(depUrl));
        }
        depGraph[url] = moduleDeps;
        if (findCycles(url)) {
            rejectScript(url);
            return;
        }
        Promise.all(dependencyPromises).then(function (loadedDeps) {
            modules[url] = factory.apply(window, loadedDeps);
            resolveScript(url);
        }).catch(function () {
            rejectScript(url);
        });
    }

    function require(moduleName, global) {
        var base = require['base'] || window.location.href;
        var url = relative(moduleName, base);
        return requireUrl(url, global);
    }

    window['require'] = require;

    function define(deps, factory) {
        defined = [deps, factory];
    }

    window['define'] = define;
}(window));
