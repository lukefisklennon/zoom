#include "zoom.h"
#include <iostream>
using namespace std;
int main(int argc,char *argv[]){Var v0,v1;assign(&v0,input(1,Var("Enter favourite number: ")));assign(&v1,input(1,Var("Enter second favourite number: ")));print(1,Var(concat(4,Var("Actually your favourite numbers are "),Var(calc(ADD,2,v0,v1)),Var(" and "),Var(calc(MULTIPLY,2,v0,v1)))));}