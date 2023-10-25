export function dedupe(arr: string[]) {
  return arr.filter((item, index) => arr.indexOf(item) === index);
}
