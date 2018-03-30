var include = require(__dirname + "/include.js");

var renderLine = include("expression");
var util = include("util");
var type = include("type");
var Location = include("location");

var mainStart = "#include \"zoom.h\"\nint main(int argc,char *argv[]){";

var keywords = {
	main: function(block) {
		return mainStart;
	},
	if: function(block) {
		var string = "if(toBoolean(";
		if (util.isVar(block.first)) {
			string += "&";
		}
		string += block.first + ")){";
		return string;
	},
	while: function(block) {

	},
	for: function(block) {

	},
	function: function(block) {

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
			this.names = {};
			this.names[type.var] = [];
			this.names[type.function] = [];
		}
		for (var i = 0; i < this.lines.length; i++) {
			var blockFound = false;
			for (var keyword in keywords) {
				if (this.lines[i].indexOf(keyword + " ") == 0) {
					var first = renderLine(this.lines[i].substring(keyword.length + 1, this.lines[i].length), new Location("todo", 1), (this.nameToId).bind(this));
					var lines = [];
					var blockIndent = indentOf(this.lines[i + 1]);
					for (var j = i + 1; j < this.lines.length; j++) {
						if (indentOf(this.lines[j]) >= blockIndent) {
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
					blockFound = true;
					i = j - 1;
				}
			}
			if (!blockFound) {
				this.children[i] = renderLine(this.lines[i].trim(), new Location(this.lines[i], 1), (this.nameToId).bind(this));
			}
		}
	}

	nameToId(nameString, nameType) {
		var block;
		if (this.hasScope) {
			block = this;
		} else {
			block = this.parent;
		}
		var prefix;
		if (nameType == type.var) {
			prefix = "v";
		} else if (nameType == type.function) {
			prefix = "f";
		}
		var index = block.names[nameType].indexOf(nameString);
		if (index == -1) {
			block.names[nameType].push(nameString);
			index = block.names[nameType].length - 1;
		}
		return prefix + index.toString(16);
	}

	unduplicateScope() {
		for (var i = 0; i < this.children.length; i++) {
			if (this.children[i] instanceof Block) {
				this.children[i].eraseNames(this.names);
			}
		}
	}

	eraseNames(names) {
		for (var type in names) {
			for (var i = 0; i < names[type].length; i++) {
				if (this.names[type].indexOf(names[type][i]) != -1) {
					this.names[type].splice(i, 1);
				}
			}
		}
		if (this.children[i] instanceof Block) {
			this.children[i].eraseNames(this.names);
		}
	}
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
				if (spacesInRow > maxSpaces) {
					maxSpaces = spacesInRow;
				}
				spacesInRow = 0;
			}
		}
		if (maxSpaces >= 2 && (smallestIndent == -1 || maxSpaces < smallestIndent)) {
			smallestIndent = maxSpaces;
		}
	}
	if (smallestIndent == -1) smallestIndent = 0;
	var indent = " ".repeat(smallestIndent);
	for (var i = 0; i < lines.length; i++) {
		lines[i] = lines[i].replace(indent, "\t");
	}

	var parts = [new Block(lines, "main", null)];
	// console.log(JSON.stringify(parts, null, 2));
	// parts[0].unduplicateScope();

	var foundBlock = true;
	while (foundBlock) {
		foundBlock = false;
		for (var i = 0; i < parts.length; i++) {
			if (parts[i] instanceof Block) {
				var a = [];
				a.push(keywords[parts[i].keyword](parts[i]));
				if (parts[i].hasScope) {
					var names = [];
					for (var j = 0; j < parts[i].names[type.var].length; j++) {
						names.push("v" + j.toString(16));
					}
					if (Object.keys(names).length > 0) {
						a.push("Var " + Object.values(names).join(",") + ";");
					}
				}
				var children = parts[i].children;
				for (var j = 0; j < children.length; j++) {
					if (typeof children[j] == "string") {
						children[j] += ";";
					}
				}
				a.push(...children);
				a.push("}");
				parts.splice(i, 1);
				parts.splice(i, 0, ...a);
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
