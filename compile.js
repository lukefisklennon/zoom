var fs = require("fs");

var start = "#include \"/home/luke/zoom/zoom.h\"\nint main(int argc,char *argv[]){";
var end = "}";
var names = {};
var lines = [];
var varId = 0;

module.exports = function(name) {
    var file = fs.readFileSync(name, "utf8");
    file = file.trim();
    lines = file.split("\n");

    for (var l in lines) {
        lines[l] = processLine(lines[l]);
    }

    var nameSection = [];
    for (n in names) {
        nameSection += "V *" + names[n] + " = new V();";
    }

    console.log(start + nameSection + lines.join(";") + ";" + end);
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

function processLine(s) {
    s = formatLine(s).split("=");
	if (s.length > 1) {
		s[0] = nameToId(s[0]);
		s[0] += "->a";
		if (isNumber(s[1])) {
			s[0] += "n(";
		} else if (isBoolean(s[1])) {
			s[0] += "b(";
		} else if (isString(s[1])) {
			s[0] += "s(";
		} else {
			s[0] += "v(";
		}
		if (s[1].indexOf("+") != -1) {
			var parts = s[1].split("+");
			var types = [];
			for (var p in parts) {
				var type = typeOf(parts[p]);
				if (type == null) {
					types.push("TV");
				} else {
					types.push(type);
				}
			}
			s[1] = "op(" + parts.length + "," + types.join(",") + "," + parts.join(",") + ")";
		}
		s[1] += ")";
	}
	s = s.join("");
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
		return "TN";
	} else if (isBoolean(s)) {
		return "TB";
	} else if (isString(s)) {
		return "TS";
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
