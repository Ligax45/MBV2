import { Migration } from '@mikro-orm/migrations';

export class Migration20260609130000_SeedEquipment extends Migration {
  override up(): void {
    this.addSql(`INSERT INTO equipment (label)
SELECT v.label FROM (VALUES
  ('Four'),
  ('Micro-onde'),
  ('Mixeur'),
  ('Robot cuisine'),
  ('Plaques / feux'),
  ('Casserole'),
  ('Poêle'),
  ('Batteur électrique'),
  ('Thermomix'),
  ('Moule'),
  ('Passoire')
) AS v(label)
WHERE NOT EXISTS (SELECT 1 FROM equipment LIMIT 1);`);
  }

  override down(): void {
    this.addSql(`DELETE FROM equipment WHERE label IN (
  'Four', 'Micro-onde', 'Mixeur', 'Robot cuisine', 'Plaques / feux',
  'Casserole', 'Poêle', 'Batteur électrique', 'Thermomix', 'Moule', 'Passoire'
);`);
  }
}
