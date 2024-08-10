export class UnknownTypeErr extends Error {
  constructor(msg: string) {
    super(msg);
  }
}

export const errors = {
  UnknownTypeErr,
};
