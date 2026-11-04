import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { LoginDto, RegisterDto } from './auth.dto';

describe('auth DTOs', () => {
  it('rejette un login sans mot de passe', async () => {
    const dto = plainToInstance(LoginDto, { identifiant: 'bob' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });

  it('rejette un register avec mot de passe trop court', async () => {
    const dto = plainToInstance(RegisterDto, {
      identifiant: 'bob',
      pseudo: 'Bob',
      password: 'short',
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });

  it('accepte un register valide', async () => {
    const dto = plainToInstance(RegisterDto, {
      identifiant: 'bob',
      pseudo: 'Bob',
      password: 'longenough',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});
