import syntax

class Token:
	def __init__(self, type, value = None):
		self.type = type
		self.value = value

	def __repr__(self):
		if self.value:
			return self.type + ": " + self.value
		else:
			return self.type

class Bracket(Token):
	def __init__(self, value, index):
		super().__init__("bracket", value)
		self.direction = (index * 2 - 1) * -1

def lex(string):
	string = string.replace("\r\n", "\n").replace("\r", "\n") + " "
	tokens = []
	brackets = {pair: 0 for pair in syntax.brackets}
	current = None
	i = 0
	while i < len(string):
		c = string[i]
		if not current:
			if c in syntax.labelStart:
				current = Token("label", c)
			elif c in syntax.numberStart:
				current = Token("number", c)
			elif c in syntax.string:
				current = Token("string", string[i + 1])
				i += 1
			elif (c in syntax.terminators and
				  not brackets[max(brackets, key = brackets.get)] and
				  len(tokens) > 0 and
				  not tokens[-1].type in ("terminator", "bracket")):
				tokens.append(Token("terminator"))
			else:
				for pair in syntax.brackets:
					if c in pair:
						index = pair.index(c)
						if index == 0:
							brackets[pair] += 1
						elif index == 1:
							brackets[pair] -= 1
						tokens.append(Bracket(c, index))
						break
				else:
					for symbol in syntax.symbols:
						sub = string[i : i + len(symbol)]
						if sub == symbol:
							tokens.append(Token("symbol", symbol))
							i += len(symbol) - 1
							break
		else:
			ended = False
			if current.type == "label": ended = c not in syntax.label
			if current.type == "string": ended = c in syntax.string
			if current.type == "number":
				ended = (c not in syntax.number or
				        (c == syntax.numberDecimal and syntax.numberDecimal in current.value))
			if ended:
				tokens.append(current)
				if current.type != "string": i -= 1
				current = None
			else:
				current.value += c
		i += 1
	return tokens
