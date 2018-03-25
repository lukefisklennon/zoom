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

Number add(int n, ...) {
	va_list args;
    va_start(args, n);
	Number result = 0;
	for (int i = 0; i < n; i++) {
		Number value = va_arg(args, Number);
		result += value;
	}
	va_end(args);
	return result;
}
