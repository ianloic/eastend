// Copyright 2016 Ian McKellar <ian@mckellar.org>
// Distributed under the MIT license, see COPYING.

(function (window) {
    var document = window.document;
    var Promise = window.Promise;
    var importScripts = window.importScripts;

    // Dependency graph - maps module urls to arrays of urls of module dependencies.
    var depGraph = {};

    // Outstanding promise callbacks to be delivered for a particular module.
    var promiseCallbacks = {};

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

        if (promiseCallbacks[url]) {
            // Module is already being loaded, return a promise that will complete when the in-progress load completes.
            return new Promise(function (resolve, reject) {
                promiseCallbacks[url].push([resolve, reject]);
            });
        }

        promiseCallbacks[url] = [];

        /**
         * Complete the loading of a script. Call the appropriate callbacks.
         *
         * @param {number} callback - 0 for the resolve callbacks, 1 for the reject callbacks.
         * @param {Object=} argument - the callback argument.
         * @returns {void}
         */
        function complete(callback, argument) {
            if (!promiseCallbacks[url]) {
                return;
            }
            promiseCallbacks[url].forEach(function(cbs) {
                cbs[callback](argument);
            });
            delete promiseCallbacks[url];
        }

        function resolveScript() {
            return complete(0, modules[url]);
        }

        function rejectScript() {
            return complete(1);
        }

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
                    rejectScript();
                    return;
                }
                Promise.all(dependencyPromises).then(function (loadedDeps) {
                    modules[url] = factory.apply(window, loadedDeps);
                    resolveScript();
                }).catch(rejectScript);
            } else {
                if (global) {
                    modules[url] = window[global];
                } else {
                    modules[url] = callbackValue || true;
                }
                resolveScript();
            }
        }

        return new Promise(function (resolve, reject) {
            promiseCallbacks[url].push([resolve, reject]);
            var useCallback = url.substr(-1) === '=';
            var src = url;
            var onload;
            if (useCallback) {
                // This module calls a callback.
                var callbackName = 'cb' + nextId;
                nextId++;
                window[callbackName] = scriptLoaded;
                src = url + callbackName;
            } else {
                onload = function(){
                    scriptLoaded();
                };
            }
            if (document) {
                var script = document.createElement('script');
                script.src = src;
                script.onload = onload;
                script.onerror = rejectScript;
                document.head.appendChild(script);
            } else {
                setTimeout(function() {
                    try {
                        importScripts(src);
                        if (onload) {
                            onload();
                        }
                    } catch (error) {
                        rejectScript();
                    }
                }, 1);
            }
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
            /*
            if (!deps.hasOwnProperty(dep)) {
                continue;
            }
            */
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
}(self || window));
