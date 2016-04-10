// test configurations

/* eslint-env es6 */

// For compatibility with older IE.
var origin = location.origin || location.protocol + '//' + location.hostname;
function setText(element, value) {
    if (element.textContent === undefined) {
        element.innerText = value;
    } else {
        element.textContent = value;
    }
}

var testRuns = new Map();

var booleans = [false, true];

var versions = [];
var polyfills = [];
var environments = [];

var configs = window.location.hash.split('#');
for (var i=1; i<configs.length; i++) {
    if (configs[i] == 'source') versions.push(false);
    else if (configs[i] == 'compiled') versions.push(true);
    else if (configs[i] == 'native') polyfills.push(false);
    else if (configs[i] == 'polyfill') polyfills.push(true);
    else if (configs[i] == 'frame') environments.push(false);
    else if (configs[i] == 'worker') environments.push(true);
}

versions = versions.length?versions:booleans;
polyfills = polyfills.length?polyfills:booleans;
environments = environments.length?environments:booleans;

function Run(id, urls, worker) {
    this.id = id;
    this.urls = urls;
    this.worker = worker;
    this.started = false;
    this.element = null;
    this.elements = {};
    this.numTests = 0;
    this.success = [];
    this.failure = [];
    this.failures = {};

}

versions.forEach(function(compiled) {
    polyfills.forEach(function(polyfill) {
        environments.forEach(function(worker) {
            var id = (worker ? 'worker' : 'frame') + '-' +
                (polyfill ? 'polyfill' : 'native') + '-' +
                (compiled ? 'compiled' : 'source');
            var urls = [];
            if (polyfill) {
                urls.push('https://cdn.rawgit.com/github/url-polyfill/master/url.js');
                urls.push('https://cdn.rawgit.com/taylorhakes/promise-polyfill/master/promise.js');
//                urls.push('https://cdn.rawgit.com/inexorabletash/polyfill/v0.1.16/polyfill.min.js');
            }
            urls.push('../' + (compiled?'dist':'src') +
                '/eastend' +
                (compiled?'.min':'') + '.js');
            urls.push('tests.js');
            testRuns.set(id, new Run(id, urls, worker));
        });
    });
});

var report = {
    // test run starts
    startRun: function(run, numTests) {
        run.started = true;
        run.numTests = numTests;
    },

    testCaseSuccess: function(run, testCase) {
        run.success.push(testCase);
        setText(run.elements.success, run.success.length);
    },

    testCaseFailure: function(run, testCase, message) {
        console.error('testCaseFailure', run, testCase, message);
        run.failure.push(testCase);
        setText(run.elements.failure, run.failure.length);
        logError(run, testCase, message);
    }
};

var tbody = document.getElementById('tbody');
var errors = document.getElementById('errors');

function logError(run, testCase, message) {
    var error = document.createElement('div');
    if (run) {
        var runName = document.createElement('span');
        runName.className = 'runName';
        setText(runName, run.id);
        error.appendChild(runName);
    }
    if (testCase) {
        var testCaseName = document.createElement('span');
        testCaseName.className = 'testCaseName';
        setText(testCaseName, testCase);
        error.appendChild(testCaseName);
    }
    error.appendChild(document.createTextNode(message));
    errors.appendChild(error);
}

testRuns.forEach(function(testRun) {
    runTests(testRun);
});

function runTests(testRun) {
    testRun.elements.tr = document.createElement('tr');
    testRun.element = document.createElement('div');
    testRun.element.className = 'testRun';
    testRun.element.id = testRun.id;

    testRun.elements.name = document.createElement('td');
    setText(testRun.elements.name, testRun.id);
    testRun.elements.name.className = 'name';
    testRun.elements.tr.appendChild(testRun.elements.name);

    testRun.elements.progress = document.createElement('td');
    testRun.elements.progress.className = 'progress';
    testRun.elements.tr.appendChild(testRun.elements.progress);

    testRun.elements.success = document.createElement('div');
    testRun.elements.success.className = 'success';
    setText(testRun.elements.success, '0');
    testRun.elements.progress.appendChild(testRun.elements.success);

    testRun.elements.failure = document.createElement('div');
    testRun.elements.failure.className = 'failure';
    setText(testRun.elements.failure, '0');
    testRun.elements.progress.appendChild(testRun.elements.failure);

    tbody.appendChild(testRun.elements.tr);

    try {
        (testRun.worker?workerTest:frameTest)(testRun.id, testRun.urls);
    } catch (e) {
        logError(testRun.id, null, e);
    }
}

function handleMessage(data) {
    var message = data.shift();
    data[0] = testRuns.get(data[0]);
    report[message].apply(window, data);
}

function frameTest(id, urls) {
    var iframe = document.createElement('iframe');
    var done = false;
    iframe.src='frame-host.html';
    iframe.onload = iframe.onreadystatechange = function() {
        if (done || this.readyState && this.readyState !== 'complete' && this.readyState !== 'loaded') {
            return;
        }
        done = true;
        var message = JSON.stringify([id, urls]);
        console.log(origin);
        iframe.contentWindow.postMessage(message, origin);
    };
    iframe.onerror = function(event) {
        logError(id, null, event.toString());
        console.error('frame error for', id, event);
    };
    document.body.appendChild(iframe);
    return iframe;
}
window.onmessage = function(event) {
    if (event.origin !== origin) {
        console.error('postMessage origin mismatch', event.origin, origin);
        return;
    }
    handleMessage(JSON.parse(event.data));
};

function workerTest(id, urls) {
    var worker = new Worker('worker-host.js');
    worker.onmessage = function(event) {
        handleMessage(JSON.parse(event.data));
    };
    worker.onerror = function(event) {
        logError(id, null, event.toString());
        console.error('worker error', event);
    };
    worker.postMessage(JSON.stringify([id, urls]));
}

