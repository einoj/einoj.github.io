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
