#include "zoom.h"
Var f0(Var v0){return(calc(MULTIPLY,2,v0,Var(2.0)));return Var();}int main(int argc,char *argv[]){Var v0;assign(&v0,input(Var("Enter a number: ")));assign(&v0,f0(v0));print(v0);return 0;}
