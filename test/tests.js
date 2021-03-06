/* global test, require */


test('Simple module require', function () {
    return require('tests/simple.js').then(function (simple) {
        if (simple !== 'simple') {
            return Promise.reject('Expected "simple", got: ' + simple.toString());
        }
        return Promise.resolve();
    });
});

test('Module with dependencies', function() {
    return require('tests/b.js').then(function (b) {
        if (b !== 'abc') {
            return Promise.reject('Expected "abc", got: ' + b.toString());
        }
        return Promise.resolve();
    });
});

test('Module not found', function() {
    return require('tests/not-found.js').then(function () {
        return Promise.reject('Expected error');
    }).catch(function () {
        return Promise.resolve();
    });
});

test('Dependency not found', function() {
    return require('tests/dep-not-found.js').then(function () {
        return Promise.reject('Expected error');
    }).catch(function () {
        return Promise.resolve();
    });
});

test('Invalid module', function() {
    return require('tests/invalid-module.js').then(function () {
        return Promise.reject('Expected error');
    }).catch(function () {
        return Promise.resolve();
    });
});

test('Invalid depedency', function() {
    return require('tests/invalid-dep.js').then(function () {
        return Promise.reject('Expected error');
    }).catch(function () {
        return Promise.resolve();
    });
});

test('Loading non-module', function() {
    return require('tests/non-module.js').then(function () {
        if (!self.NonModule) {
            return Promise.reject('Expected NonModule global to be defined');
        }
        return Promise.resolve();
    });
});

test('Loading non-module with named global', function() {
    return require('tests/non-module-global.js', 'NonModuleGlobal').then(function (nmg) {
        if (nmg === 'non-module-global') {
            return Promise.resolve();
        }
        return Promise.reject('Expected "non-module-global", got ' + nmg);
    });
});

test('Circular dependencies', function() {
    return require('tests/circular-a.js').then(function () {
        return Promise.reject('Expected failure');
    }).catch(function () {
        return Promise.resolve();
    });
});

test('Triangular dependencies', function() {
    return require('tests/triangular-a.js').then(function () {
        return Promise.reject('Expected failure');
    }).catch(function () {
        return Promise.resolve();
    });
});

test('Promise factory', function() {
    return require('tests/promise-factory.js').then(function (pf) {
        if (pf !== 'promise-factory') {
            return Promise.reject('Expected "promise-factory", got: ' + pf.toString());
        }
        return Promise.resolve();
    });
});

test('Promise factory rejection', function () {
    return require('tests/promise-factory-reject.js').then(function () {
        return Promise.reject('Expected failure');
    }).catch(function () {
        return Promise.resolve();
    });
});

var TEST_SERVER_CB = 'https://eastend-test-server.appspot.com/callback';

test('Load a JS file with a callback, immediate', function() {
    return require(TEST_SERVER_CB + '?immediate&value=cb1&callback=').then(function(cb) {
        if (!cb) {
            return Promise.reject('Expected callback argument');
        }
        if (cb !== 'cb1') {
            return Promise.reject('Got callback argument "' + cb + '", expected \'cb1"');
        }
        return Promise.resolve();
    });
});

test('Load a JS file with a callback, delayed', function() {
    return require(TEST_SERVER_CB + '?value=cb2&callback=').then(function(cb) {
        if (!cb) {
            return Promise.reject('Expected callback argument');
        }
        if (cb !== 'cb2') {
            return Promise.reject('Got callback argument "' + cb + '", expected \'cb2"');
        }
        return Promise.resolve();
    });
});

test('Load a JS file with a callback and a global', function() {
    return require(TEST_SERVER_CB + '?immediate&value=cb3&global=global1&callback=', 'global1').then(function(global1) {
        if (!global1) {
            return Promise.reject('Expected promise value');
        }
        if (global1 !== 'cb3') {
            return Promise.reject('Got callback argument "' + global1 + '", expected \'cb3"');
        }
        return Promise.resolve();
    });
});

test('Load a JS file with a callback and a global, delayed', function() {
    return require(TEST_SERVER_CB + '?value=cb4&global=global2&callback=', 'global2').then(function(global2) {
        if (!global2) {
            return Promise.reject('Expected promise value');
        }
        if (global2 !== 'cb4') {
            return Promise.reject('Got callback argument "' + global2 + '", expected \'cb4"');
        }
        return Promise.resolve();
    });
});
