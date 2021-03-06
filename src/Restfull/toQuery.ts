export default function (obj?: Record<string, string | number | boolean>) {
  if (!obj) {
    return '';
  }

  return Object.keys(obj)
    .filter(p => obj[p] !== undefined && obj[p] !== null)
    .map(p => `${encodeURIComponent(p)}=${encodeURIComponent(obj[p])}`)
    .join('&');
}
