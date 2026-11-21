import * as migration_20261121_111004_init from './20261121_111004_init'
import * as migration_20261121_114752_m3_cms from './20261121_114752_m3_cms'
import * as migration_20261121_121638_m5_pages from './20261121_121638_m5_pages'
import * as migration_20261121_123007_m6_avif from './20261121_123007_m6_avif'
import * as migration_20261121_125809_m8_leads from './20261121_125809_m8_leads'

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
  {
    up: migration_20261121_123007_m6_avif.up,
    down: migration_20261121_123007_m6_avif.down,
    name: '20261121_123007_m6_avif',
  },
  {
    up: migration_20261121_125809_m8_leads.up,
    down: migration_20261121_125809_m8_leads.down,
    name: '20261121_125809_m8_leads',
  },
]
