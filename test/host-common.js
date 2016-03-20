// Code shared between frame and worker test hosts.

/* globals load, sendMessage */
/* exported test */

var run;

var tests = {};
var numTests = 0;

function test(name, factory) {
    tests[name] = factory;
    numTests++;
}

function runTest(name) {
    //sendMessage('startTestCase', run, name);
    var promise = tests[name]();
    promise.then(function() {
        sendMessage('testCaseSuccess', run, name);
    }).catch(function(error) {
        sendMessage('testCaseFailure', run, name, error?error.toString():error);
    });
}


self.onmessage = function onmessage(event) {
    // For non-worker hosts, do a same-origin check.
    if (event.origin && event.origin !== location.origin) {
        console.error('postMessage origin mismatch', event.origin, location.origin);
        return;
    }

    run = event.data[0];

    load(event.data[1], function() {
        sendMessage('startRun', run, numTests);
        for (var name in tests) {
            if (!tests.hasOwnProperty(name)) {
                continue;
            }
            runTest(name);
        }
    });
};
