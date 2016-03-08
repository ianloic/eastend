// AMD loader using Promises etc.

// Depends on:
//  - document.head
//  - Promises
//  - URL

// TODO:
// - investigate dropping dependency on URL & document.head.

(function (window) {
    var depGraph = {};

    var defined = null;

    function relative(url, base) {
        return (new URL(url, base)).toString();
    }

    function getScriptElement(url) {
        return document.querySelector('script[src="' + url + '"]');
    }

    /**
     * Complete the loading of a script. Call the appropriate callbacks.
     *
     * @param {HTMLScriptElement} script - the script element that is complete.
     * @param {number} callback - 0 for the resolve callbacks, 1 for the reject callbacks.
     * @param {Object=} argument - the callback argument.
     * @returns {void}
     */
    function complete(script, callback, argument) {
        if (!script.loading) {
            return;
        }
        for (var i=0; i<script.loading.length; i++) {
            script.loading[i][callback](argument);
        }
        delete script.loading;
    }

    function resolveScript(script) {
        return complete(script, 0, script.module);
    }

    function rejectScript(script) {
        return complete(script, 1);
    }

    /**
     * Load a module or script.
     *
     * @param {string} url - the url to the module or script
     * @param {string=} global - the name of the global variable that a non-module script declares
     * @returns {Promise} - a promise that will resolve or reject when the script has loaded or failed to load.
     */
    function requireUrl(url, global) {
        var script = getScriptElement(url);
        if (!script) {
            return new Promise(function (resolve, reject) {
                script = document.createElement('script');
                script.src = url;
                script.loading = [[resolve, reject]];
                script.onload = function () {
                    if (defined) {
                        defineScript(script, defined[0], defined[1]);
                        defined = null;
                    } else {
                        if (global) {
                            script.module = window[global];
                        } else {
                            script.module = true;
                        }
                        resolveScript(script);
                    }
                };
                script.onerror = function () {
                    rejectScript(script);
                };
                document.head.appendChild(script);
            });
        }
        if (script.module) {
            // Module already loaded - resolve immediately.
            return Promise.resolve(script.module);
        }
        if (script.loading) {
            return new Promise(function (resolve, reject) {
                script.loading.push([resolve, reject]);
            });
        }
        // This shouldn't happen.
        return Promise.reject();
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

    function defineScript(script, deps, factory) {
        var moduleUrl = script.src;

        var moduleDeps = depGraph[moduleUrl] || {};

        var dependencyPromises = [];
        for (var i=0; i<deps.length; i++) {
            var depUrl = relative(deps[i], moduleUrl);
            moduleDeps[depUrl] = 1;
            dependencyPromises.push(requireUrl(depUrl));
        }
        depGraph[moduleUrl] = moduleDeps;
        if (findCycles(moduleUrl)) {
            rejectScript(script);
            return;
        }
        Promise.all(dependencyPromises).then(function (loadedDeps) {
            script.module = factory.apply(window, loadedDeps);
            resolveScript(script);
        }).catch(function () {
            rejectScript(script);
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
