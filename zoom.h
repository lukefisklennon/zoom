#include <cstddef>
#include <string>
#include <cstdarg>
#include <iostream>

#define UNDEFINED 0
#define NUMBER 1
#define BOOLEAN 2
#define STRING 3
#define OBJECT 4
#define ARRAY 5
#define VAR 255

#define ADD 1
#define SUBTRACT 2
#define MULTIPLY 3
#define DIVIDE 4

typedef unsigned char byte;

typedef double Number;
typedef bool Boolean;
typedef std::string String;

struct Var {
	byte type;
	Number number;
	Boolean boolean;
	String string;
	Var() {
		type = UNDEFINED;
	}
};

void assignVar(Var *v1, Var* v2) {
	v1->type = v2->type;
	if (v1->type != UNDEFINED) {
		switch (v1->type) {
		case NUMBER:
			v1->number = v2->number;
			break;
		case BOOLEAN:
			v1->boolean = v2->boolean;
			break;
		case STRING:
			v1->string = v2->string;
			break;
		}
	}
}

void assignNumber(Var *v, Number n) {
	v->type = NUMBER;
	v->number = n;
}

void assignBoolean(Var *v, Boolean b) {
	v->type = BOOLEAN;
	v->boolean = b;
}

void assignString(Var *v, String s) {
	v->type = STRING;
	v->string = s;
}

Number calc(byte operation, int n, ...) {
	va_list args;
    va_start(args, n);
	Number result = 0;
	if (operation == MULTIPLY || operation == DIVIDE) {
		result = 1;
	}
	for (int i = 0; i < n; i++) {
		Number value = va_arg(args, Number);
		switch (operation) {
		case ADD:
			result += value;
			break;
		case SUBTRACT:
			if (i == 0) {
				result += value;
			} else {
				result -= value;
			}
			break;
		case MULTIPLY:
			result *= value;
			break;
		case DIVIDE:
			result /= value;
			break;
		}
	}
	va_end(args);
	return result;
}

void print(int n, ...) {
	va_list args;
    va_start(args, n);
	for (int i = 0; i < n; i++) {
		byte type = va_arg(args, unsigned int);
		if (type == VAR) {
			Var value = va_arg(args, Var);
			switch (value.type) {
			case STRING:
				std::cout << value.string << std::endl;
				break;
			case NUMBER:
				std::cout << value.number << std::endl;
				break;
			case BOOLEAN:
				std::cout << value.boolean << std::endl;
				break;
			}
		} else {
			switch (type) {
			case STRING:
				std::cout << va_arg(args, char *) << std::endl;
				break;
			case NUMBER:
				std::cout << va_arg(args, Number) << std::endl;
				break;
			case BOOLEAN:
				std::cout << va_arg(args, int) << std::endl;
				break;
			}
		}
	}
	va_end(args);
}
