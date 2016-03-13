// Copyright 2016 Ian McKellar <ian@mckellar.org>
// Distributed under the MIT license, see COPYING.

/* eslint-env worker */

(function (self) {
    var Promise = self.Promise;

    var defined;
    var modules = {};
    var depGraph = {};

    function relative(url, base) {
        return (new URL(url, base)).toString();
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

    /**
     * Require a module synchronously.
     *
     * @param {string} moduleName - name of the module
     * @param {string=} global - name of a global variable
     * @returns {Object} the module object or null if there's an error
     */
    function requireSync(moduleName, global) {
        var base = require['base'] || self.location.href;
        var url = relative(moduleName, base);
        if (!modules[url]) {
            var moduleDeps = {};
            depGraph[url] = moduleDeps;
            try {
                defined = null;
                importScripts(url);

                if (defined) {
                    var factory = defined[1];
                    var deps = defined[0];
                    defined = null;
                    var loadedDeps = [];
                    for (var i=0; i<deps.length; i++) {
                        // TODO: might be more concise using Promise
                        var depUrl = relative(deps[i], url);
                        moduleDeps[depUrl] = 1;
                        if (findCycles(url)) {
                            // Circular dependency.
                            return null;
                        }
                        var dep = requireSync(depUrl);
                        if (!dep) {
                            return null;
                        }
                        loadedDeps.push(dep);
                    }
                    modules[url] = factory.apply(self, loadedDeps);
                } else if (global) {
                    modules[url] = self[global];
                } else {
                    modules[url] = true;
                }
            } catch(error) {
                return null;
            }
        }
        return modules[url];
    }

    function require(moduleName, global) {
        var module = requireSync(moduleName, global);
        return module?Promise.resolve(module):Promise.reject(module);
    }

    self['require'] = require;

    function define(deps, factory) {
        defined = [deps, factory];
    }

    self['define'] = define;
}(self));
