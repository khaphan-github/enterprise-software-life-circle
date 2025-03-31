/**
 * Generate a random number with the specified length
 * @param length
 * @returns
 */
export function generateRandomNumber(length: number): string {
  if (length <= 0) return '';
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return Math.floor(Math.random() * (max - min + 1) + min).toString();
}
