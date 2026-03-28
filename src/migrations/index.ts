import * as migration_20260319_050837_init from './20260319_050837_init';
import * as migration_20260328_093819_beta_8 from './20260328_093819_beta_8';

export const migrations = [
  {
    up: migration_20260319_050837_init.up,
    down: migration_20260319_050837_init.down,
    name: '20260319_050837_init',
  },
  {
    up: migration_20260328_093819_beta_8.up,
    down: migration_20260328_093819_beta_8.down,
    name: '20260328_093819_beta_8'
  },
];
