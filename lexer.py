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

# Next: brackets as their own type, prevent multiple terminators, prevent terminators after brackets, add keywords

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
			elif c in syntax.terminators and not brackets[max(brackets, key = brackets.get)]:
				tokens.append(Token("terminator"))
			else:
				for symbol in syntax.symbols:
					sub = string[i : i + len(symbol)]
					if sub == symbol:
						bracket = [(pair, pair.index(symbol)) for pair in syntax.brackets if symbol in pair]
						if bracket:
							pair, index = bracket[0]
							if index == 0:
								brackets[pair] += 1
							elif index == 1:
								brackets[pair] -= 1
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
