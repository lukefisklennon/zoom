#include <iostream>

void __print(Var *v, bool endLine) {
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
	case UNDEFINED:
	default:
		std::cout << "undefined";
		break;
	}
	if (endLine) {
		std::cout << std::endl;
	}
}

Var print(Var var) {
	__print(&var, true);
	return Var();
}

Var input(Var var) {
	if (var.type != UNDEFINED) {
		__print(&var, false);
	}
	String in;
	std::getline(std::cin, in);
	return Var(in);
}

Var _type(Var *v) {
	switch (v->type) {
	case NUMBER:
		return Var("number");
		break;
	case BOOLEAN:
		return Var("boolean");
		break;
	case STRING:
		return Var("string");
		break;
	case ARRAY:
		return Var("array");
		break;
	}
	return Var();
}

Var _type(Var v) {
	return _type(&v);
}

Var _length(Var *v) {
	switch (v->type) {
	case STRING:
		return Var(v->string.size());
		break;
	case ARRAY:
		return Var(v->array.size());
		break;
	}
	return Var();
}

Var _append(Var *v, Var item) {
	if (v->type == ARRAY) {
		v->array.push_back(item);
	}
	return Var();
}
