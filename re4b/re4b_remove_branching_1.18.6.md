---
layout: post
title:  Remove all conditional jump instructions in an arm64 function
date: Wed Apr 12 2023
tags: re4b
---

Chapter 1.18.6 has a simple exercise, remove all the conditional jumps and replace them with the CSEL instruction in the following function:

```asm
f:
    cmp x0, 10
    beq .L3 ; branch if equal
    adrp x0, .LC1 ; "it is ten"
    add x0, x0, :lo12:.LC1
    ret
.L3:
    adrp x0, .LC0 ; "it is not ten"
    add x0, x0, :lo12:.LC0
    ret
.LC0:
    .string "it is ten"
.LC1:
    .string "it is not ten"

```
C source:
```C
const char* f (int a)
{
	return a==10 ? "it is ten" : "it is not ten";
};

```

The reason for removing conditional jumps is because they are a form of branching. Modern CPUs attempts to guess the outcome of conditional operations by a technique called branch prediction. If the prediction is wrong the prediction CPU cycles are wasted, therefore we want to avoid the conditional jumps.

ARMs developer docs explains that CSEL has the following form\[0\]:
```
CSEL       Xd, Xn, Xm, cond
```
and function:
```
if cond then

  Xd = Xn

else

  Xd = Xm
```

Thus we can simply rewrite the function by putting pointers to the strings "it is ten string" and "it is not ten" in the x1 and x2 registers, and if the comparison with the function argument (a) and 10 is equal we put x1 in x0 else we put x2 in x0. Then we get:
```asm
.globl f
f:
	cmp x0, 10
	adrp x1, .LC0
	adrp x2, .LC1
	add x1,x1, :lo12:.LC0
	add x2,x2, :lo12:.LC1
	csel x0, x1, x2, EQ
	ret
.LC0:
	.string "it is ten"
.LC1:
	.string "it is not ten"
```

Which we can write a short main function to test with
```C
#include <stdio.h>
extern const char* f (int a);

int main(void) {
	printf("%s\n", f(10));
	printf("%s\n", f(9));
	return 0;
}
```
It works!
```shell
localhost:~# gcc -c ex1.18.6_main.c f.s && gcc ex1.18.6_main.o f.o -o ex1.18.6 && ./ex1.18.6
it is ten
it is not ten
localhost:~#
```

\[0\]: https://developer.arm.com/documentation/102374/0101/Program-flow---conditional-select-instructions
