var fs = require("fs");

var start = "#include \"zoom.h\"\n#include <iostream>\nusing namespace std;\nint main(int argc,char *argv[]){";
var end = "}";
var components = [];
var names = {};
var lines = [];
var varId = 0;
var name = "";

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
	components.push("Var " + Object.values(names).join(",") + ";");
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
		start: function(symbol, parts, location) {
			var string = "assign";
			var type = typeOf(parts[1]);
			switch (type) {
			case "NUMBER":
				string += "Number";
				break;
			case "BOOLEAN":
				string += "Boolean";
				break;
			case "STRING":
				string += "String";
			case "VAR":
			default:
				string += "Var";
			}
			return string;
		},
		process: function(symbol, parts, location) {
			for (var i = 0; i < parts.length; i++) {
				if (isVar(parts[i])) {
					parts[i] = "&" + parts[i];
				}
			}
			return parts;
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
		start: function(symbol, parts, location) {
			return "calc";
		},
		process: function(symbol, parts, location) {
			for (var i = 0; i < parts.length; i++) {
				var type = typeOf(parts[i]);
				if (type == "VAR") {
					parts[i] += ".number";
				} else if (isRaw(parts[i]) && type != "NUMBER") {
					warn("cannot add `" + parts[i] + "`: it is not a number", location, "Zero will be used instead");
					parts[i] = "0.0";
				} else if (type == "NUMBER") {
					parts[i] = floatify(parts[i]);
				}
			}
			parts.unshift(String(parts.length));
			parts.unshift(this.names[symbol]);
			return parts;
		}
	}
];

var symbols = {};
for (var i = 0; i < operators.length; i++) {
	for (var j = 0; j < operators[i].symbols.length; j++) {
		symbols[operators[i].symbols[j]] = operators[i];
	}
}

class Expression {
	constructor(string, location) {
		this.location = location;
		var foundOperator = false;
		for (var symbol in symbols) {
			var operator = symbols[symbol];
			if (string.indexOf(symbol) != -1) {
				var parts = string.split(symbol);
				this.symbol = symbol;
				this.type = operator.type;
				for (var i = 0; i < parts.length; i++) {
					if (isVar(parts[i])) {
						parts[i] = nameToId(parts[i]);
					}
				}
				this.values = operator.process(symbol, parts, location);
				foundOperator = true;
				break;
			}
		}
		if (!foundOperator) {
			this.string = string;
			this.values = [];
		}
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
	var expression = new Expression(formatLine(string), location);
	var notDone = true;
	while (notDone) {
		notDone = expressionIterate(expression, function(array, position, string) {
			array[position] = new Expression(string, location);
		});
	}
	var parts = [expression];
	var foundExpression = true;
	while (foundExpression) {
		foundExpression = false;
		for (var i = 0; i < parts.length; i++) {
			if (parts[i] instanceof Expression) {
				var part = parts.splice(i, 1)[0];
				if ("string" in part) {
					parts.splice(i, 0, part.string);
				} else {
					var a = [symbols[part.symbol].start(part.symbol, part.values, location) + "("];
					for (var j = 0; j < part.values.length; j++) {
						a.push(part.values[j]);
						if (j < part.values.length - 1) {
							a.push(",");
						}
					}
					a.push(")");
					parts.splice(i, 0, ...a);
				}
				foundExpression = true;
				break;
			}
		}
	}
    return parts.join("");
}

function expressionIterate(expression, action) {
	var foundString = false;
	for (var i = 0; i < expression.values.length; i++) {
		var value = expression.values[i];
		if (typeof value == "string") {
			action(expression.values, i, value);
			foundString = true;
		} else {
			foundString = expressionIterate(value, action);
		}
	}
	return foundString;
}

function nameToId(name) {
    if (names[name] == undefined) {
        names[name] = "v" + varId.toString(16);
        varId++;
    }
    return names[name];
}

function isRaw(s) {
	return (isNumber(s) || isBoolean(s) || isString(s));
}

function typeOf(s) {
	if (s instanceof Expression) {
		if ("string" in s) {
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
