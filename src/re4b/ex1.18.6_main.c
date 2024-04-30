#include <stdio.h>
extern const char* f (int a);

int main(void) {
	printf("%s\n", f(10));
	printf("%s\n", f(9));
	return 0;
}
