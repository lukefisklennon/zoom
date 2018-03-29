var include = require(__dirname + "/include.js");

var fs = require("fs");
var childProcess = require("child_process");

var compile = include("compile");
var exec = include("exec");

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
