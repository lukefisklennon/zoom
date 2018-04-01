var include = require(__dirname + "/include.js");

var type = include("type");
var util = include("util");

var nameToId;

var calcNames = {
	"+": "ADD",
	"-": "SUBTRACT",
	"*": "MULTIPLY",
	"/": "DIVIDE"
};

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
		symbols: ["==", "!="],
		type: type.var,
		number: -1,
		start: "compare",
		process: function(symbol, children, location) {
			var children = functionOperator.process(symbol, children, location);
			children.shift();
			if (symbol == "==") {
				children.unshift("false");
			} else if (symbol == "!=") {
				children.unshift("true");
			}
			return children;
		}
	},
	{
		symbols: ["==", "!="],
		type: type.var,
		number: -1,
		start: "compare",
		process: function(symbol, children, location) {
			var children = functionOperator.process(symbol, children, location);
			children.shift();
			if (symbol == "==") {
				children.unshift("false");
			} else if (symbol == "!=") {
				children.unshift("true");
			}
			return children;
		}
	},
	{
		symbols: [">"],
		type: type.var,
		number: -1,
		start: "gt",
		process: function(symbol, children, location) {
			var children = functionOperator.process(symbol, children, location);
			children.shift();
			return children;
		}
	},
	{
		symbols: ["<"],
		type: type.var,
		number: -1,
		start: "lt",
		process: function(symbol, children, location) {
			var children = functionOperator.process(symbol, children, location);
			children.shift();
			return children;
		}
	},
	{
		symbols: [">="],
		type: type.var,
		number: -1,
		start: "gte",
		process: function(symbol, children, location) {
			var children = functionOperator.process(symbol, children, location);
			children.shift();
			return children;
		}
	},
	{
		symbols: ["<="],
		type: type.var,
		number: -1,
		start: "lte",
		process: function(symbol, children, location) {
			var children = functionOperator.process(symbol, children, location);
			children.shift();
			return children;
		}
	},
	{
		symbols: [".."],
		type: type.var,
		number: -1,
		start: "concat",
		process: function(symbol, children, location) {
			return functionOperator.process(symbol, children, location);
		}
	},
	{
		symbols: ["+", "-", "*", "/"],
		type: type.var,
		number: -1,
		start: "calc",
		process: function(symbol, children, location) {
			var children = functionOperator.process(symbol, children, location);
			children.unshift(calcNames[symbol]);
			return children;
		}
	}
];

var functionOperator = {
	type: type.var,
	number: -1,
	process: function(symbol, children, location) {
		for (var i = 0; i < children.length; i++) {
			if (children[i].type != "VAR") {
				if (children[i] instanceof Expression) {
					children[i].start = "Var(" + children[i].start;
					children[i].end += ")";
				} else if (children[i] instanceof Value) {
					children[i].string = "Var(" + children[i].string + ")";
				}
			}
		}
		children.unshift(String(children.length));
		return children;
	}
}

global.symbols = {};
for (var i = 0; i < operators.length; i++) {
	for (var j = 0; j < operators[i].symbols.length; j++) {
		symbols[operators[i].symbols[j]] = operators[i];
	}
}

class Value {
	constructor(string, location) {
		this.string = string;
		this.type = util.typeOf(string);
		this.location = location;
		if (this.type == "VAR") {
			this.string = nameToId(this.string, type.var);
		} else if (this.type == "NUMBER") {
			this.string = util.floatify(this.string);
		}
	}
}

class Expression {
	constructor(string, location) {
		this.string = string;
		this.children = [];
		this.location = location;
		this.start = "";
		this.end = ")";

		var groups = [];
		var strings = [];
		var hasOperator = false;

		var level = 0;
		var groupStart = -1;
		var inString = false;
		var stringStart = -1;
		var stringChar;

		for (var i = 0; i < this.string.length; i++) {
			if (level == 0 && !inString && this.string[i] in symbols) {
				hasOperator = true;
			} else if (this.string[i] == "(") {
				level++;
				if (level == 1) {
					groupStart = i;
				}
			} else if (this.string[i] == ")") {
				level--;
				if (level == 0) {
					var group = this.string.substring(groupStart + 1, i);
					groups.push(group);
					this.string = this.string.substring(0, groupStart + 1) + this.string.substring(groupStart + group.length + 1, this.string.length);
					i -= group.length;
				}
			} else if (this.string[i] == ("\"" || "'")) {
				if (stringChar) {
					if (inString && this.string[i] == stringChar) {
						inString = false;
						var string = this.string.substring(stringStart + 1, i);
						strings.push(string)
						this.string = this.string.replace(string, "");
						i -= string.length;
					} else {
						inString = true;
						stringStart = i;
						stringChar = this.string[i];
					}
				} else {
					inString = true;
					stringStart = i;
					stringChar = this.string[i];
				}
			}
		}

		if (groups.length > 0 && !hasOperator && this.string != "()") {
			this.string = this.string.replace("()", "(" + groups[0] + ")");
			var parts = this.string.split("(");
			this.children = parts[1].substring(0, parts[1].length - 1).split(",");
			if (this.children[0].length == 0) {
				this.children.shift();
			}
			this.operator = functionOperator;
			this.type = this.operator.type;
			this.start = parts[0];
		} else {
			if (this.string == "()") {
				this.string = groups[0];
			}
			for (var symbol in symbols) {
				var parts = util.split(this.string, symbol, Object.keys(symbols));
				if (parts.length > 1) {
					this.children = parts;
					this.symbol = symbol;
					this.operator = symbols[symbol];
					this.type = this.operator.type;
					this.start = this.operator.start;
					break;
				}
			}
		}

		for (var i = 0; i < this.children.length; i++) {
			var n = (this.children[i].match(/\(\)/g) || []).length;
			for (var j = 0; j < n; j++) {
				this.children[i] = this.children[i].replace("()", "(" + groups[0] + ")");
				groups.shift();
			}
			var n = (this.children[i].match(/""/g) || []).length;
			for (var j = 0; j < n; j++) {
				this.children[i] = this.children[i].replace("\"\"", "\"" + strings[0] + "\"");
				strings.shift();
			}
			if (util.isExpression(this.children[i])) {
				this.children[i] = new Expression(this.children[i], location);
			} else {
				this.children[i] = new Value(this.children[i], location);
			}
		}
	}
}

module.exports = function(string, location, nameFunction) {
	nameToId = nameFunction;
	var parts = [];
	if (util.isExpression(string)) {
		parts.push(new Expression(string, location));
	} else {
		parts.push(new Value(string, location));
	}

	var foundExpression = true;
	while (foundExpression) {
		foundExpression = false;
		for (var i = 0; i < parts.length; i++) {
			if (parts[i] instanceof Expression) {
				var a = [parts[i].start + "("];
				// console.log(parts[i]);
				var children = parts[i].operator.process(parts[i].symbol, parts[i].children, parts[i].location);
				for (var j = 0; j < children.length; j++) {
					a.push(children[j]);
					if (j < children.length - 1) {
						a.push(",");
					}
				}
				a.push(parts[i].end);
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
