// Copyright 2016 Ian McKellar <ian@mckellar.org>
// Distributed under the MIT license, see COPYING.

(function (window) {
    var document = window.document;
    var Promise = window.Promise;

    // Dependency graph - maps module urls to arrays of urls of module dependencies.
    var depGraph = {};

    // Outstanding promise callbacks to be delivered for a particular module.
    var callbacks = {};

    // Modules, by URL.
    var modules = {};

    // The last thing that was define()d.
    var defined;

    // The id for the next callback.
    var nextId=0;

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
        callbacks[url].forEach(function(cbs) {
            cbs[callback](argument);
        });
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

        /** Script has finished loading.
         *
         * @param {Object=} callbackValue - the value delivered by a callback
         * @return {void}
         */
        function scriptLoaded(callbackValue) {
            if (defined) {
                var moduleDeps = depGraph[url] || {};
                var deps = defined[0];
                var factory = defined[1];
                defined = null;

                var dependencyPromises = deps.map(function(dep) {
                    var depUrl = relative(dep, url);
                    moduleDeps[depUrl] = 1;
                    return requireUrl(depUrl);
                });
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
            } else {
                if (global) {
                    modules[url] = window[global];
                } else {
                    modules[url] = callbackValue || true;
                }
                resolveScript(url);
            }
        }

        return new Promise(function (resolve, reject) {
            callbacks[url].push([resolve, reject]);
            var script = document.createElement('script');
            if (url.substr(-1) === '=') {
                // This module calls a callback.
                var callbackName = 'cb' + nextId;
                nextId++;
                window[callbackName] = scriptLoaded;
                script.src = url + callbackName;
            } else {
                script.src = url;
                script.onload = function(){
                    scriptLoaded();
                };
            }
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
