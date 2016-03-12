// test configurations

var POLYFILL="https://cdn.rawgit.com/inexorabletash/polyfill/v0.1.16/polyfill.min.js";

function library(compiled, worker) {
    return '../../' + (compiled?'dist':'src') + '/eastend' + (worker?'-worker':'') + (compiled?'.min':'') + '.js';
}

function config(compiled, polyfill, worker) {
    var id = (worker ? 'worker' : 'frame') + '-' +
        (polyfill ? 'polyfill' : 'native') + '-' +
        (compiled ? 'compiled' : 'source');
    var urls = [];
    if (polyfill) {
        urls.push(POLYFILL);
    }
    console.log('compiled', compiled, (compiled ? 'compiled' : 'source'));
    urls.push(library(compiled, worker));
    urls.push('tests.js');
    return {
        id: id,
        urls: urls,
        worker: worker
    };
}

var testConfig = {};

for (compiled in [0, 1]) {
    for (polyfill in [0, 1]) {
        for (worker in [0, 1]) {
            console.log('config', compiled, polyfill, worker);
            var c = config(compiled>0, polyfill>0, worker>0);
            console.log(c.id);
            testConfig[c.id] = c;
        }
    }
}

console.log(testConfig);