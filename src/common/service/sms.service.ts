import { Injectable } from '@nestjs/common';

@Injectable()
export class SmsService {
  private token: string;

  sendSMS(message: string, phone: string): void {
    console.log(`SMS yuborildi: ${message} -> ${phone}`);
  }
}
