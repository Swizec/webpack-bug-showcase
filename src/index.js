
document.getElementById("text").textContent = "I should change in 1000ms";

setTimeout(() => {
    require.ensure([], function (require) {
        // breaks
        let viewName = './change';
        var obj = require(viewName);
        obj.doIt();

        // works
        var obj = require(viewName);
        obj.doIt();
    });
}, 1000);
