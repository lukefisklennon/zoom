var include = require(__dirname + "/include.js");

var fs = require("fs");
var type = include("type");
var renderModule = include("block");
var exec = include("exec");
var Location = include("location");
var util = include("util");

var start = "#include \"zoom.h\"\n#include <iostream>\nusing namespace std;\nint main(int argc,char *argv[]){";
var end = "}";
var components = [];
var lines = [];
var varId = 0;
var name = "";
var nativeFunctions = ["print", "input"];

global.vars = {};
global.functions = {};

module.exports = function(n, callback) {
	name = n;
    var file = fs.readFileSync(name, "utf8").trim();
	var output = renderModule(file);
	// console.log(output);
	var cppName = name.split(".")[0] + ".cpp";
	var binName = name.split(".")[0] + ".bin";
	fs.writeFileSync(cppName, output);
	exec("g++ -std=c++11 -g " + cppName + " -o " + binName, function() {
		if (callback) callback();
	});
}

function processLine(string, location) {
	// return renderLine(util.formatLine(string), location);
	return string;
}
