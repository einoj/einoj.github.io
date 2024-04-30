---
layout: post
title: Simplify RE4B example 1.18.1 arm64 example
date: Sat Mar 25 2023
---
Recently I started reading `Reverse Engineering for Beginners` by Dennis
Yurichev to learn x86 and arm64 assembly. Chapter 1.18.1 on conditional
jumps has an interesting arm64 exercise, so I thought I'd go through it
step by step. The sauce is as follows: 

```C
#include <stdio.h>
void f_signed (int a, int b)
{
    if (a>b)
        printf ("a>b\n");
    if (a==b)
        printf ("a==b\n");
    if (a<b)
        printf ("a<b\n");
};
void f_unsigned (unsigned int a, unsigned int b)
{
    if (a>b)
        printf ("a>b\n");
    if (a==b)
        printf ("a==b\n");
    if (a<b)
        printf ("a<b\n");
};
int main()
{
    f_signed(1, 2);
    f_unsigned(1, 2);
    return 0;
};
```

Dennis's arm64 compiler (gcc Linaro 4.9) generates this "optimzed" code
for the two `f_*` functions:

```asm
f_signed (int a, int b):
    // W0=a, W1=b
    cmp w0, w1
    bgt .L19 // Branch if Greater Than (a>b)
    beq .L20 // Branch if Equal (a==b)
    bge .L15 // Branch if Greater than or Equal (a>=b) (impossible here)
    // a<b
    adrp x0, .LC11 // "a<b"
    add x0, x0, :lo12:.LC11
    b puts
.L19:
    adrp x0, .LC9 // "a>b"
    add x0, x0, :lo12:.LC9
    b puts
.L15: // impossible to get here
    ret
.L20:
    adrp x0, .LC10 // "a==b"
    add x0, x0, :lo12:.LC10
    b puts

f_unsigned (unsigned int a, unsigned int b):
    stp x29, x30, [sp, -48]!
    // W0=a, W1=b
    cmp w0, w1
    add x29, sp, 0
    str x19, [sp,16]
    mov w19, w0
    bhi .L25 // Branch if HIgher (a>b)
    cmp w19, w1
    beq .L26 // Branch if Equal (a==b)
.L23:
    bcc .L27 // Branch if Carry Clear (if less than) (a<b)
    // function epilogue, impossible to be here
    ldr x19, [sp,16]
    ldp x29, x30, [sp], 48
    ret
.L27:
    ldr x19, [sp,16]
    adrp x0, .LC11 // "a<b"
    ldp x29, x30, [sp], 48
    add x0, x0, :lo12:.LC11
    b puts
.L25:
    adrp x0, .LC9 // "a>b"
    str x1, [x29,40]
    add x0, x0, :lo12:.LC9
    bl puts
    ldr x1, [x29,40]
    cmp w19, w1
    bne .L23 // Branch if Not Equal
.L26:
    ldr x19, [sp,16]
    adrp x0, .LC10 // "a==b"
    ldp x29, x30, [sp], 48
    add x0, x0, :lo12:.LC10
    b puts
```

This code contains dead code\[1\] and redundant instructions which the
author asks us to remove.

## Make the code runnable
Before we start I had to add a few things to get the code to assemble
and run (with aarch64-gcc 12.2.1):

1. The strings 

```asm
.LC9:
        .string "a>b"
.LC10:
        .string "a==b"
.LC11:
        .string "a<b"
.LC12:
        .string "f_signed:"
.LC13:
        .string "\nf_unsigned:"
```

2. The main function
```asm
.globl main
main:
    stp x29, x30, [sp, -16]!
    mov x29, sp
    adrp x0, .LC12 // "f_signed"
    str x1, [x29,40]
    add x0, x0, :lo12:.LC12
    bl puts
    mov w1, 2
    mov w0, 1
    bl f_signed
    mov w1, 1
    mov w0, 1
    bl f_signed
    mov w1, 1
    mov w0, 2
    bl f_signed
    adrp x0, .LC13 // "f_unsigned"
    str x1, [x29,40]
    add x0, x0, :lo12:.LC13
    bl puts
    mov w1, 2
    mov w0, 1
    bl f_unsigned
    mov w1, 1
    mov w0, 1
    bl f_unsigned
    mov w1, 1
    mov w0, 2
    bl f_unsigned
    mov w0, 0
    ldp x29, x30, [sp], 16
    ret
```

