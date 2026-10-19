export const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

const cryptoRandom = () => crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32;

export function newCode(random: () => number = cryptoRandom): string {
  let code = '';
  for (let i = 0; i < 6; i++) code += CODE_ALPHABET[Math.floor(random() * CODE_ALPHABET.length)];
  return code;
}
