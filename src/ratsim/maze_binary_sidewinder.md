---
layout: post
title: Generating mazes in rust using raylib
date: Mon Apr 29 2024
---

# Intro
I've been playing with the idea of making a simulator for a micro mouse me and a friend have been working on.
Why not get some rust expericence at the same time?! I'll use a raycaster I wrote using raylib and rust to display the mazes. The raycaster is based on the C project by justinac0 https://github.com/justinac0/raylib-raycaster. The algorithms used here are created from the spec given in the first chapter of Jamis Buck's Mazes for Programmers, great book so far!

## Goals for this post
- Generate random mazes using the binary tree algorithm
- Generate random mazes using the side winder algorithm
- Display the mazes in a raylib raycaster

## Out of scope
- Write a raycaster, since I've already implemented that 

# The Grid
I've not implemented any fancy object to represent the grid, all it is is a 2D
array where even rows and columns contain the mazes walls and the odd rows and
columns are the cells of the maze.

# Binary tree
Is the simplest of the two. My implementation starts in the upper left corner
and then randomly digs south or east before moving to the next column in the
row looping over all the cells in the grid once. Since the cells are at odd
rows and columns we loop over the cells by stepping by 2. In addition to this I
handle the literal edge cases; the right most column and bottom row.

```Rust
fn binary_tree() -> [[u8; maph]; mapl] {
    // binary tree algorithim starting in the north west corner
    // and generating a maze down and to the east.
    let mut map = [[1; mapl]; maph];

    for i in (1..mapl-1).step_by(2) {
        for j in (1..maph-1).step_by(2) {
            map[i][j] = 0;
            if i == mapl - 2 &&  j == maph -2 {
                continue;
            }
            if i == mapl - 2 {
                // dig east
                map[i][j+1] = 0;
                continue;
            }
            if j == maph - 2 {
                //dig south
                map[i+1][j] = 0;
                continue;
            }
            if rand::random::<bool>() {
                // dig east
                map[i+1][j] = 0;
            } else {
                map[i][j+1] = 0;
            }
        }
    }
    return map;
}

```

It produces an OK looking maze shown in Fig 1, but with the bias of a long corridor in the east and south ends:

![Fig. 1](img/binary_tree.png)

# Sidewinder
Is similar to the binary tree algorithm except that when the binary tree would dig south at the current cell, sidewinder digs south at a random cell in the previous run, where the previous run is the cells in the current row since the last time we dug south.

One problem I got stumbled into with this algo is that I forgot to handle the fact that my map array contains both the walls and columns, so instead of picking a random cell in the entire current run I need to only consider the odd columns in the row, i.e.:

```Rust
rand::thread_rng().gen_range(*runstart_col/2..curr_col/2)*2+1
```
instead of:
```Rust
rand::thread_rng().gen_range(*runstart_col..curr_col)
```

The final sidewinder function:
```Rust
fn sidewinder() -> [[u8; MAPH]; MAPL] {
    // Binary tree algorithim starting in the north west corner
    // and generating a maze down and to the east.
    let mut map = [[1; MAPL]; MAPH];

    fn close_run(runstart_col: &mut usize, curr_row: usize, curr_col: usize, map: &mut [[u8; MAPH]; MAPL]) {
        let random_column =
        if *runstart_col == curr_col {
            *runstart_col
        } else {
            rand::thread_rng().gen_range(*runstart_col/2..curr_col/2)*2+1
        };
        //dig south at random column in run
        map[curr_row+1][random_column] = 0;
        *runstart_col = curr_col+2;
    }

    for i in (1..MAPL-1).step_by(2) {
        let mut runstart_col = 1;
        for j in (1..MAPH-1).step_by(2) {
            map[i][j] = 0;
            if i == MAPL - 2 &&  j == MAPH -2 {
                continue;
            }
            if i == MAPL - 2 {
                // dig east
                map[i][j+1] = 0;
                continue;
            }
            if rand::random::<bool>() {
                if j == MAPH-2 {
                    close_run(&mut runstart_col, i, j, &mut map);
                } else {
                    // dig east
                    map[i][j+1] = 0;
                }
            } else {
                close_run(&mut runstart_col, i, j, &mut map);
            }
        }
    }
    return map;
}
```
This produces a similar maze to the binary tree but without the long empty eastern column and with a bias towards longer horizontal paths:

![Fig. 2](img/sidewinder.png)
