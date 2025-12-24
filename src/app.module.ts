import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RedisModule } from './common/redis/redis.module';
import { AuthModule } from './modules/auth/auth.module';
import { VerificationModule } from './modules/verification/verification.module';

@Module({
  imports: [RedisModule, AuthModule, VerificationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
