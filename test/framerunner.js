var report = {
    start: function(config) { },
    progress: function(config, succeeded, failed, total) {

    },
    complete: function(config) { },
    error: function(config, message) {}
};

if (window.parent && window.parent.report) {
    report = window.parent.report;
}


window.onerror = function(message, source, lineno, colno, error) {
    var roots = document.getElementsByTagName('body') || document.getElementsByTagName('html');
    var root = roots[0];
    var pre = document.createElement('pre');
    pre.setAttribute('style', 'background:red;color:white');
    root.appendChild(pre);
    pre.appendChild(document.createTextNode(message + '\n' + source + ':' + lineno + ':' + colno + '\n'+error));
};

var tests = {};

function importScript(url, callback) {
    var s = document.createElement('script');
    s.src = url;
    s.onload = function() {
        callback(true);
    };
    s.onerror = function() {
        callback(false);
    };
    document.head.appendChild(s);
}

function loadDependencies(callback) {
    if (testConfig[config].length == 0) {
        callback();
        return;
    }
    var dep = testConfig[config].pop();
    importScript(dep, function() {
        loadDependencies(callback);
    });
}

function run(config, script) {
    window.config = config;

    loadDependencies(function() {
        importScript(script, function() {
            for (var name in tests) {
                if (!tests.hasOwnProperty(name)) continue;
                console.log(name, tests);
                console.log(tests[name]);
                var promise = tests[name]();
                promise.then(function() {
                    succeeded++;
                    updateProgress();
                }).catch(function(error) {
                    failed++;
                    updateProgress();
                });
            }
        });
    });
}

var total = 0;
var succeeded = 0;
var failed = 0;

function updateProgress() {
    report.progress(config, succeeded, failed, total);
}

/**
 * Run a test encapsulated in a Promise.
 * @param {String} name - the name of the test
 * @param {Function} factory - a function that returns a promise that will run the test.
 */
function test(name, factory) {
    tests[name] = factory;
    total++;
    updateProgress();

}
