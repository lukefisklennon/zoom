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

using namespace std;

typedef unsigned char byte;

struct Var {
	byte type;
	double vnumber;
	bool vboolean;
	string vstring;
	Var() {
		type = UNDEFINED;
	}
}

void assignVar(Var *v1, Var* v2) {
	v1->type = v2->type;
	if (v1->type != UNDEFINED) {
		switch (v1->type) {
		case NUMBER:
			v1->vnumber = v2->vnumber;
			break;
		case BOOLEAN:
			v1->vboolean = v2->vboolean;
			break;
		case STRING:
			v1->vstring = v2->vstring;
			break;
		}
	}
}

void assignNumber(Var *v, double n) {
	type = NUMBER;
	vnumber = n;
}
void assignBoolean(Var *v, bool b) {
	type = BOOLEAN;
	vboolean = b;
}
void assignString(Var *v, std::string s) {
	type = STRING;
	vstring = s;
}

int add(int n, ...) {
	va_list args;
    va_start(args, n);
	double result = 0;
	for (int i = 0; i < n; i++) {
		double arg = va_arg(args, double);
		result += va_arg(args, double);
	}
	va_end(args);
	return result;
}
