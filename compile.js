var fs = require("fs");
var exec = require(__dirname + "/exec.js");

var start = "#include \"zoom.h\"\n#include <iostream>\nusing namespace std;\nint main(int argc,char *argv[]){";
var end = "}";
var components = [];
var vars = {};
var functions = {};
var lines = [];
var varId = 0;
var name = "";
var nativeFunctions = ["print"];

var type = {
	undefined: "UNDEFINED",
	number: "NUMBER",
	boolean: "BOOLEAN",
	string: "STRING",
	object: "OBJECT",
	array: "ARRAY",
	var: "VAR"
}

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
	exec("g++ " + cppName + " -o " + binName, function() {
		if (callback) callback();
	});
}

var operators = [
	{
		symbols: ["="],
		type: type.var,
		number: 2,
		start: "assign",
		process: function(symbol, children, location) {
			for (var i = 0; i < children.length; i++) {
				if (children[i] instanceof Value && children[i].type == "VAR") {
					children[i].string = "&" + children[i].string;
				}
			}
			return children;
		}
	},
	{
		symbols: ["+", "-", "*", "/"],
		names: {
			"+": "ADD",
			"-": "SUBTRACT",
			"*": "MULTIPLY",
			"/": "DIVIDE"
		},
		type: type.number,
		number: -1,
		start: "calc",
		process: function(symbol, children, location) {
			for (var i = 0; i < children.length; i++) {
				var type = children[i].type;
				if (type == "VAR") {
					children[i].string += ".number";
				}
			}
			children.unshift(String(children.length));
			children.unshift(this.names[symbol]);
			return children;
		}
	}
];

var functionOperator = {
	type: type.var,
	number: -1,
	process: function(symbol, children, location) {
		var a = [String(children.length)];
		for (var i = 0; i < children.length; i++) {
			a.push(children[i].type);
			a.push(children[i]);
		}
		return a;
	}
}

var symbols = {};
for (var i = 0; i < operators.length; i++) {
	for (var j = 0; j < operators[i].symbols.length; j++) {
		symbols[operators[i].symbols[j]] = operators[i];
	}
}

class Value {
	constructor(string, location) {
		this.string = string;
		this.type = typeOf(string);
		this.location = location;
		if (this.type == "VAR") {
			this.string = nameToId(this.string, vars);
		} else if (this.type == "NUMBER") {
			this.string = floatify(this.string);
		}
	}
}

class Expression {
	constructor(string, location) {
		this.string = string;
		this.children = [];
		this.location = location;
		this.start = "";
		var level = 0;
		var start = -1;
		var groups = [];
		var hasOperator = false;
		for (var i = 0; i < this.string.length; i++) {
			if (level == 0 && this.string[i] in symbols) {
				hasOperator = true;
			} else if (this.string[i] == "(") {
				level++;
				if (level == 1) {
					start = i;
				}
			} else if (this.string[i] == ")") {
				level--;
				if (level == 0) {
					var group = this.string.substring(start + 1, i);
					groups.push(group);
					this.string = this.string.replace(group, "");
					i -= group.length;
				}
			}
		}
		if (this.string == "()") {
			this.string = groups[0];
		} else if (groups.length > 0 && !hasOperator) {
			this.string = this.string.replace("()", "(" + groups[0] + ")");
			var parts = this.string.split("(");
			this.children = parts[1].substring(0, parts[1].length - 1).split(",");
			this.operator = functionOperator;
			this.start = parts[0];
		} else {
			for (var symbol in symbols) {
				if (this.string.indexOf(symbol) != -1) {
					this.children = this.string.split(symbol);
					this.symbol = symbol;
					this.operator = symbols[symbol];
					this.start = this.operator.start;
					break;
				}
			}
		}
		for (var i = 0; i < this.children.length; i++) {
			if (this.children[i].indexOf("()") != -1) {
				this.children[i] = this.children[i].replace("()", "(" + groups[0] + ")");
				groups.shift();
			}
			if (isExpression(this.children[i])) {
				this.children[i] = new Expression(this.children[i], location);
			} else {
				this.children[i] = new Value(this.children[i], location);
			}
		}
		this.type = this.operator.type;
	}
}

class Location {
	constructor(originalLine, lineNumber) {
		this.originalLine = originalLine;
		this.lineNumber = lineNumber + 1;
	}
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
	var parts = [new Expression(formatLine(string), location)];
	var foundExpression = true;
	while (foundExpression) {
		foundExpression = false;
		for (var i = 0; i < parts.length; i++) {
			if (parts[i] instanceof Expression) {
				var a = [parts[i].start + "("];
				var children = parts[i].operator.process(parts[i].symbol, parts[i].children, parts[i].location);
				for (var j = 0; j < children.length; j++) {
					a.push(children[j]);
					if (j < children.length - 1) {
						a.push(",");
					}
				}
				a.push(")");
				parts.splice(i, 1);
				parts.splice(i, 0, ...a);
				foundExpression = true;
			}
		}
	}
	for (var i = 0; i < parts.length; i++) {
		if (parts[i] instanceof Value) {
			parts[i] = parts[i].string;
		}
	}
    return parts.join("");
}

function nameToId(name, object) {
	var prefix = "v";
	if (object == functions) {
		prefix = "f";
		if (nativeFunctions.indexOf(name) != -1) {
			return name;
		}
	}
    if (object[name] == undefined) {
        object[name] = "v" + varId.toString(16);
        varId++;
    }
    return object[name];
}

function isRaw(s) {
	return (isNumber(s) || isBoolean(s) || isString(s));
}

function isExpression(s) {
	return (containsOperator(s) || s.indexOf("(") != -1 || s.indexOf(")") != -1);
}

function typeOf(s) {
	if (s instanceof Expression) {
		if (part.isRaw()) {
			return typeOf(s.string);
		} else {
			return s.type;
		}
	} else {
		if (isNumber(s)) {
			return "NUMBER";
		} else if (isBoolean(s)) {
			return "BOOLEAN";
		} else if (isString(s)) {
			return "STRING";
		} else if (isVar(s)) {
			return "VAR";
		}
	}
	return null;
}

// function resolveType(string) {
// 	var expression = new Expression(string);
// 	if (expression.group) {
// 		return resolveType(expression.values[0]);
// 	} else {
// 		if (expression.isRaw()) {
// 			return typeOf(expression.string);
// 		} else {
// 			return expression.type;
// 		}
// 	}
// }

function isNumber(s) {
	var type = typeof s;
	if (type === "string") {
		if (s.trim() === "") {
			return false;
		}
	} else if (type !== "number") {
		return false;
	}
	return (s - s + 1) === 1;
}

function isBoolean(s) {
	return (s == "true" || s == "false");
}

function isString(s) {
	return (((s[0] == "\"") && (s[s.length - 1] == "\"")) || ((s[0] == "'") && (s[s.length - 1] == "'")));
}

function containsOperator(s) {
	for (var symbol in symbols) {
		if (s.indexOf(symbol) != -1) {
			return true;
		}
	}
	return false;
}

function isVar(s) {
	return (!isNumber(s) && !isBoolean(s) && !isString(s) && !containsOperator(s) && s.indexOf(".") == -1);
}

function floatify(s) {
	if (s.indexOf(".") == -1) {
		s += ".0";
	}
	return s;
}

function warn(message, location, patch) {
	console.log(name + ":" + location.lineNumber);
	console.log("Warning: " + message);
	console.log("  " + location.originalLine);
	console.log("  " + patch);
	console.log("");
}
