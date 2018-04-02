#include <iostream>
#include <termios.h>
#include <stdio.h>
#include <unistd.h>
#include <fcntl.h>

void initTermios(int echo);
void resetTermios(void);
char inputChar(int echo);

static struct termios oldChars, newChars;

int main() {
	char c;
	std::string input;

	do {
		c = inputChar(true);
		input += c;
	} while (c != '\n');

	std::cout << input << std::endl;

	return 0;
}

void initTermios(int echo) {
	fcntl(0, F_SETFL, O_NONBLOCK);
	tcgetattr(0, &oldChars);
	newChars = oldChars;
	newChars.c_lflag &= ~ICANON;
	newChars.c_lflag &= echo ? ECHO : ~ECHO;
	tcsetattr(0, TCSANOW, &newChars);
}

void resetTermios(void) {
	tcsetattr(0, TCSANOW, &oldChars);
}

char inputChar(int echo) {
	char c;
	initTermios(echo);
	c = getchar();
	resetTermios();
	return c;
}
