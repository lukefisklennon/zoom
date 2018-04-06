module.exports = {
	split: function(string, delimiter, ignore) {
		var parts = [];
		var next = "";
		for (var i = 0; i < string.length; i++) {
			var chop = true;
			if (string.substring(i, i + delimiter.length) == delimiter) {
				check:
				for (var j = 0; j < ignore.length; j++) {
					if (ignore[j].length > delimiter.length && ignore[j] != delimiter) {
						var options = [];
						for (var k = 0; k < ignore[j].length; k++) {
							var index = i - k;
							if (string.substring(index, index + ignore[j].length) == ignore[j]) {
								chop = false;
								next += string[i];
								break check;
							}
						}
					}
				}
				if (chop) {
					parts.push(next);
					next = "";
			i += delimiter.length - 1;
				}
			} else {
				next += string[i];
			}
		}
		parts.push(next);
		return parts;
	},
	notIgnore: function(s) {
		return (s.length > 0 && s[0] != "#");
	},
	isExpression: function(s) {
		return (this.typeOf(s) == null && (this.containsOperator(s) || s.indexOf("(") != -1 || s.indexOf(")") != -1));
	},
	typeOf: function(s) {
		if (this.isNumber(s)) {
			return "NUMBER";
		} else if (this.isBoolean(s)) {
			return "BOOLEAN";
		} else if (this.isString(s)) {
			return "STRING";
		} else if (this.isVar(s)) {
			return "VAR";
		} else if (this.isArray(s)) {
			return "ARRAY";
		}
		return null;
	},
	isNumber: function(s) {
		var type = typeof s;
		if (type === "string") {
			if (s.trim() === "") {
				return false;
			}
		} else if (type !== "number") {
			return false;
		}
		return (s - s + 1) === 1;
	},
	isBoolean: function(s) {
		return (s == "true" || s == "false");
	},
	isString: function(s) {
		return (((s[0] == "\"") && (s[s.length - 1] == "\"")) || ((s[0] == "'") && (s[s.length - 1] == "'")));
	},
	isArray: function(s) {
		return (s[0] == "[" && s[s.length - 1] == "]");
	},
	containsOperator: function(s) {
		for (var symbol in global.symbols) {
			if (s.indexOf(symbol) != -1) {
				return true;
			}
		}
		return false;
	},
	isVar: function(s) {
		return (s.match(/^[a-zA-Z_$][a-zA-Z_$0-9]*$/g) !== null);
	},
	floatify: function(s) {
		if (s.indexOf(".") == -1) {
			s += ".0";
		}
		return s;
	},
	warn: function(message, location, patch) {
		console.log(name + ":" + location.lineNumber);
		console.log("Warning: " + message);
		console.log("	" + location.originalLine);
		console.log("	" + patch);
		console.log("");
	}
};
