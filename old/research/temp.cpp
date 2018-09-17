#include <iostream>

struct Number {
	int value;
	Number(int n) {
		value = n;
	}
	Number *operator&() {
		return this;
	}
};

void print(Number *number) {
	std::cout << number->value << std::endl;
}

int main() {
	Number example(123);
	print(&example);
	print(&Number(456));
}
