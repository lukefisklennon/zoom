#include "zoom.h"
int main(int argc,char *argv[]){Var v0,v1,v2;assign(&v0,10.0);assign(&v1,1.0);assign(&v2,0.0);while(toBoolean(lt(v2,calc(ADD,2,v0,Var(1.0))))){assign(&v1,calc(ADD,2,v1,v2));assign(&v2,calc(ADD,2,v2,Var(1.0)));}print(1,v2);}
