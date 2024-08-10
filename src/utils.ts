export const abs = (x: number) => (x < 0 ? x * -1 : x);

export function append(buf: Buffer, data: Buffer): Buffer {
  return Buffer.concat([buf, data]);
}
