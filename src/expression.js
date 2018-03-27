var include = require(__dirname + "/include.js");

var type = include("type");
var util = include("util");

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
		symbols: [".."],
		type: type.string,
		number: -1,
		start: "concat",
		process: function(symbol, children, location) {
			return functionOperator.process(symbol, children, location);
		}
	},
	{
		symbols: ["+", "-", "*", "/"],
		type: type.number,
		number: -1,
		start: "calc",
		process: function(symbol, children, location) {
			for (var i = 0; i < children.length; i++) {
				if (children[i].type != "VAR") {
					children[i].string = "Var(" + children[i].string + ")";
				}
			}
			children.unshift(String(children.length));
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
			this.string = util.nameToId(this.string, global.vars);
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
		var level = 0;
		var start = -1;
		var groups = [];
		var hasOperator = false;

		if (this.string[0] == "(" && this.string[this.string.length - 1] == ")") {
			this.string = this.string.substring(1, this.string.length - 1);
		}

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
			if (util.isExpression(this.children[i])) {
				this.children[i] = new Expression(this.children[i], location);
			} else {
				this.children[i] = new Value(this.children[i], location);
			}
		}

		this.type = this.operator.type;
	}
}

module.exports = function(string, location) {
	var parts = [new Expression(string, location)];
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
