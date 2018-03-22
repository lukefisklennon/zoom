#include "zoom.h"
#include <iostream>

using namespace std;

int main(int argc,char *argv[]){
	Var *v0 = new Var();
	v0->assignNumber(add(7,1.0,0.0,23.4,0.0,19.0,0.0,17.0));
	cout << v0->vnumber << endl;
}
