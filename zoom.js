var fs = require("fs");
var childProcess = require("child_process");
var compile = require(__dirname + "/compile.js");
var exec = require(__dirname + "/exec.js");

var args = [];
if (process.argv.length > 2) {
    args = process.argv.splice(-(process.argv.length - 2));
}

var commands = {
    compile: function(a) {
        compile(a[0]);
    },
	run: function(a) {
		run(a[0]);
	},
	go: function(a) {
		compile(a[0], function() {
			run(a[0]);
		});
	}
}

var command = args[0];
if (command) {
    args.shift();
    if (Object.keys(commands).indexOf(command) > -1) {
        commands[command](args);
    } else {
        console.log("Command not found: " + command);
    }
}

function run(name) {
	exec("./" + name.split(".")[0] + ".bin");
}
