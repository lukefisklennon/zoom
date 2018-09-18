import syntax

class Token:
	def __init__(self, type, value):
		self.type = type
		self.value = value

	def __repr__(self):
		return self.type + ": " + self.value

def lex(string):
	string += " "
	tokens = []
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
			else:
				for symbol in syntax.symbols:
					sub = string[i : i + len(symbol)]
					if sub == symbol:
						tokens.append(Token("symbol", sub))
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
