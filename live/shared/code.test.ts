import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CODE_ALPHABET, newCode } from './code.ts';

test('newCode 產生 6 碼且只用允許字元', () => {
  const code = newCode();
  assert.equal(code.length, 6);
  for (const ch of code) assert.ok(CODE_ALPHABET.includes(ch), ch);
});

test('newCode 不含容易混淆的字元', () => {
  for (let i = 0; i < 1000; i++) assert.doesNotMatch(newCode(), /[0O1IL]/);
});

test('newCode 可注入亂數來源', () => {
  assert.equal(newCode(() => 0), 'AAAAAA');
});
