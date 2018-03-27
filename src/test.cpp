#include "zoom.h"
#include <iostream>
using namespace std;
int main(int argc,char *argv[]){Var v0,v1;assign(&v0,"iO Ninja");assign(&v1,16.0);print(1,Var(concat(5,Var("My name is "),v0,Var(" and I'm "),v1,Var(" years old"))));}