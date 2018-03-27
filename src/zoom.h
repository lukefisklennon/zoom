// std::cout<<v0.number<<std::endl;

#include <cstddef>
#include <string>
#include <cstdarg>
#include <iostream>
#include <sstream>

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

#define ARGS int argc, ...
#define START va_list args;va_start(args,argc);for(int i=0;i<argc;i++){Var arg=va_arg(args,Var);
#define END }va_end(args);

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
	Var(Number n) {
		type = NUMBER;
		number = n;
	}
	Var(Boolean b) {
		type = BOOLEAN;
		boolean = b;
	}
	Var(String s) {
		type = STRING;
		string = s;
	}
	Var(const char *s) {
		type = STRING;
		string = String(s);
	}
};

void assign(Var *v1, Var* v2) {
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

void assign(Var *v, Number n) {
	v->type = NUMBER;
	v->number = n;
}

void assign(Var *v, Boolean b) {
	v->type = BOOLEAN;
	v->boolean = b;
}

void assign(Var *v, String s) {
	v->type = STRING;
	v->string = s;
}

void assign(Var *v, const char *s) {
	v->type = STRING;
	v->string = String(s);
}

// String toString(Var *v) {
// 	switch (v->type) {
// 	case STRING:
// 		return v->string;
// 		break;
// 	case NUMBER:
// 		return std::to_string(v->number);
// 		break;
// 	case BOOLEAN:
// 		if (v->boolean) {
// 			return "true";
// 		} else {
// 			return "false";
// 		}
// 		break;
// 	}
// 	return "";
// }

Number calc(byte operation, ARGS) {
	Number result = 0;
	if (operation == MULTIPLY || operation == DIVIDE) {
		result = 1;
	}
	START
	Number number = 0;
	if (arg.type == NUMBER) {
		number = arg.number;
	}
	switch (operation) {
	case ADD:
		result += number;
		break;
	case SUBTRACT:
		if (i == 0) {
			result += number;
		} else {
			result -= number;
		}
		break;
	case MULTIPLY:
		result *= number;
		break;
	case DIVIDE:
		result /= number;
		break;
	}
	END
	return result;
}

String concat(ARGS) {
	std::stringstream result;
	START
	switch (arg.type) {
	case STRING:
		result << arg.string;
		break;
	case NUMBER:
		result << arg.number;
		break;
	case BOOLEAN:
		result << arg.boolean;
		break;
	}
	END
	return result.str();
}

void print(ARGS) {
	START
	switch (arg.type) {
	case STRING:
		std::cout << arg.string << std::endl;
		break;
	case NUMBER:
		std::cout << arg.number << std::endl;
		break;
	case BOOLEAN:
		std::cout << arg.boolean << std::endl;
		break;
	}
	END
}
