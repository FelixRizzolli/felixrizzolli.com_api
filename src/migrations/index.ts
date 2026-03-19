import * as migration_20260319_050837_init from './20260319_050837_init';

export const migrations = [
  {
    up: migration_20260319_050837_init.up,
    down: migration_20260319_050837_init.down,
    name: '20260319_050837_init'
  },
];
