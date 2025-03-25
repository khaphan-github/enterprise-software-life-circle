import { Injectable } from '@nestjs/common';

@Injectable()
export class NotifyProxy {
  constructor() {}

  sendEmail(email: string, subject: string, body: string) {
    console.log(`Email: ${email}, Message: ${body}`);
    return Promise.resolve();
  }
}
