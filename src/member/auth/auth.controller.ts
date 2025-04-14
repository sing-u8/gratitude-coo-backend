import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/login.dto';
import { UpdateAuthDto } from './dto/register.dto';
import { ApiBasicAuth, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from './decorator/public.decorator';
import { Authorization } from './decorator/authorization.decorator';

@Controller('auth')
@ApiTags('auth')
@ApiBearerAuth()
@ApiTags('auth')
export class AuthController {
	// constructor(
  //   private readonly authService: AuthService
  // ) {}

  // @Public()
  // @ApiBasicAuth()
  // @Post('register')
  // registerUser(@Authorization() token: string) {
  //   // return this.authService.register(token);
  // }

  // @Public()
  // @ApiBasicAuth()
  // @Post('login')
  // loginUser(@Authorization() token: string) {
  //   // return this.authService.login(token);
  // }

  // @Post('token/block')
  // blockToken(@Body('token') token: string) {
  //   // return this.authService.tokenBlock(token);
  // }

  // @Post('token/access')
  // async rotateAccessToken(@Request() req) {
  //   return {
  //     accessToken: await this.authService.issueToken(req.user, false),
  //   };
  // }
}