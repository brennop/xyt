import { createNoise3D } from "simplex-noise"

const noise = createNoise3D();

// define a 16 colors palette
const pallet = [
  "#1a1c2c",
  "#5d275d",
  "#b13e53",
  "#ef7d57",
  "#ffcd75",
  "#a7f070",
  "#38b764",
  "#257179",
  "#29366f",
  "#3b5dc9",
  "#41a6f6",
  "#73eff7",
  "#f4f4f4",
  "#94b0c2",
  "#566c86",
  "#333c57",
];

const SIZE = 32;
const CANVAS_SIZE = 256;
const PIXEL_SIZE = CANVAS_SIZE / SIZE;
const RATIO = 16 / SIZE;

// 0-9 A-Z a-z - . _ ~ ( ) ' ! * : @ , ;
const lookup = {
  0: (s) => ['0', ...s],
  1: (s) => ['1', ...s],
  2: (s) => ['2', ...s],
  3: (s) => ['3', ...s],
  4: (s) => ['4', ...s],
  5: (s) => ['5', ...s],
  6: (s) => ['6', ...s],
  7: (s) => ['7', ...s],
  8: (s) => ['8', ...s],
  9: (s) => ['9', ...s],
  a: (s) => ['10', ...s],
  b: (s) => ['11', ...s],
  c: (s) => ['12', ...s],
  d: (s) => ['13', ...s],
  e: (s) => ['14', ...s],
  f: (s) => ['15', ...s],
  g: (s) => ['16', ...s],
  h: ([a, ...s]) => [`(${a}/2)`, ...s],
  i: (s) => ['i', ...s],
  j: ([a, b, ...s]) => [`(${b}&${a})`, ...s],
  k: ([a, b, ...s]) => [`(${b}|${a})`, ...s],
  l: ([a, b, ...s]) => [`(${b}^${a})`, ...s],
  m: ([a, ...s]) => [`(${a}+t)`, ...s],
  n: ([a, ...s]) => [`(-${a})`, ...s],
  o: ([a, ...s]) => [a, ...s],
  p: (s) => ["Math.PI", ...s],
  q: ([a, ...s]) => [`(${a}/4)`, ...s],
  r: ([a, ...s]) => [`(${a}/8)`, ...s],
  s: ([a, ...s]) => [`(${a}-8)`, ...s],
  t: (s) => ["t", ...s],
  u: ([a, ...s]) => [`(${a}-1)`, ...s],
  v: ([a, ...s]) => [`(${a}*4)`, ...s],
  w: ([a, ...s]) => [`(${a}*2)`, ...s],
  x: (s) => [`x`, ...s],
  y: (s) => [`y`, ...s],
  z: ([a, b, c, ...s]) => [`noise(${a}, ${b} || 0, ${c} || 0)`, ...s],
  A: ([a, ...s]) => [`Math.abs(${a})`, ...s],
  B: ([a, ...s]) => [a, ...s],
  C: ([a, ...s]) => [`Math.cos(${a})`, ...s],
  D: ([a, b, c, d]) => [`(${a} * ${d} - ${b} * ${c})`],
  E: ([a, ...s]) => [a, ...s],
  F: ([a, ...s]) => [`Math.floor(${a})`, ...s],
  G: ([a, ...s]) => [`Math.ceil(${a})`, ...s],
  H: ([a, b, ...s]) => [`Math.hypot(${a}, ${b})`, ...s],
  I: ([a, ...s]) => [`(1/${a})`, ...s],
  J: ([a, ...s]) => [a, ...s],
  K: ([a, b, ...s]) => [`Math.atan2(${b}, ${a})`, ...s],
  L: (s) => ["128", ...s],
  M: ([a, ...s]) => [`Math.max(${a}, 0)`, ...s],
  N: ([a, ...s]) => [`Math.min(${a}, 0)`, ...s],
  O: ([a, ...s]) => [`Math.round(${a})`, ...s],
  P: (s) => [`(Math.PI * 2)`, ...s],
  Q: ([a, ...s]) => [`Math.sqrt(${a})`, ...s],
  R: (s) => [`(${s.join('+')})`],
  S: ([a, ...s]) => [`Math.sin(${a})`, ...s],
  T: ([a, ...s]) => [`Math.tan(${a})`, ...s],
  U: (s) => [`Math.cos(t)`, ...s],
  V: (s) => [`Math.sin(t)`, ...s],
  W: ([a, ...s]) => [`(${a}*${a})`, ...s],
  X: (s) => [`(x-16)`, ...s],
  Y: (s) => [`(y-16)`, ...s],
  Z: ([a, ...s]) => [a, ...s],
  '-': ([a, b, ...s]) => [`(${b}-${a})`, ...s],
  ".": ([a, b, ...s]) => [`(${b}+${a})`, ...s],
  '+': ([a, b, ...s]) => [`(${b}+${a})`, ...s],
  "*": ([a, b, ...s]) => [`(${b}*${a})`, ...s],
  "_": ([a, b, ...s]) => [`(${b}/${a})`, ...s],
  "/": ([a, b, ...s]) => [`(${b}/${a})`, ...s],
  "~": ([a, b, ...s]) => [`(${b}%${a})`, ...s],
  "%": ([a, b, ...s]) => [`(${b}%${a})`, ...s],
  "(": s => s,
  ")": s => s,
  "'": s => s,
  "!": s => s,
  ":": s => s,
  "@": s => s,
  ",": s => s,
  ";": ([a, b, ...s]) => [`((${a} > ${b}) ? 8 : 0)`, ...s],
};

export const getString = (input) => {
  const [result] = input.split('').reduce((s, c) => (lookup[c] || (() => [c, ...s]))(s), [])
  return result
}

export const compile = (input) => {
  const result = getString(input);
  return new Function('x', 'y', 't', 'i', 'noise', `"use strict";const _=0;return ${result}`)
}

export function draw(context, _eval, t) {
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      const value = _eval(i, j, t * 0.003, i * SIZE + j, noise);
      const color = pallet[Math.floor(value) & 0xf];
      context.fillStyle = color;
      context.fillRect(
        i * PIXEL_SIZE,
        j * PIXEL_SIZE,
        PIXEL_SIZE,
        PIXEL_SIZE
      );
    }
  }
}
