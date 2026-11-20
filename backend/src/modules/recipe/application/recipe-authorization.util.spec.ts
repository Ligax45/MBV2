import { UserRole } from '../../auth/domain/user-role.enum';
import type { AuthenticatedUser } from '../../auth/domain/auth-user.model';
import { canModifyRecipe, canViewRecipe } from './recipe-authorization.util';
import { Recipe } from '../domain/entities/recipe.entity';

const owner: AuthenticatedUser = {
  id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  pseudo: 'owner',
  role: UserRole.User,
};

const stranger: AuthenticatedUser = {
  id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  pseudo: 'stranger',
  role: UserRole.User,
};

const moderator: AuthenticatedUser = {
  id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
  pseudo: 'modo',
  role: UserRole.Moderator,
};

function privateRecipe(authorUserId: string): Recipe {
  return new Recipe(
    '11111111-1111-1111-1111-111111111111',
    'Privée',
    'Desc',
    'facile',
    2,
    { id: '22222222-2222-2222-2222-222222222222', label: 'Plat' },
    null,
    authorUserId,
    'owner',
    5,
    10,
    0,
    new Date(),
    new Date(),
    [],
    [],
    [],
    'private',
    'approved',
  );
}

describe('recipe-authorization.util', () => {
  it('canModifyRecipe : auteur et modérateur uniquement', () => {
    expect(canModifyRecipe(owner, owner.id)).toBe(true);
    expect(canModifyRecipe(stranger, owner.id)).toBe(false);
    expect(canModifyRecipe(moderator, owner.id)).toBe(true);
  });

  it('canViewRecipe : refuse un tiers sur une recette privée', () => {
    const recipe = privateRecipe(owner.id);
    expect(canViewRecipe(owner, recipe)).toBe(true);
    expect(canViewRecipe(stranger, recipe)).toBe(false);
    expect(canViewRecipe(undefined, recipe)).toBe(false);
  });
});
