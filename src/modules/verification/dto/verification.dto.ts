import { IsEnum, IsMobilePhone, IsString } from 'class-validator';
import { EverificationTypes } from 'src/common/types/verification.types';

export class sendOtpDto {
  @IsEnum(EverificationTypes)
  type: EverificationTypes;

  @IsMobilePhone('uz-UZ')
  @IsString()
  phone: string;
}
