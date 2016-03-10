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

