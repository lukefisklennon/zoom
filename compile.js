var fs = require("fs");

var start = "#include \"zoom.h\"\nint main(int argc,char *argv[]){";
var end = "}";
var components = [];
var names = {};
var lines = [];
var varId = 0;
var name = "";

var operators = [
	{
		symbol: "=",
		process: function(parts, originalLine, lineNumber) {
			var s = "assign";
			var type = typeOf(parts[1]);
			switch (type) {
			case "NUMBER":
				s += "Number";
				break;
			case "BOOLEAN":
				s += "Boolean";
				break;
			case "STRING":
				s += "String";
			case "VAR":
			default:
				s += "Var";
			}
			s += "(" + parts[0] + "," + parts[1] + ")";
			return s;
		}
	},
	{
		symbol: "+",
		process: function(parts, originalLine, lineNumber) {
			var s = "add(" + parts.length;
			for (var i = 0; i < parts.length; i++) {
				var type = typeOf(parts[i]);
				if (type == "VAR") {
					parts[i] += ".vnumber";
				} else if (isRaw(parts[i]) && type != "NUMBER") {
					warn("cannot add " + parts[i] + ": it is not a number", originalLine, lineNumber, "Zero will be used instead");
					parts[i] = "0.0";
				} else if (type == "NUMBER") {
					parts[i] = floatify(parts[i]);
				}
				s += "," + parts[i];
			}
			s += ")";
			return s;
		}
	}
];

module.exports = function(n) {
	name = n;
    var file = fs.readFileSync(name, "utf8");
    file = file.trim();
    lines = file.split("\n");

    for (var i = 0; i < lines.length; i++) {
        lines[i] = processLine(lines[i], i);
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

function processLine(s, lineNumber) {
	var originalLine = s;
	s = formatLine(s);
	for (var i = 0; i < operators.length; i++) {
		if (s.indexOf(operators[i].symbol) != -1) {
			var parts = s.split(operators[i].symbol);
			s = operators[i].process(parts, originalLine, lineNumber);
		}
	}
    return s;
}

function nameToId(name) {
    if (names[name] == undefined) {
        names[name] = "v" + varId;
        varId++;
    }
    return names[name];
}

function isRaw(s) {
	return (isNumber(s) || isBoolean(s) || isString(s));
}

function typeOf(s) {
	if (isNumber(s)) {
		return "NUMBER";
	} else if (isBoolean(s)) {
		return "BOOLEAN";
	} else if (isString(s)) {
		return "STRING";
	} else if (isVar(s)) {
		return "VAR";
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
		if (s.indexOf(operators[i]) != -1) {
			return true;
		}
	}
	return false;
}

function isVar(s) {
	return (!isNumber(s) && !isBoolean(s) && !isString(s) && !containsOperator(s));
}

function floatify(s) {
	if (s.indexOf(".") == -1) {
		s += ".0";
	}
	return s;
}

function warn(message, line, number, patch) {
	console.log(name + ":" + (number + 1));
	console.log("Warning: " + message);
	console.log("  " + line + 1);
	console.log("  " + patch);
	console.log("");
}
