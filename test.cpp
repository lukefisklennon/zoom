#include "zoom.h"
#include <iostream>
using namespace std;
int main(int argc,char *argv[]){Var v0,v1,v2;assignNumber(&v0,1);assignNumber(&v1,2);assignNumber(&v2,3);calc(DIVIDE,1,2.0,calc(ADD,2,calc(MULTIPLY,1,v2.number),4.0,calc(ADD,2,v0.number,v1.number)));}