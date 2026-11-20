import { IsString, IsNotEmpty, MinLength, MaxLength, Matches } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  @Matches(/^[a-zA-Z0-9._-]+$/)
  identifiant!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  pseudo!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(128)
  password!: string;
}

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  identifiant!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  password!: string;
}

export class MfaVerifyDto {
  @IsString()
  @IsNotEmpty()
  mfaSessionToken!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(8)
  totpCode!: string;
}

export class MfaSetupRequiredDto {
  @IsString()
  @IsNotEmpty()
  mfaSetupSessionToken!: string;
}

export class MfaConfirmRequiredDto {
  @IsString()
  @IsNotEmpty()
  mfaSetupSessionToken!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(8)
  totpCode!: string;
}

export class MfaConfirmDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(8)
  totpCode!: string;
}

export class MfaDisableDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  password!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(8)
  totpCode!: string;
}
