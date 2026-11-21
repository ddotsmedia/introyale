import * as migration_20261121_111004_init from './20261121_111004_init'
import * as migration_20261121_114752_m3_cms from './20261121_114752_m3_cms'
import * as migration_20261121_121638_m5_pages from './20261121_121638_m5_pages'

export const migrations = [
  {
    up: migration_20261121_111004_init.up,
    down: migration_20261121_111004_init.down,
    name: '20261121_111004_init',
  },
  {
    up: migration_20261121_114752_m3_cms.up,
    down: migration_20261121_114752_m3_cms.down,
    name: '20261121_114752_m3_cms',
  },
  {
    up: migration_20261121_121638_m5_pages.up,
    down: migration_20261121_121638_m5_pages.down,
    name: '20261121_121638_m5_pages',
  },
]
