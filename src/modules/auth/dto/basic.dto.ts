import { IsEmail, IsMobilePhone, IsString, Length } from 'class-validator';
import { Column } from 'typeorm';

export class SignupDto {
  @IsString()
  first_name: string;
  @IsString()
  last_name: string;
  @IsMobilePhone('fa-IR', {}, { message: 'Sorry Bro!...' })
  mobile: string;
  @IsString()
  @IsEmail({}, { message: 'Sorry For Email..!!' })
  email: string;
  @IsString()
  @Length(6, 20, { message: 'Sorry Pass!...' })
  password: string;
  @IsString()
  confirm_password: string;
}
export class LoginDto {
    @IsString()
  @IsEmail({}, { message: 'Sorry For Email..!!' })
  email: string;
  @IsString()
  @Length(6, 20, { message: 'Sorry Pass!...' })
  password: string;
}