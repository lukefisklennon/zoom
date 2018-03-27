var include = require(__dirname + "/include.js");

var util = include("util");

var keywords = {
	"if": {

	},
	"while": {

	},
	"for": {

	},
	"function": {

	}
}

class Block {
	constructor(string) {
		this.string = string;
		this.lines = string.split("\n");
		for (var i = 0; i < this.lines.length; i++) {
			this.lines[i] = util.formatLine(this.lines[i]);
			for (var keyword in keywords) {
				if (this.lines[i].indexOf(keyword) == 0) {
					this.lines[i] = this.lines[i].substring(keyword.length, this.lines[i].length);
				}
			}
		}
		console.log(this.lines);
	}
}

module.exports = function(string) {
	var block = new Block(string);
}
