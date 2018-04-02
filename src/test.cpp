#include "zoom.h"
Var f0(Var v0){print(concat(2,Var("Hello "),v0));return Var();}int main(int argc,char *argv[]){Var v0;assign(&v0,input(Var("Enter name: ")));f0(v0);return 0;}