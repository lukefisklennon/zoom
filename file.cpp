#include <iostream>
#include "zoom.h"

using namespace std;
using namespace zoom;

int main() {
	Var a(123);
	cout << sizeof(a.type) << ", " << sizeof(a.number) << ", " << sizeof(a.boolean) << ", " << sizeof(a.string) << ", " << endl;
	return 0;
}
