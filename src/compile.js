var include = require(__dirname + "/include.js");

var fs = require("fs");
var type = include("type");
var processExpression = include("expression");
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
    var file = fs.readFileSync(name, "utf8");
    file = file.trim();
    lines = file.split("\n");

    for (var i = 0; i < lines.length; i++) {
        lines[i] = processLine(lines[i], new Location(lines[i], i));
    }

	components.push(start);
	if (Object.keys(vars).length > 0) {
		components.push("Var " + Object.values(vars).join(",") + ";");
	}
	components.push(lines.join(";") + ";");
	components.push(end);

    var output = components.join("");
	// console.log(output);
	var cppName = name.split(".")[0] + ".cpp";
	var binName = name.split(".")[0] + ".bin";
	fs.writeFileSync(cppName, output);
	exec("g++ -std=c++11 " + cppName + " -o " + binName, function() {
		if (callback) callback();
	});
}

function formatLine(s) {
	var inString = false;
    for (var i = 0; i < s.length; i++) {
		if (s[i] == " " && !inString) {
			s = s.slice(0, i) + s.slice(i + 1);
			i--;
		} else if (s[i] == ("\"" || "'")) {
			inString = !inString;
		}
	}
    return s;
}

function processLine(string, location) {
	return processExpression(formatLine(string), location);
}
