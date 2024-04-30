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

.balign 4
f_signed:
    // W0=a, W1=b
    cmp w0, w1
    bgt .L19 // Branch if Greater Than (a>b)
    beq .L20 // Branch if Equal (a==b)
    bge .L15 // Branch if Greater than or Equal (a>=b) (impossible
    here)
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

f_unsigned:
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

main:
    stp x29, x30, [sp, -16]!
    mov x29, sp
    adrp x0, .LC12 // "f_signed"
    str x1, [x29,40]
    add x0, x0, :lo12:.LC12
    bl puts
    mov w1, 2
    mov w0, 1
    bl f_signed(int, int)
    mov w1, 1
    mov w0, 1
    bl f_signed(int, int)
    mov w1, 1
    mov w0, 2
    bl f_signed(int, int)
    adrp x0, .LC13 // "f_unsigned"
    str x1, [x29,40]
    add x0, x0, :lo12:.LC13
    bl puts
    mov w1, 2
    mov w0, 1
    bl f_unsigned(unsigned int, unsigned int)
    mov w1, 1
    mov w0, 1
    bl f_unsigned(unsigned int, unsigned int)
    mov w1, 1
    mov w0, 2
    bl f_unsigned(unsigned int, unsigned int)
    mov w0, 0
    ldp x29, x30, [sp], 16
    ret

