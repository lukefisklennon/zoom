import sys
from lexer import lex
import tree

with open(sys.argv[1], "r") as file: input = file.read().strip()

tokens = lex(input)
print("Result:", tree.Block(tokens))