3. Change the function signatures:
```asm
    f_signed(int, int)
    f_unsigned(unsigned int, unsigned int)
```
becomes just
```asm
    f_signed
    f_unsigned
```

4. align the f_signed function
```asm
.balign 4
f_signed:
```

Now we can assemble and run
```bash
qemu-aarch64:~$ gcc ex.s -o ex
qemu-aarch64:~$ ./ex
f_signed:
a<b
a==b
a>b

f_unsigned:
a<b
a==b
a>b
```

## Remove dead code
Let's start easy by removing, and move the LDP (Load Pair) call
restoring x29, x30 and the stack pointer into label `.L25`. The `bl`
call in `.L25` also needs to be converted to a `b` call since `bl`
modifies the r14 return register making us return to the instruction
immediately below instead of back to main. These changes results in the
following diff:

<pre><b>--- ex1.18.1_arm64.s</b>	<b>2023-03-25 14:20:13.382373022 +0100</b>
<b>+++ tmp.s</b>	<b>2023-03-25 14:20:20.866261321 +0100</b>
<font color="#2AA1B3">@@ -15,8 +15,6 @@</font>
     cmp w0, w1
     bgt .L19 // Branch if Greater Than (a&gt;b)
     beq .L20 // Branch if Equal (a==b)
<font color="#C01C28">-    bge .L15 // Branch if Greater than or Equal (a&gt;=b) (impossible</font>
<font color="#C01C28">-    here)</font>
     // a&lt;b
     adrp x0, .LC11 // &quot;a&lt;b&quot;
     add x0, x0, :lo12:.LC11
<font color="#2AA1B3">@@ -25,8 +23,6 @@</font>
     adrp x0, .LC9 // &quot;a&gt;b&quot;
     add x0, x0, :lo12:.LC9
     b puts
<font color="#C01C28">-.L15: // impossible to get here</font>
<font color="#C01C28">-    ret</font>
 .L20:
     adrp x0, .LC10 // &quot;a==b&quot;
     add x0, x0, :lo12:.LC10
<font color="#2AA1B3">@@ -42,12 +38,6 @@</font>
     bhi .L25 // Branch if HIgher (a&gt;b)
     cmp w19, w1
     beq .L26 // Branch if Equal (a==b)
<font color="#C01C28">-.L23:</font>
<font color="#C01C28">-    bcc .L27 // Branch if Carry Clear (if less than) (a&lt;b)</font>
<font color="#C01C28">-    // function epilogue, impossible to be here</font>
<font color="#C01C28">-    ldr x19, [sp,16]</font>
<font color="#C01C28">-    ldp x29, x30, [sp], 48</font>
<font color="#C01C28">-    ret</font>
 .L27:
     ldr x19, [sp,16]
     adrp x0, .LC11 // &quot;a&lt;b&quot;
<font color="#2AA1B3">@@ -57,11 +47,9 @@</font>
 .L25:
     adrp x0, .LC9 // &quot;a&gt;b&quot;
     str x1, [x29,40]
<font color="#26A269">+    ldp x29, x30, [sp], 48</font>
     add x0, x0, :lo12:.LC9
<font color="#C01C28">-    bl puts</font>
<font color="#C01C28">-    ldr x1, [x29,40]</font>
<font color="#C01C28">-    cmp w19, w1</font>
<font color="#C01C28">-    bne .L23 // Branch if Not Equal</font>
<font color="#26A269">+    b puts</font>
 .L26:
     ldr x19, [sp,16]
     adrp x0, .LC10 // &quot;a==b&quot;
</pre>

