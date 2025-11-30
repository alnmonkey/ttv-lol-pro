export const enum Charset {
  ALPHANUMERIC = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
  ALPHANUMERIC_LOWERCASE = "abcdefghijklmnopqrstuvwxyz0123456789",
  ALPHANUMERIC_UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  NUMERIC = "0123456789",
}

export default function generateRandomString(
  length: number,
  charset: Charset = Charset.ALPHANUMERIC
): string {
  const randomArray = new Uint8Array(length);
  crypto.getRandomValues(randomArray);
  let result = "";
  randomArray.forEach(number => {
    result += charset[number % charset.length];
  });
  return result;
}
