import sys
from lexer import lex

with open(sys.argv[1], "r") as file: input = file.read().strip()

print(lex(input))
