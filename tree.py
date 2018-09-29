import syntax
import lexer

class Value:
	def __init__(self, string):
		self.string = string;

class Expression(list):
	def __init__(self, tokens):
		for operator in syntax.operators:
			token = lexer.Symbol(operator.string)
			if token in tokens:
				self.operator = operator
				index = tokens.index(token)
				sides = [tokens[0 : index], tokens[index + 1 : len(tokens)]]
				for side in sides:
					if len(side) == 1:
						self.append(side[0])
					elif len(side) > 1:
						self.append(Expression(side))
				break

	def __repr__(self):
		return self.operator.string + super().__repr__()

class Block(list):
	def __init__(self, tokens):
		tokens.append(lexer.Terminator())
		current = []
		for token in tokens:
			if not type(token) is lexer.Terminator:
				current.append(token)
			else:
				if len(current) == 1:
					self.append(current[0])
				elif len(current) > 1:
					self.append(Expression(current))
				current = []
