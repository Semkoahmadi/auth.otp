import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { OTPEntity } from '../user/entities/otp.entity';
import { CheckOtpDto, SendOtpDto } from './dto/otp.dto';
import { randomInt } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { TokensPayload } from './types/payload';
import { ConfigService } from '@nestjs/config';
import { SignupDto } from './dto/basic.dto';
import { genSaltSync, hashSync } from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(OTPEntity) private otpRepository: Repository<OTPEntity>,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async sendOtp(otpDto: SendOtpDto) {
    const { mobile } = otpDto;
    let user = await this.userRepository.findOneBy({ mobile });
    if (!user) {
      user = this.userRepository.create({
        mobile,
      });
      user = await this.userRepository.save(user);
    }
    await this.createOtpForUser(user);
    return {
      message: 'Send Otp Code Successfully',
    };
  }

  async checkOtp(otpDto: CheckOtpDto) {
    const { code, mobile } = otpDto;
    const now = new Date();
    const user = await this.userRepository.findOne({
      where: { mobile },
      relations: { otp: true },
    });
    if (!user || !user?.otp)
      throw new UnauthorizedException('Not Found Account');
    const otp = user?.otp;
    if (otp?.code !== code)
      throw new UnauthorizedException('Sorry.. Bad Code!');
    if (otp.expires_in < now)
      throw new UnauthorizedException('Tryagain To New Code');
    if (!user.mobile_verify) {
      await this.userRepository.update(
        { id: user.id },
        {
          mobile_verify: true,
        }
      );
    }
    const { accessToken, refreshToken } = this.makeTokenForUSer({
      id: user.id,
      mobile,
    });
    return { accessToken, refreshToken, message: 'Logged-in Success' };
  }
  async signup(signupDto: SignupDto) {
    const { first_name, last_name, email, password, confirm_password, mobile } =
      signupDto;
    await this.checkEmail(email);
    await this.checkMobile(mobile);
    if (password !== confirm_password) {
      throw new BadRequestException('Gwat...');
    }
    const salt = genSaltSync(10);
    let hashedpassword = hashSync(password, salt);
    const user = await this.userRepository.create({
      first_name,
      last_name,
      mobile,
      email,
      password: hashedpassword,
      mobile_verify: false,
    });
    await this.userRepository.save(user);
    return {
      message:"Welcome .."
    }
  }
  async checkEmail(email: string) {
    const user = await this.userRepository.findOneBy({ email });
    if (user) throw new ConflictException('sorry! En Emailo Darem..');
  }
  async checkMobile(mobile: string) {
    const user = await this.userRepository.findOneBy({ mobile });
    if (user) throw new ConflictException('sorry! En Shomararo Darem..');
  }

  async createOtpForUser(user: UserEntity) {
    const expiresIn = new Date(new Date().getTime() + 1000 * 60 * 2);
    const code = randomInt(10000, 99999).toString();
    let otp = await this.otpRepository.findOneBy({ userId: user.id });
    if (otp) {
      otp.code = code;
      otp.expires_in = expiresIn;
    } else {
      otp = this.otpRepository.create({
        code,
        expires_in: expiresIn,
        userId: user.id,
      });
    }
    otp = await this.otpRepository.save(otp);
    user.otpId = otp.id;
    await this.userRepository.save(user);
  }
  makeTokenForUSer(payload: TokensPayload) {
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('Jwt.accessTokenSecret'),
      expiresIn: '30d',
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('Jwt.refreshTokenSecret'),
      expiresIn: '1y',
    });
    return { accessToken, refreshToken };
  }

  async validateAccessToken(token: string) {
    try {
      const payload = this.jwtService.verify<TokensPayload>(token, {
        secret: this.configService.get('Jwt.accessTokenSecret'),
      });
      if (typeof payload === 'object' && payload?.id) {
        const user = await this.userRepository.findOneBy({ id: payload.id });
        if (!user) {
          throw new UnauthorizedException('Login On Your Account');
        }
        return user;
      }
      throw new UnauthorizedException('Login On Your Account');
    } catch (error) {
      throw new UnauthorizedException('Login On Your Account');
    }
  }
}