Since the variables are stored in registers w0 and w1 and we don't use
the stack we can remove stp (Store Pair) call and the ldp calls, as well
as the `add x29, sp, 0` which stores the stack frame in register x29:
<pre><b>--- tmp.s</b>	<b>2023-03-25 14:42:53.258266321 +0100</b>
<b>+++ tmp2.s</b>	<b>2023-03-25 14:46:42.466947431 +0100</b>
<font color="#2AA1B3">@@ -29,10 +29,8 @@</font>
     b puts
 
 f_unsigned:
<font color="#C01C28">-    stp x29, x30, [sp, -48]!</font>
     // W0=a, W1=b
     cmp w0, w1
<font color="#C01C28">-    add x29, sp, 0</font>
     str x19, [sp,16]
     mov w19, w0
     bhi .L25 // Branch if HIgher (a&gt;b)
<font color="#2AA1B3">@@ -41,19 +39,16 @@</font>
 .L27:
     ldr x19, [sp,16]
     adrp x0, .LC11 // &quot;a&lt;b&quot;
<font color="#C01C28">-    ldp x29, x30, [sp], 48</font>
     add x0, x0, :lo12:.LC11
     b puts
 .L25:
     adrp x0, .LC9 // &quot;a&gt;b&quot;
     str x1, [x29,40]
<font color="#C01C28">-    ldp x29, x30, [sp], 48</font>
     add x0, x0, :lo12:.LC9
     b puts
 .L26:
     ldr x19, [sp,16]
     adrp x0, .LC10 // &quot;a==b&quot;
<font color="#C01C28">-    ldp x29, x30, [sp], 48</font>
     add x0, x0, :lo12:.LC10
     b puts
</pre>

We don't need to store variable a in register 19 either since we only
need to do the comparison once:

<pre><b>--- tmp2.s</b>	<b>2023-03-25 14:46:42.466947431 +0100</b>
<b>+++ tmp3.s</b>	<b>2023-03-25 14:51:52.947461862 +0100</b>
<font color="#2AA1B3">@@ -31,23 +31,17 @@</font>
 f_unsigned:
     // W0=a, W1=b
     cmp w0, w1
<font color="#C01C28">-    str x19, [sp,16]</font>
<font color="#C01C28">-    mov w19, w0</font>
     bhi .L25 // Branch if HIgher (a&gt;b)
<font color="#C01C28">-    cmp w19, w1</font>
     beq .L26 // Branch if Equal (a==b)
 .L27:
<font color="#C01C28">-    ldr x19, [sp,16]</font>
     adrp x0, .LC11 // &quot;a&lt;b&quot;
     add x0, x0, :lo12:.LC11
     b puts
 .L25:
     adrp x0, .LC9 // &quot;a&gt;b&quot;
<font color="#C01C28">-    str x1, [x29,40]</font>
     add x0, x0, :lo12:.LC9
     b puts
 .L26:
<font color="#C01C28">-    ldr x19, [sp,16]</font>
     adrp x0, .LC10 // &quot;a==b&quot;
     add x0, x0, :lo12:.LC10
     b puts
</pre>

Now we are left with the much smaller f functions:
```asm
f_signed:
    cmp w0, w1 // W0=a, W1=b
    bgt .L19 // Branch if Greater Than (a>b)
    beq .L20 // Branch if Equal (a==b)
    // a<b
    adrp x0, .LC11 // "a<b"
    add x0, x0, :lo12:.LC11
    b puts
.L19:
    adrp x0, .LC9 // "a>b"
    add x0, x0, :lo12:.LC9
    b puts
.L20:
    adrp x0, .LC10 // "a==b"
    add x0, x0, :lo12:.LC10
    b puts

f_unsigned:
    cmp w0, w1 // W0=a, W1=b
    bhi .L25 // Branch if HIgher (a>b)
    beq .L26 // Branch if Equal (a==b)
.L27:
    adrp x0, .LC11 // "a<b"
    add x0, x0, :lo12:.LC11
    b puts
.L25:
    adrp x0, .LC9 // "a>b"
    add x0, x0, :lo12:.LC9
    b puts
.L26:
    adrp x0, .LC10 // "a==b"
    add x0, x0, :lo12:.LC10
    b puts
```

# Footer
\[1\]: dead code is code that will never be executed
