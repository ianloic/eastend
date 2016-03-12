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
            var c = config(compiled>0, polyfill>0, worker>0);
            testConfig[c.id] = c;
        }
    }
}
