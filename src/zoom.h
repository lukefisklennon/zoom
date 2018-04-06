// std::cout<<v0.number<<std::endl;

#include <iostream>
#include <string>
#include <sstream>
#include <vector>
#include <cmath>
#include <cstddef>
#include <cstdarg>
#include <cstring>

#include "lib.h"

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
#define POWER 5
#define REMAINDER 6

#define ARGS int argc, ...
#define START_ARGS va_list args;va_start(args,argc);
#define START_LOOP for(int i=0;i<argc;i++){GET_ARG
#define GET_ARG Var arg=va_arg(args,Var);
#define END_LOOP }
#define END_ARGS va_end(args);

typedef unsigned char byte;

struct Var;
typedef double Number;
typedef bool Boolean;
typedef std::string String;
typedef std::vector<Var> Array;

void assign(Var *v1, Var *v2);
void assign(Var *v1, Var v2);
void assign(Var *v, Number n);
void assign(Var *v, Boolean b);
void assign(Var *v, String s);
void assign(Var *v, const char *s);
void assign(Var *v, const std::initializer_list<Var>& a);
Var access(Var *v, Var *key);
Var access(Var *v, Var key);
bool compare(bool inverse, Var *v1, Var *v2);
bool compare(bool inverse, Var v1, Var v2);
bool compare(bool inverse, Var *v1, Var v2);
bool compare(bool inverse, Var v1, Var *v2);
bool gt(bool inverse, Var *v1, Var *v2);
bool gt(bool inverse, Var v1, Var v2);
bool gt(bool inverse, Var *v1, Var v2);
bool gt(bool inverse, Var v1, Var *v2);
bool lt(bool inverse, Var *v1, Var *v2);
bool lt(bool inverse, Var v1, Var v2);
bool lt(bool inverse, Var *v1, Var v2);
bool lt(bool inverse, Var v1, Var *v2);
Number toNumber(Var *v);
Var calc(byte operation, ARGS);
Var mcalc(byte operation, Var *v1, Var *v2);
Var mcalc(byte operation, Var v1, Var v2);
Var mcalc(byte operation, Var *v1, Var v2);
Var mcalc(byte operation, Var v1, Var *v2);
Var concat(ARGS);
Var mconcat(Var *v1, Var *v2);
Var mconcat(Var v1, Var v2);
Var mconcat(Var *v1, Var v2);
Var mconcat(Var v1, Var *v2);
bool toBoolean(Var *v);
bool toBoolean(Number n);
bool toBoolean(Boolean b);
bool toBoolean(const char *s);
void print(Var *v, bool endLine);
Var print(Var var);
Var input(Var var);

