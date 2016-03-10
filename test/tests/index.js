test('Simple module require', require('a.js').then(function (a) {
    if (a !== 'a') {
        return Promise.reject('Expected "a", got: ' + a.toString());
    }
}));

test('Module with dependencies', require('b.js').then(function (b) {
    if (b !== 'abc') {
        return Promise.reject('Expected "abc", got: ' + b.toString());
    }
}));

test('Module not found', require('not-found.js').then(function (b) {
    return Promise.reject('Expected error');
}).catch(function () {
    return Promise.resolve();
}));

test('Dependency not found', require('dep-not-found.js').then(function (b) {
    return Promise.reject('Expected error');
}).catch(function () {
    return Promise.resolve();
}));

test('Invalid module', require('invalid-module.js').then(function (b) {
    return Promise.reject('Expected error');
}).catch(function () {
    return Promise.resolve();
}));

test('Invalid depedency', require('invalid-dep.js').then(function (b) {
    return Promise.reject('Expected error');
}).catch(function () {
    return Promise.resolve();
}));

test('Loading non-module', require('non-module.js').then(function () {
    if (!window.NonModule) {
        return Promise.reject('Expected NonModule global to be defined');
    }
}));

test('Loading non-module with named global', require('non-module-global.js', 'NonModuleGlobal').then(function (nmg) {
    if (nmg == 'non-module-global') {
        return Promise.resolve();
    } else {
        return Promise.reject('Expected "non-module-global", got ' + nmg);
    }
}));

test('Circular dependencies', require('circular-a.js').then(function (circular) {
    return Promise.reject('Expected failure');
}).catch(function () {
    return Promise.resolve();
}));

test('Triangular dependencies', require('triangular-a.js').then(function (a) {
    return Promise.reject('Expected failure');
}).catch(function () {
    return Promise.resolve();
}));

test('Promise factory', require('promise-factory.js').then(function(pf) {
    if (pf !== 'promise-factory') {
        return Promise.reject('Expected "promise-factory", got: ' + pf.toString());
    }
}));

test('Promise factory rejection', require('promise-factory-reject.js').then(function(pf) {
    return Promise.reject('Expected failure');
}).catch(function () {
    return Promise.resolve();
}));
