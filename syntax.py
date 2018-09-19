import string

terminators = ["\n", ";"]
labelStart = string.ascii_letters + "$" + "_"
label = labelStart + string.digits
numberStart = string.digits
numberDecimal = "."
number = numberStart + numberDecimal
string = ["\"", "'"]
brackets = ["()", "[]", "{}"]
symbols = ["=", "==", "!=", "<", ">", "<=", ">=", "+=", "-=", "*=", "/=", "+", "-", "*", "/", "%", ",", "."]
for pair in brackets: symbols += list(pair)
symbols.sort(key = lambda symbol: len(symbol))
