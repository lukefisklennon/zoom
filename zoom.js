var fs = require ("fs");
var compile = require (__dirname + "/compile.js");

var args = [];
if (process.argv.length > 2) {
    args = process.argv.splice (-(process.argv.length - 2));
}

var commands = {
    compile: function (a) {
        compile (a[0]);
    }
}

var command = args[0];
if (command) {
    args.shift ();
    if (Object.keys (commands).indexOf (command) > -1) {
        commands[command] (args);
    } else {
        console.log ("Command not found: " + command);
    }
}
