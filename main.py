import sys
import os
from lexer import lex
import tree
from render import render

name = sys.argv[1]
with open(name, "r") as file: input = file.read().strip()

tokens = lex(input)
block = tree.Block(tokens)
output = render(block)

with open(name.split(".")[0] + ".cpp", "w") as file: file.write(output)

os.system("g++ -std=c++11 file.cpp -o file >/dev/null 2>&1")
