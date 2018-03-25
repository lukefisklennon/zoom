var fs = require("fs");

var start = "#include \"zoom.h\"\nint main(int argc,char *argv[]){";
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

class Expression {
	constructor(string, location) {
		this.location = location;
		var foundOperator = false;
		for (var o = 0; o < operators.length; o++) {
			if (string.indexOf(operators[o].symbol) != -1) {
				var parts = string.split(operators[o].symbol);
				this.symbol = operators[o].symbol;
				this.type = operators[o].type;
				this.values = operators[o].process(parts, location);
				foundOperator = true;
				break;
			}
		}
		if (!foundOperator) {
			this.string = string;
			if (isVar(string)) {
				this.string = nameToId(string);
			}
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

var operators = [
	{
		symbol: "=",
		type: type.var,
		number: 2,
		start: function(parts, location) {
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
		process: function(parts, location) {
			return parts;
		}
	},
	{
		symbol: "+",
		type: type.number,
		number: -1,
		start: function(parts) {
			return "add";
		},
		process: function(parts, location) {
			for (var i = 0; i < parts.length; i++) {
				var type = typeOf(parts[i]);
				if (type == "VAR") {
					parts[i] += ".number";
				} else if (isRaw(parts[i]) && type != "NUMBER") {
					warn("cannot add " + parts[i] + ": it is not a number", location, "Zero will be used instead");
					parts[i] = "0.0";
				} else if (type == "NUMBER") {
					parts[i] = floatify(parts[i]);
				}
			}
			parts.unshift(String(parts.length));
			return parts;
		}
	}
];

module.exports = function(n) {
	name = n;
    var file = fs.readFileSync(name, "utf8");
    file = file.trim();
    lines = file.split("\n");

    for (var i = 0; i < lines.length; i++) {
        lines[i] = processLine(lines[i], new Location(lines[i], i));
    }

	components.push(start);
    var varComponent = "";
    for (n in names) {
        varComponent += "Var *" + names[n] + " = new Var();";
    }
	components.push(varComponent);
	components.push(lines.join(";") + ";");
	components.push(end);

    console.log(components.join(""));
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
					parts.splice(i, 0, findOperator(part.symbol).start(part.values, location) + "(");
					for (var j = 0; j < part.values.length; j++) {
						var value = part.values[j];
						if ("string" in value) {
							value = value.string;
							if (j < part.values.length - 1) {
								value += ",";
							}
						}
						parts.splice(i + j + 1, 0, value);
					}
					parts.splice(i + j + 1, 0, ")");
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
			expressionIterate(value, action);
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
	return (((s[0] == "\"") &&(s[s.length - 1] == "\"")) || ((s[0] == "'") &&(s[s.length - 1] == "'")));
}

function containsOperator(s) {
	for (var i = 0; i < operators.length; i++) {
		if (s.indexOf(operators[i].symbol) != -1) {
			return true;
		}
	}
	return false;
}

function findOperator(symbol) {
	for (var i = 0; i < operators.length; i++) {
		if (operators[i].symbol == symbol) {
			return operators[i];
		}
	}
	return null;
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
