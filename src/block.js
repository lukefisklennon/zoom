var include = require(__dirname + "/include.js");

var renderLine = include("expression");
var util = include("util");
var type = include("type");
var Location = include("location");

var headers = "#include \"zoom.h\"\n";
var start = "int main(int argc,char *argv[]){";
var end = "return 0;";

class Function {
	constructor(variadic, argc) {
		this.variadic = variadic;
		if (!this.variadic) {
			this.argc = argc;
		}
	}
}

var nativeFunctions = ["print", "input"];
var functions = {
	"print": new Function(false, 1),
	"input": new Function(false, 1)
};

var keywords = {
	main: {
		start: function(block) {
			return start;
		},
		end: end
	},
	if: {
		start: function(block) {
			var string = "if(toBoolean(";
			if (util.isVar(block.first)) {
				string += "&";
			}
			string += block.first + ")){";
			return string;
		}
	},
	else: {
		start: function(block) {
			return "else{";
		}
	},
	while: {
		start: function(block) {
			var string = "while(toBoolean(";
			if (util.isVar(block.first)) {
				string += "&";
			}
			string += block.first + ")){";
			return string;
		}
	},
	function: {
		start: function(block) {
			return "Var " + block.first + "{";
		},
		end: "return Var();"
	}
}

class Block {
	constructor(lines, keyword, parent, first) {
		this.lines = lines;
		this.indent = indentOf(lines[0]);
		this.children = [];
		this.keyword = keyword;
		this.hasScope = false;
		this.parent = parent;
		if (first !== undefined) {
			this.first = first;
		}
		if (keyword == ("main" || "function")) {
			this.hasScope = true;
			this.names = [];
		}
		for (var i = 0; i < this.lines.length; i++) {
			var line = this.lines[i].trim();
			if (line.length > 0 && line[0] != "~") {
				var blockFound = false;
				for (var keyword in keywords) {
					if (line == keyword || line.indexOf(keyword + " ") == 0) {
						var first;
						var args = [];
						var substring = line.substring(keyword.length + 1, this.lines[i].length);
						if (keyword != "function") {
							first = this.renderLine(substring);
						}
						var lines = [];
						for (var j = i + 1; j < this.lines.length; j++) {
							if (indentOf(this.lines[j]) > this.indent) {
								lines.push(this.lines[j]);
							} else {
								break;
							}
						}
						var parent;
						if (this.hasScope) {
							parent = this;
						} else {
							parent = this.parent;
						}
						this.children[i] = new Block(lines, keyword, parent, first);
						if (this.children[i].keyword == "function") {
							var parts = substring.split("(");
							this.name = functionToId(parts[0]);
							var first = this.name + "(";
							this.args = parts[1].substring(0, parts[1].length - 1).split(",");
							if (this.args[0].length == 0) this.args.splice(0, 1);
							for (var k = 0; k < this.args.length; k++) {
								first += "Var " + this.children[i].varToId(this.args[k]);
								if (k < this.args.length - 1) {
									first += ",";
								}
							}
							first += ")";
							this.children[i].first = first;
							functions[parts[0]] = new Function(false, this.args.length);
						}
						blockFound = true;
						break;
					}
				}
				if (blockFound) {
					i = j - 1;
				} else {
					this.children[i] = line;
				}
			}
		}

		for (var i = 0; i < this.children.length; i++) {
			if (typeof this.children[i] == "string") {
				this.children[i] = this.renderLine(this.children[i]);
			}
		}
	}

	varToId(nameString) {
		var block;
		if (this.hasScope) {
			block = this;
		} else {
			block = this.parent;
		}
		var index = block.names.indexOf(nameString);
		if (index == -1) {
			block.names.push(nameString);
			index = block.names.length - 1;
		}
		return "v" + index.toString(16);
	}

	renderLine(line) {
		return renderLine(line, new Location(line, 1), (this.varToId).bind(this), (functionToId).bind(this), (getFunction).bind(this));
	}
}

