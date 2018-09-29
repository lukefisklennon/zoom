import string

class Operator:
	def __init__(self, string, number):
		self.string = string
		self.number = number

terminators = ["\n", ";"]
labelStart = string.ascii_letters + "$" + "_"
label = labelStart + string.digits
numberStart = string.digits
numberDecimal = "."
number = numberStart + numberDecimal
string = ["\"", "'"]
brackets = ["()", "[]", "{}"]
symbols = ["=", "==", "!=", "<", ">", "<=", ">=", "+=", "-=", "*=", "/=", "+", "-", "*", "/", "%", ",", "."]
symbols.sort(key = lambda symbol: len(symbol), reverse = True)
keywords = ["if", "while"]
operators = [Operator("=", 2), Operator("+", 2), Operator(".", 2)]
