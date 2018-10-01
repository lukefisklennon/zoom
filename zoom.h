#include <string>
#include <cstdint>

using namespace std;

namespace zoom {
	typedef double Number;
	typedef bool Boolean;
	typedef string String;

	enum class Type : uint8_t {
		number,
		boolean,
		string,
		undefined
	};

	struct Var {
		Type type;
		union {
			Number number;
			Boolean boolean;
			String *string;
		};

		Var() {
			type = Type::undefined;
		}

		Var(double value) {
			type = Type::number;
			number = value;
		}
	};
}

/*
#include <iostream>
#include <cstdint>

enum E : uint8_t {a, b, c};

struct S {
  E e;
  int i;
};

int main() {
  std::cout << sizeof(E) << " + " << sizeof(int) << " = " << sizeof(S) << std::endl;
}
*/
