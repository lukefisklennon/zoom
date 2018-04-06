var include = require(__dirname + "/include.js");

var type = include("type");
var util = include("util");

var calcNames = {
	"+": "ADD",
	"-": "SUBTRACT",
	"*": "MULTIPLY",
	"/": "DIVIDE",
	"^": "POWER",
	"%": "REMAINDER"
};

var varToId;
var functionToId;
var getFunction;

var operators = [
	{
		symbols: ["return "],
		type: type.undefined,
		number: 1,
		start: "return",
		process: function(expression) {
			expression.children.shift();
		}
	},
	{
		symbols: ["="],
		type: type.var,
		number: 2,
		start: "assign",
		process: function(expression) {
			addressify(expression.children);
		}
	},
	{
		symbols: ["==", "!="],
		type: type.boolean,
		number: 2,
		start: "compare",
		process: function(expression) {
			comparison(expression, this.symbols);
		}
	},
	{
		symbols: [">", "<="],
		type: type.boolean,
		number: 2,
		start: "gt",
		process: function(expression) {
			comparison(expression, this.symbols);
		}
	},
	{
		symbols: ["<", ">="],
		type: type.boolean,
		number: 2,
		start: "lt",
		process: function(expression) {
			comparison(expression, this.symbols);
		}
	},
	{
		symbols: ["+=", "-=", "*=", "/="],
		type: type.var,
		number: 2,
		start: "mcalc",
		process: function(expression) {
			modifier(expression.children);
			expression.children.unshift(calcNames[expression.symbol[0]]);
		}
	},
	{
		symbols: ["..="],
		type: type.var,
		number: 2,
		start: "mconcat",
		process: function(expression) {
			modifier(expression.children);
		}
	},
	{
		symbols: [".."],
		type: type.var,
		number: -1,
		start: "concat",
		process: function(expression) {
			variadic(expression.children);
		}
	},
	{
		symbols: ["+", "-", "*", "/", "^", "%"],
		type: type.var,
		number: -1,
		start: "calc",
		process: function(expression) {
			variadic(expression.children);
			expression.children.unshift(calcNames[expression.symbol]);
		}
	},
	{
		symbols: ["."],
		type: type.var,
		number: 2,
		start: function(expression) {
			return "_" + expression.children[0];
		},
		process: function(expression) {

		}
	}
];

var functionOperator = {
	type: type.var,
	number: -1,
	process: function(expression) {
		var f = getFunction(expression.start);
		var n = expression.children.length;
		if (n < f.argc) {
			for (var i = 0; i < f.argc - n; i++) {
				expression.children.push("Var()");
			}
		} else if (n > f.argc) {
			for (var i = 0; i < n - f.argc; i++) {
				expression.children.splice(f.argc, 1);
			}
		}
		varify(expression);
	}
}

var accessOperator = {
	type: type.var,
	number: 2,
	start: "access",
	process: function(expression) {
		modifier(expression.children);
	}
}

function variadic(children) {
	varify(children);
	children.unshift(String(children.length));
}

function varify(children) {
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
}

function addressify(children) {
	for (var i = 0; i < children.length; i++) {
		if (children[i] instanceof Value && children[i].type == "VAR") {
			children[i].string = "&" + children[i].string;
		}
	}
}

function modifier(children) {
	varify(children);
	addressify(children);
}

function comparison(expression, symbols) {
	varify(expression.children);
	addressify(expression.children);
	if (expression.symbol == symbols[0]) {
		expression.children.unshift("false");
	} else if (expression.symbol == symbols[1]) {
		expression.children.unshift("true");
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
			this.string = varToId(this.string);
		} else if (this.type == "NUMBER") {
			this.string = util.floatify(this.string);
		} else if (this.type == "ARRAY") {
			var values = this.string.substring(1, this.string.length - 1).split(",");
			for (var i = 0; i < values.length; i++) {
				values[i] = "Var(" + new Value(values[i], location).string + ")";
			}
			this.string = "{" + values.join(",") + "}";
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
		var groupChar;
		var inString = false;
		var stringStart = -1;
		var stringChar;

		for (var i = 0; i < this.string.length; i++) {
			if (level == 0 && !inString && this.string[i] in symbols) {
				hasOperator = true;
			} else if ((groupChar != "[" && this.string[i] == "(") || (groupChar != "(" && this.string[i] == "[")) {
				level++;
				if (level == 1) {
					groupStart = i;
					groupChar = this.string[i];
				}
			} else if ((groupChar == "(" && this.string[i] == ")") || (groupChar == "[" && this.string[i] == "]")) {
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

		if (groups.length > 0 && !hasOperator) {
			if (groupChar == "(" && this.string != "()") {
				this.children = groups;
				this.operator = functionOperator;
				this.start = functionToId(this.string.split("(")[0]);
			} else if (groupChar == "[" && this.string != "[]") {
				this.children = [this.string.split("[")[0], groups[0]];
				this.operator = accessOperator;
				if (typeof this.operator.start === "function") {
					this.start = this.operator.start(expression);
				} else {
					this.start = this.operator.start;
				}
			}
			this.type = this.operator.type;
		} else {
			if (this.string == "()" || this.string == "[]") {
				this.string = groups[0];
			}
			for (var symbol in symbols) {
				var parts = util.split(this.string, symbol, Object.keys(symbols));
				if (parts.length > 1) {
					// for (var i = 0; i < parts.length; i++) {
					// 	if (parts[i].length == 0) {
					// 		parts.splice(i, 1);
					// 		i--;
					// 	}
					// }
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
			if (groupChar == "(") {
				var n = (this.children[i].match(/\(\)/g) || []).length;
				var end = ")";
			} else if (groupChar == "[") {
				var n = (this.children[i].match(/\[\]/g) || []).length;
				var end = "]";
			}
			for (var j = 0; j < n; j++) {
				this.children[i] = this.children[i].replace(groupChar + end, groupChar + groups[0] + end);
				groups.shift();
			}
			var n = (this.children[i].match(/""/g) || []).length;
			for (var j = 0; j < n; j++) {
				this.children[i] = this.children[i].replace("\"\"", "\"" + strings[0] + "\"");
				strings.shift();
			}
			if (this.children[i].length > 0) {
				if (util.isExpression(this.children[i])) {
					this.children[i] = new Expression(this.children[i], location);
				} else {
					this.children[i] = new Value(this.children[i], location);
				}
			}
		}
	}
}

module.exports = function(string, location, vtid, ftid, gf) {
	if (string.length == 0) return string;

	varToId = vtid;
	functionToId = ftid;
	getFunction = gf;
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
			var expression = parts[i];
			if (expression instanceof Expression) {
				var a = [expression.start + "("];
				expression.operator.process(parts[i]);
				for (var j = 0; j < expression.children.length; j++) {
					a.push(expression.children[j]);
					if (j < expression.children.length - 1) {
						a.push(",");
					}
				}
				a.push(expression.end);
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
