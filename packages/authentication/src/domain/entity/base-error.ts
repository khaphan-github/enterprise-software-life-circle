import { HttpException } from '@nestjs/common';
import { string } from 'pg-format';

export class BaseError extends HttpException {
  constructor(protected mgs: string) {
    super(
      {
        message: string,
      },
      422,
    );
    console.log(mgs);
  }
}
