#include "zoom.h"
#include <iostream>
using namespace std;
int main(int argc,char *argv[]){Var v0,v1,v2,v3,v4;print(1,v0);assign(&v1,input(0));print(1,Var("What is your second favourite number?"));assign(&v2,input(0));print(2,v3,Var(concat(4,v4,Var(calc(ADD,2,v1,v2)),Var(" and "),Var(calc(MULTIPLY,2,v1,v2)))));}