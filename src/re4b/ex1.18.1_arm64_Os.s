.LC9:
        .string "a>b"
.LC10:
        .string "a==b"
.LC11:
        .string "a<b"


.balign 4
f_signed:
    // W0=a, W1=b
    cmp w0, w1
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
    // W0=a, W1=b
    cmp w0, w1
    beq .L26 // Branch if Equal (a==b)
    bhi .L25 // Branch if HIgher (a>b)
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

main:
    stp x29, x30, [sp, -16]!
    mov x29, sp
    mov w1, 1
    mov w0, 2
    bl f_signed
    mov w1, 2
    mov w0, 1
    bl f_unsigned
    mov w0, 0
    ldp x29, x30, [sp], 16
    ret

.globl main

