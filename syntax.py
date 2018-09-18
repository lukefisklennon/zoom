import string

labelStart = string.ascii_letters + "$" + "_"
label = labelStart + string.digits
numberStart = string.digits
numberDecimal = "."
number = numberStart + numberDecimal
string = ["\"", "'"]
symbols = ["=", "+"]
symbols.sort(key = lambda symbol: len(symbol))

# operators = []
#
# class Operator:
# 	def __init__(self, string, number):
# 		self.string = string
# 		self.name = name
# 		self.number = number
# 		operators.append(self)
#
# Operator("=", "assign", 2)
# Operator("+=", "add", 2)
# operators.sort(key=lambda operator: len(operator.symbol), reverse=True)
