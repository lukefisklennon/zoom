#include "zoom.h"
int main(int argc,char *argv[]){Var v0,v1,v2,v3,v4,v5;assign(&v0,input(1,Var("Enter a number: ")));assign(&v1,0.0);assign(&v2,"");assign(&v3,1.0);while(toBoolean(lt(v3,calc(ADD,2,v0,Var(1.0))))){assign(&v1,calc(ADD,2,v1,v3));assign(&v2,concat(2,v2,v3));if(toBoolean(compare(true,concat(2,v3,Var("")),v0))){assign(&v2,concat(2,v2,Var(" + ")));}assign(&v3,calc(ADD,2,v3,Var(1.0)));}print(1,concat(3,v2,Var(" = "),v1));}