function functionToId(nameString) {
	if (nativeFunctions.indexOf(nameString) == -1) {
		var names = Object.keys(functions);
		var index = names.indexOf(nameString);
		if (index == -1) {
			functions[nameString] = null;
			index = names.length;
		}
		index -= nativeFunctions.length;
		return "f" + index.toString(16);
	} else {
		return nameString;
	}
}

function getFunction(name) {
	return functions[name] || functions[Object.keys(functions)[Number(name[1]) + nativeFunctions.length]];
}

module.exports = function(string) {
	var lines = string.split("\n");
	var smallestIndent = -1;
	for (var i = 0; i < lines.length; i++) {
		lines[i] = formatLine(lines[i]);
		var maxSpaces = 0;
		var spacesInRow = 0;
		for (var j = 0; j < lines[i].length; j++) {
			if (lines[i][j] == " ") {
				spacesInRow++;
			} else {
				break;
			}
		}
		if (maxSpaces >= 2 && (smallestIndent == -1 || maxSpaces < smallestIndent)) {
			smallestIndent = maxSpaces;
		}
	}
	if (smallestIndent != -1) {
		var indent = " ".repeat(smallestIndent);
		for (var i = 0; i < lines.length; i++) {
			lines[i] = lines[i].replace(indent, "\t");
		}
	}
	var parts = [headers, new Block(lines, "main", null)];

	for (var i = 0; i < parts.length; i++) {
		var block = parts[i];
		if (block.keyword == "function") {
			functions[block.name] = new Function(block.children, false);
		}
	}

	var foundBlock = true;
	while (foundBlock) {
		foundBlock = false;
		for (var i = 0; i < parts.length; i++) {
			if (parts[i] instanceof Block) {
				var block = parts[i];
				var a = [];
				a.push(keywords[block.keyword].start(block));
				if (block.hasScope) {
					var names = [];
					for (var j = 0; j < block.names.length; j++) {
						names.push("v" + j.toString(16));
					}
					if (Object.keys(names).length > 0) {
						a.push("Var " + Object.values(names).join(",") + ";");
					}
				}
				var children = block.children;
				for (var j = 0; j < children.length; j++) {
					if (typeof children[j] == "string") {
						children[j] += ";";
					}
				}
				a.push(...children);
				if ("end" in keywords[block.keyword]) {
					a.push(keywords[block.keyword].end);
				}
				a.push("}");
				parts.splice(i, 1);
				if (block.keyword == "function") {
					parts.splice(1, 0, ...a);
				} else {
					parts.splice(i, 0, ...a);
				}
				foundBlock = true;
			}
		}
	}
	return parts.join("");
}

function formatLine(s) {
	var inString = false;
	var stringStart;
	for (var i = 0; i < s.length; i++) {
		var spaceBefore = false;
		var spaceAfter = false;
		if (i > 0 && s[i - 1] == " ") {
			spaceBefore = true;
		}
		if (i < s.length - 1 && s[i + 1] == " ") {
			spaceAfter = true;
		}
		if (s[i] == " " && !spaceBefore && !spaceAfter && !inString) {
			var removeSpace = true;
			for (var keyword in keywords) {
				var start = i - keyword.length;
				if (start >= 0) {
					if (s.substring(start, i) == keyword) {
						removeSpace = false;
					}
				}
			}
			if (removeSpace) {
				s = s.slice(0, i) + s.slice(i + 1);
				i--;
			}
		} else if (s[i] == ("\"" || "'")) {
			if (stringStart) {
				if (inString && s[i] == stringStart) {
					inString = false;
				} else {
					inString = true;
					stringStart = s[i];
				}
			} else {
				inString = true;
				stringStart = s[i];
			}
		}
	}
	return s;
}

function indentOf(s) {
	var indent = 0;
	for (var i = 0; i < s.length; i++) {
		if (s[i] == "\t") {
			indent++;
		} else {
			return indent;
		}
	}
}
