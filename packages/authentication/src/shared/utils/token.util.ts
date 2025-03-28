/**
 * Extract token from jeadert
 * @param authorization
 * @returns
 */
export function extractTokenFromHeader(
  authorization?: string,
  type: string = 'JWT',
): string {
  if (!authorization) return '';

  const parts = authorization.split(' ');
  return parts.length === 2 && parts[0] === type ? parts[1] : '';
}
