var varId = 0;
var functionId = 0;

module.exports = {
	formatLine: function(s) {
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
	},
	nameToId: function(name, object) {
		if (object == global.vars) {
			if (object[name] == undefined) {
		        object[name] = "v" + varId.toString(16);
		        varId++;
		    }
		} else if (object == global.functions) {
			if (nativeFunctions.indexOf(name) != -1) {
				return name;
			}
			if (object[name] == undefined) {
		        object[name] = "f" + functionId.toString(16);
		        varId++;
		    }
		}
	    return object[name];
	},
	isExpression: function(s) {
		return (this.containsOperator(s) || s.indexOf("(") != -1 || s.indexOf(")") != -1);
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
	containsOperator: function(s) {
		for (var symbol in global.symbols) {
			if (s.indexOf(symbol) != -1) {
				return true;
			}
		}
		return false;
	},
	isVar: function(s) {
		return (!this.isNumber(s) && !this.isBoolean(s) && !this.isString(s) && !this.containsOperator(s) && s.indexOf(".") == -1);
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
		console.log("  " + location.originalLine);
		console.log("  " + patch);
		console.log("");
	}
};
