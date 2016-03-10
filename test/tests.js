test('Simple module require', function () {
    return require('tests/a.js').then(function (a) {
        if (a !== 'a') {
            return Promise.reject('Expected "a", got: ' + a.toString());
        }
    });
});

test('Module with dependencies', function() {
    return require('tests/b.js').then(function (b) {
        if (b !== 'abc') {
            return Promise.reject('Expected "abc", got: ' + b.toString());
        }
    })
});

test('Module not found', function() {
    return require('tests/not-found.js').then(function (b) {
        return Promise.reject('Expected error');
    }).catch(function () {
        return Promise.resolve();
    })
});

test('Dependency not found', function() {
    return require('tests/dep-not-found.js').then(function (b) {
        return Promise.reject('Expected error');
    }).catch(function () {
        return Promise.resolve();
    })
});

test('Invalid module', function() {
    return require('tests/invalid-module.js').then(function (b) {
        return Promise.reject('Expected error');
    }).catch(function () {
        return Promise.resolve();
    })
});

test('Invalid depedency', function() {
    return require('tests/invalid-dep.js').then(function (b) {
        return Promise.reject('Expected error');
    }).catch(function () {
        return Promise.resolve();
    })
});

test('Loading non-module', function() {
    return require('tests/non-module.js').then(function () {
        if (!window.NonModule) {
            return Promise.reject('Expected NonModule global to be defined');
        }
    })
});

test('Loading non-module with named global', function() {
    return require('tests/non-module-global.js', 'NonModuleGlobal').then(function (nmg) {
        if (nmg == 'non-module-global') {
            return Promise.resolve();
        } else {
            return Promise.reject('Expected "non-module-global", got ' + nmg);
        }
    })
});

test('Circular dependencies', function() {
    return require('tests/circular-a.js').then(function (circular) {
        return Promise.reject('Expected failure');
    }).catch(function () {
        return Promise.resolve();
    })
});

test('Triangular dependencies', function() {
    return require('tests/triangular-a.js').then(function (a) {
        return Promise.reject('Expected failure');
    }).catch(function () {
        return Promise.resolve();
    })
});

test('Promise factory', function() {
    return require('tests/promise-factory.js').then(function (pf) {
        if (pf !== 'promise-factory') {
            return Promise.reject('Expected "promise-factory", got: ' + pf.toString());
        }
    })
});

test('Promise factory rejection', function () {
    return require('tests/promise-factory-reject.js').then(function (pf) {
        return Promise.reject('Expected failure');
    }).catch(function () {
        return Promise.resolve();
    });
});