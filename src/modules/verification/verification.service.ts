import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { sendOtpDto } from './dto/verification.dto';
import { RedisService } from 'src/common/redis/redis.service';
import { EverificationTypes } from 'src/common/types/verification.types';
import { generateOtp } from 'src/core/utils/random';
import { SmsService } from 'src/common/service/sms.service';

@Injectable()
export class VerificationService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private smsService: SmsService,
  ) {}

  public getKey(
    type: EverificationTypes,
    phone: string,
    confirmation?: boolean,
  ) {
    const storeKeys: Record<EverificationTypes, string> = {
      [EverificationTypes.REGISTER]: 'reg_',
      [EverificationTypes.RESET_PASSWORD]: 'respass_',
      [EverificationTypes.EDIT_PHONE]: 'edph_',
    };
    let key = storeKeys[type];
    if (confirmation) {
      key += 'cfm_';
    }
    key += phone;
    return key;
  }

  private async throwIfUserExits(phone: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        phone: phone,
      },
    });
    if (user) {
      throw new HttpException('Phone already used', HttpStatus.BAD_REQUEST);
    }
    return user;
  }

  private getMessage(type: EverificationTypes, otp: string) {
    switch (type) {
      case EverificationTypes.REGISTER:
        return `Tastiqlash kodi ${otp}`;
      case EverificationTypes.RESET_PASSWORD:
        return `Parolni qayta tilash kodi ${otp}`;
      case EverificationTypes.EDIT_PHONE:
        return `Telefonni o'zgartirish kodi ${otp}`;
    }
  }

  async sendOtp(payload: sendOtpDto) {
    const { type, phone } = payload;
    const key = this.getKey(type, phone);
    const session = await this.redis.get(key);

    if (session) {
      throw new HttpException(
        'Code already send to user',
        HttpStatus.BAD_REQUEST,
      );
    }

    switch (type) {
      case EverificationTypes.REGISTER:
        await this.throwIfUserExits(phone);
        break;
      case EverificationTypes.RESET_PASSWORD:
        await this.throwIfUserExits(phone);
        break;
      case EverificationTypes.EDIT_PHONE:
        await this.throwIfUserExits(phone);
        break;
    }
    const otp = generateOtp();
    await this.redis.set(key, JSON.stringify(otp), 600);
    this.smsService.sendSMS(this.getMessage(type, otp), phone);
    return { message: 'Confirmation OTP code send' };
  }
}
