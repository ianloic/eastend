function iframeTest(config, script) {
    var iframe = document.createElement('iframe');
    iframe.src='framerunner.html';
    iframe.onload = function() {
        console.log('frame loaded for', config);
        iframe.contentWindow.run(config, script);
    };
    iframe.onerror = function() {
        console.log('frame error for', config);
    };
    document.body.appendChild(iframe);
    return iframe;
}

function workerTest(config, script) {
    var worker = new Worker('workerrunner.js');
    console.log(config);
    worker.addEventListener('message', function(event) {
        console.log(event.data);
    });
    worker.postMessage([config, script]);
}