struct Var {
	byte type;
	Number number;
	Boolean boolean;
	String string;
	Array array;
	Var(const Var &v) {
		this->type = v.type;
		if (this->type != UNDEFINED) {
			switch (this->type) {
			case NUMBER:
				this->number = v.number;
				break;
			case BOOLEAN:
				this->boolean = v.boolean;
				break;
			case STRING:
				this->string = v.string;
				break;
			}
		}
	}
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
	Var(const std::initializer_list<Var>& a) {
		array.assign(a);
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

void assign(Var *v1, Var v2) {
	assign(v1, &v2);
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

void assign(Var *v, const std::initializer_list<Var>& a) {
	v->type = ARRAY;
	v->array.assign(a);
}

Var access(Var *v, Var *key) {
	switch (v->type) {
	case ARRAY:
		return v->array[toNumber(key)];
		break;
	}
}

Var access(Var *v, Var key) {
	return access(v, &key);
}

bool compare(bool inverse, Var *v1, Var *v2) {
	bool result = v1->type == v2->type;
	if (result) {
		switch (v1->type) {
		case NUMBER:
			result = v1->number == v2->number;
			break;
		case BOOLEAN:
			result = v1->boolean == v2->boolean;
			break;
		case STRING:
			result = v1->string == v2->string;
			break;
		}
	}
	if (inverse) result = !result;
	return result;
}

bool compare(bool inverse, Var v1, Var v2) {
	return compare(inverse, &v1, &v2);
}

bool compare(bool inverse, Var *v1, Var v2) {
	return compare(inverse, v1, &v2);
}

bool compare(bool inverse, Var v1, Var *v2) {
	return compare(inverse, &v1, v2);
}

bool gt(bool inverse, Var *v1, Var *v2) {
	bool result = v1->type == v2->type;
	if (result) {
		switch (v1->type) {
		case NUMBER:
			result = v1->number > v2->number;
			break;
		case BOOLEAN:
			result = v1->boolean > v2->boolean;
			break;
		}
	}
	if (inverse) result = !result;
	return result;
}

bool gt(bool inverse, Var v1, Var v2) {
	return gt(inverse, &v1, &v2);
}

bool gt(bool inverse, Var *v1, Var v2) {
	return gt(inverse, v1, &v2);
}

bool gt(bool inverse, Var v1, Var *v2) {
	return gt(inverse, &v1, v2);
}

bool lt(bool inverse, Var *v1, Var *v2) {
	bool result = v1->type == v2->type;
	if (result) {
		switch (v1->type) {
		case NUMBER:
			result = v1->number < v2->number;
			break;
		case BOOLEAN:
			result = v1->boolean < v2->boolean;
			break;
		}
	}
	if (inverse) result = !result;
	return result;
}

bool lt(bool inverse, Var v1, Var v2) {
	return lt(inverse, &v1, &v2);
}

bool lt(bool inverse, Var *v1, Var v2) {
	return lt(inverse, v1, &v2);
}

bool lt(bool inverse, Var v1, Var *v2) {
	return lt(inverse, &v1, v2);
}

Number toNumber(Var *v) {
	switch (v->type) {
	case NUMBER:
		return v->number;
		break;
	case BOOLEAN:
		if (v->boolean) {
			return 1.0;
		} else {
			return 0.0;
		}
		break;
	case STRING:
		return std::stod(v->string);
		break;
	}
	return 0.0;
}

Var calc(byte operation, ARGS) {
	Number result;
	START_ARGS
	START_LOOP
	Number number = toNumber(&arg);
	if (i == 0) {
		result = number;
	} else {
		switch (operation) {
		case ADD:
			result += number;
			break;
		case SUBTRACT:
			result -= number;
			break;
		case MULTIPLY:
			result *= number;
			break;
		case DIVIDE:
			result /= number;
			break;
		case POWER:
			result = pow(result, number);
			break;
		case REMAINDER:
			result = fmod(result, number);
			break;
		}
	}
	END_LOOP
	END_ARGS
	return Var(result);
}

Var mcalc(byte operation, Var *v1, Var *v2) {
	assign(v1, calc(operation, 2, *v1, *v2));
	return *v1;
}

Var mcalc(byte operation, Var v1, Var v2) {
	assign(&v1, calc(operation, 2, v1, v2));
	return v1;
}

Var mcalc(byte operation, Var *v1, Var v2) {
	assign(v1, calc(operation, 2, *v1, v2));
	return *v1;
}

Var mcalc(byte operation, Var v1, Var *v2) {
	assign(&v1, calc(operation, 2, v1, *v2));
	return v1;
}

Var concat(ARGS) {
	std::stringstream result;
	START_ARGS
	START_LOOP
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
	END_LOOP
	END_ARGS
	return Var(result.str());
}

Var mconcat(Var *v1, Var *v2) {
	assign(v1, concat(2, *v1, *v2));
	return *v1;
}

Var mconcat(Var v1, Var v2) {
	assign(&v1, concat(2, v1, v2));
	return v1;
}

Var mconcat(Var *v1, Var v2) {
	assign(v1, concat(2, *v1, v2));
	return *v1;
}

Var mconcat(Var v1, Var *v2) {
	assign(&v1, concat(2, v1, *v2));
	return v1;
}

bool toBoolean(Var *v) {
	switch (v->type) {
	case STRING:
		return (v->string.length() != 0);
		break;
	case NUMBER:
		return (v->number != 0);
		break;
	case BOOLEAN:
		return v->boolean;
		break;
	}
}

bool toBoolean(Number n) {
	return (n != 0);
}

bool toBoolean(Boolean b) {
	return b;
}

bool toBoolean(const char *s) {
	return (strlen(s) != 0);
}

void print(Var *v, bool endLine) {
	switch (v->type) {
	case STRING:
		std::cout << v->string;
		break;
	case NUMBER:
		std::cout << v->number;
		break;
	case BOOLEAN:
		std::cout << v->boolean;
		break;
	}
	if (endLine) {
		std::cout << std::endl;
	}
}

Var print(Var var) {
	print(&var, true);
	return Var();
}

Var input(Var var) {
	if (var.type != UNDEFINED) {
		print(&var, false);
	}
	String in;
	std::getline(std::cin, in);
	return Var(in);
}
