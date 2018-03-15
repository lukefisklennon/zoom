#include <cstddef>
#include <string>
#include <cstdarg>
#include <iostream>

#define TX 0 // Type none
#define TN 1 // Type number
#define TB 2 // Type boolean
#define TS 3 // Type string
// #define OBJECT 4
// #define ARRAY 5
#define TV 6 // Type variable

using namespace std;

typedef unsigned char byte;

class V {
public:
	byte t;
	double vn;
	bool vb;
	string vs;
	V() {
		t = TX;
		vn = 0;
		vb = false;
		vs = "";
	}
	void av(V v) {
		t = v.t;
		e();
		if (t != TX) {
			switch (t) {
			case TN:
				vn = v.vn;
			case TB:
				vb = v.vb;
			case TS:
				vs = v.vs;
			}
		}
	}
	void an(double n) {
		t = TN;
		e();
		vn = n;
	}
	void ab(bool b) {
		t = TB;
		e();
		vb = b;
	}
	void as(std::string s) {
		t = TS;
		e();
		vs = s;
	}
	void e() {
		vn = 0;
		vb = false;
		vs = "";
	}
};

int op(int n, ...) {
	va_list args;
    va_start(args, n);
	byte types[n];
	for (int i = 0; i < n; i++) {
		cout << va_arg(args, int) << endl;
	}
	va_end(args);
	return 0;
}
