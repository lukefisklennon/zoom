var fs = require("fs");

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

module.exports = function(n) {
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
	console.log(output);
	fs.writeFileSync(name.split(".")[0] + ".cpp", output);
}

var operators = [
	{
		symbols: ["="],
		type: type.var,
		number: 2,
		start: function(symbol, children, location) {
			var string = "assign";
			var type = children[1].type;
			switch (type) {
			case "NUMBER":
				string += "Number";
				break;
			case "BOOLEAN":
				string += "Boolean";
				break;
			case "STRING":
				string += "String";
				break;
			case "VAR":
			default:
				string += "Var";
				break;
			}
			return string;
		},
		process: function(symbol, children, location) {
			for (var i = 0; i < children.length; i++) {
				if (children[i].type == "VAR") {
					children[i].string = "&" + children[i].string;
				}
			}
			return children;
		}
	},
	// {
	// 	symbols: ["()"],
	// 	type: type.var,
	// 	number: -1,
	// 	start: function(symbol, parts, location) {
	// 		return nameToId(parts[0].split("(")[0], functions);
	// 	},
	// 	pre: function(symbol, parts, location) {
	// 		parts[0] = parts[0].split("(")[1];
	// 		var last = parts[parts.length - 1];
	// 		parts[parts.length - 1] = last.substring(0, last.length - 1);
	// 		return parts;
	// 	},
	// 	post: function(symbol, parts, location) {
	// 		var a = [String(parts.length)];
	// 		for (var i = 0; i < parts.length; i++) {
	// 			var type = typeOf(parts[i]);
	// 			a.push(type || "VAR");
	// 			if (type == "NUMBER") {
	// 				parts[i] = floatify(parts[i]);
	// 			}
	// 			a.push(parts[i]);
	// 		}
	// 		return a;
	// 	}
	// },
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
		start: function(symbol, children, location) {
			return "calc";
		},
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
		var level = 0;
		var start = -1;
		var groups = [];
		this.string = string;
		this.children = [];
		this.location = location;
		for (var i = 0; i < string.length; i++) {
			if (start == -1 && string[i] in symbols) {
				break;
			} else if (string[i] == "(") {
				level++;
				if (level == 1) {
					start = i;
				}
			} else if (string[i] == ")") {
				level--;
				if (level == 0) {
					var group = string.substring(start + 1, i);
					groups.push(group);
					string = string.replace(group, "");
					i -= group.length;
				}
			}
		}
		for (var symbol in symbols) {
			if (string.indexOf(symbol) != -1) {
				this.children.push(...string.split(symbol));
				this.symbol = symbol;
				this.operator = symbols[symbol];
				break;
			}
		}
		for (var i = 0; i < this.children.length; i++) {
			if (this.children[i] == "()") {
				this.children[i] = groups[0];
				groups.shift();
			}
			if (isExpression(this.children[i])) {
				this.children[i] = new Expression(this.children[i], location);
			} else {
				this.children[i] = new Value(this.children[i], location);
			}
		}
		this.type = symbols[this.symbol].type;
	}
	process() {
		var parts = [];
		for (var i = 0; i < this.children.length; i++) {
			var child = this.children[i];
			if (typeof child == "string") {
				if (typeOf(child) == "VAR") {
					parts.push(nameToId(child, vars));
				} else if (typeOf(child) == "NUMBER") {
					parts.push(floatify(child));
				} else {
					parts.push(child);
				}
			} else {
				parts.push(...this.operator.process(this.symbol, this.children, this.location));
			}
		}
		return parts;
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
		} else if (s[i] ==("\"" || "'")) {
			inString = !inString;
		}
	}
    return s;
}

function processLine(string, location) {
	var parts = new Expression(formatLine(string), location).process();
	console.log(JSON.stringify(parts, null, 2));
	// var parts = [expression];
	// var foundExpression = true;
	// while (foundExpression) {
	// 	foundExpression = false;
	// 	for (var i = 0; i < parts.length; i++) {
	// 		if (parts[i] instanceof Expression) {
	// 			var part = parts.splice(i, 1)[0];
	// 			if (part.isRaw()) {
	// 				parts.splice(i, 0, part.string);
	// 			} else {
	// 				var a = [part.start];
	// 				for (var j = 0; j < part.values.length; j++) {
	// 					a.push(part.values[j]);
	// 					if (j < part.values.length - 1) {
	// 						a.push(",");
	// 					}
	// 				}
	// 				a.push(")");
	// 				parts.splice(i, 0, ...a);
	// 			}
	// 			foundExpression = true;
	// 			break;
	// 		}
	// 	}
	// }
    // return parts.join("");
	return "";
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
