import { Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { AuthGuard } from './guards/auth.guard';
import { JwtGuard } from './guards/jwt.guard';
import { RoleGuard } from './guards/role.guard';

@Module({
  imports: [UserModule],
  controllers: [],
  providers: [AuthGuard, JwtGuard, RoleGuard],
  exports: [AuthGuard],
})
export class AuthModule {}
