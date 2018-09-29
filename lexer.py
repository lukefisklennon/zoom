import syntax

class Token:
	def __init__(self, value = None):
		self.value = value

	def __repr__(self):
		if self.value:
			return self.__class__.__name__ + ": " + self.value
		else:
			return self.__class__.__name__

	def __eq__(self, other):
		return type(self) == type(other) and self.value == other.value

class Label(Token):
	def __init__(self, value):
		super().__init__(value)

class Symbol(Token):
	def __init__(self, value):
		super().__init__(value)

class Number(Token):
	def __init__(self, value):
		super().__init__(value)

class String(Token):
	def __init__(self, value):
		super().__init__(value)

class Terminator(Token):
	def __init__(self):
		super().__init__(None)

class Bracket(Token):
	def __init__(self, value, index):
		super().__init__(value)
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
				current = Label(c)
			elif c in syntax.numberStart:
				current = Number(c)
			elif c in syntax.string:
				current = String(string[i + 1])
				i += 1
			elif (c in syntax.terminators and
				  not brackets[max(brackets, key = brackets.get)] and
				  len(tokens) > 0 and
				  not (type(tokens[-1]) is Terminator or type(tokens[-1]) is Bracket)):
				tokens.append(Terminator())
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
							tokens.append(Symbol(symbol))
							i += len(symbol) - 1
							break
		else:
			ended = False
			if type(current) is Label: ended = c not in syntax.label
			if type(current) is String: ended = c in syntax.string
			if type(current) is Number:
				ended = (c not in syntax.number or
				        (c == syntax.numberDecimal and syntax.numberDecimal in current.value))
			if ended:
				tokens.append(current)
				if not type(current) is String: i -= 1
				current = None
			else:
				current.value += c
		i += 1
	return tokens
