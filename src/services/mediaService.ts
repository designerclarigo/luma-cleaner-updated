import { MediaItem, CleanupSession, MonthCollection, AppStats, AppSettings, DecisionType } from '../types/media';

// Resilient curated demo media
// Features diverse categories: travel, portraits, food, receipts/screenshots, duplicates, videos across multiple months
const DEMO_MEDIA_SEED: MediaItem[] = [
  // --- OCTOBER 2026 ---
  {
    id: 'demo-1',
    uri: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    thumbnailUri: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=70',
    filename: 'IMG_20261014_YosemiteMist.jpg',
    mediaType: 'photo',
    width: 4032,
    height: 3024,
    creationTime: new Date('2026-10-14T09:24:00').getTime(),
    modificationTime: new Date('2026-10-14T09:24:00').getTime(),
    fileSize: 4210000,
    albumName: 'Camera',
    source: 'demo',
  },
  {
    id: 'demo-2',
    uri: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=1200&q=80',
    thumbnailUri: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=400&q=70',
    filename: 'Screenshot_2026-10-12-NotesApp.png',
    mediaType: 'photo',
    width: 1170,
    height: 2532,
    creationTime: new Date('2026-10-12T14:30:15').getTime(),
    modificationTime: new Date('2026-10-12T14:30:15').getTime(),
    fileSize: 1850000,
    albumName: 'Screenshots',
    source: 'demo',
  },
  {
    id: 'demo-3',
    uri: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=1200&q=80',
    thumbnailUri: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=400&q=70',
    filename: 'IMG_20261011_PuppyPark_01.jpg',
    mediaType: 'photo',
    width: 3840,
    height: 2880,
    creationTime: new Date('2026-10-11T16:15:00').getTime(),
    modificationTime: new Date('2026-10-11T16:15:00').getTime(),
    fileSize: 3950000,
    albumName: 'Camera',
    source: 'demo',
  },
  {
    id: 'demo-4',
    uri: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=1200&q=80',
    thumbnailUri: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&q=70',
    filename: 'IMG_20261011_PuppyPark_02_Blur.jpg',
    mediaType: 'photo',
    width: 3840,
    height: 2880,
    creationTime: new Date('2026-10-11T16:15:04').getTime(),
    modificationTime: new Date('2026-10-11T16:15:04').getTime(),
    fileSize: 3820000,
    albumName: 'Camera',
    source: 'demo',
  },
  {
    id: 'demo-5',
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUri: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=400&q=70',
    filename: 'VID_20261009_CampfireEvening.mp4',
    mediaType: 'video',
    width: 1920,
    height: 1080,
    creationTime: new Date('2026-10-09T20:45:00').getTime(),
    modificationTime: new Date('2026-10-09T20:45:00').getTime(),
    duration: 15,
    fileSize: 15400000, // 15.4 MB
    albumName: 'Camera',
    source: 'demo',
  },
  {
    id: 'demo-6',
    uri: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80',
    thumbnailUri: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=70',
    filename: 'IMG_20261007_HarvestBowl.jpg',
    mediaType: 'photo',
    width: 4000,
    height: 3000,
    creationTime: new Date('2026-10-07T12:35:00').getTime(),
    modificationTime: new Date('2026-10-07T12:35:00').getTime(),
    fileSize: 3450000,
    albumName: 'Camera',
    source: 'demo',
  },
  {
    id: 'demo-7',
    uri: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
    thumbnailUri: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=400&q=70',
    filename: 'IMG_20261004_TokyoNightTower.jpg',
    mediaType: 'photo',
    width: 3900,
    height: 2600,
    creationTime: new Date('2026-10-04T21:10:00').getTime(),
    modificationTime: new Date('2026-10-04T21:10:00').getTime(),
    fileSize: 4900000,
    albumName: 'Travel',
    source: 'demo',
  },
  {
    id: 'demo-8',
    uri: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=80',
    thumbnailUri: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=400&q=70',
    filename: 'IMG_20261002_FriendsDinner_01_Burst.jpg',
    mediaType: 'photo',
    width: 3800,
    height: 2530,
    creationTime: new Date('2026-10-02T19:30:00').getTime(),
    modificationTime: new Date('2026-10-02T19:30:00').getTime(),
    fileSize: 3700000,
    albumName: 'Camera',
    source: 'demo',
  },
  {
    id: 'demo-9',
    uri: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
    thumbnailUri: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=400&q=70',
    filename: 'IMG_20261002_FriendsDinner_02_Burst.jpg',
    mediaType: 'photo',
    width: 3800,
    height: 2530,
    creationTime: new Date('2026-10-02T19:30:05').getTime(),
    modificationTime: new Date('2026-10-02T19:30:05').getTime(),
    fileSize: 3650000,
    albumName: 'Camera',
    source: 'demo',
  },

  // --- SEPTEMBER 2026 ---
  {
    id: 'demo-10',
    uri: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
    thumbnailUri: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=400&q=70',
    filename: 'IMG_20260928_PineFog.jpg',
    mediaType: 'photo',
    width: 4200,
    height: 2800,
    creationTime: new Date('2026-09-28T07:12:00').getTime(),
    modificationTime: new Date('2026-09-28T07:12:00').getTime(),
    fileSize: 5120000,
    albumName: 'Travel',
    source: 'demo',
  },
  {
    id: 'demo-11',
    uri: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    thumbnailUri: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=70',
    filename: 'IMG_20260921_PacificCove.jpg',
    mediaType: 'photo',
    width: 3900,
    height: 2600,
    creationTime: new Date('2026-09-21T18:40:00').getTime(),
    modificationTime: new Date('2026-09-21T18:40:00').getTime(),
    fileSize: 4800000,
    albumName: 'Travel',
    source: 'demo',
  },
  {
    id: 'demo-12',
    uri: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    thumbnailUri: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=70',
    filename: 'IMG_20260914_PastaTable.jpg',
    mediaType: 'photo',
    width: 3800,
    height: 2530,
    creationTime: new Date('2026-09-14T20:10:00').getTime(),
    modificationTime: new Date('2026-09-14T20:10:00').getTime(),
    fileSize: 3900000,
    albumName: 'Camera',
    source: 'demo',
  },
  {
    id: 'demo-13',
    uri: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    thumbnailUri: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=70',
    filename: 'Screenshot_2026-09-02-FlightPass.png',
    mediaType: 'photo',
    width: 1170,
    height: 2532,
    creationTime: new Date('2026-09-02T11:05:00').getTime(),
    modificationTime: new Date('2026-09-02T11:05:00').getTime(),
    fileSize: 1420000,
    albumName: 'Screenshots',
    source: 'demo',
  },
  {
    id: 'demo-14',
    uri: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
    thumbnailUri: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=400&q=70',
    filename: 'IMG_20260901_ConcertCrowd_Blur.jpg',
    mediaType: 'photo',
    width: 3600,
    height: 2400,
    creationTime: new Date('2026-09-01T22:45:00').getTime(),
    modificationTime: new Date('2026-09-01T22:45:00').getTime(),
    fileSize: 4100000,
    albumName: 'Camera',
    source: 'demo',
  },

  // --- AUGUST 2026 ---
  {
    id: 'demo-15',
    uri: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80',
    thumbnailUri: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=400&q=70',
    filename: 'IMG_20260819_AlpineRidge.jpg',
    mediaType: 'photo',
    width: 4100,
    height: 2730,
    creationTime: new Date('2026-08-19T13:45:00').getTime(),
    modificationTime: new Date('2026-08-19T13:45:00').getTime(),
    fileSize: 6200000,
    albumName: 'Travel',
    source: 'demo',
  },
  {
    id: 'demo-16',
    uri: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
    thumbnailUri: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=400&q=70',
    filename: 'IMG_20260810_RoasteryPour_01.jpg',
    mediaType: 'photo',
    width: 3600,
    height: 2400,
    creationTime: new Date('2026-08-10T08:30:00').getTime(),
    modificationTime: new Date('2026-08-10T08:30:00').getTime(),
    fileSize: 3100000,
    albumName: 'Camera',
    source: 'demo',
  },
  {
    id: 'demo-17',
    uri: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=80',
    thumbnailUri: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=70',
    filename: 'IMG_20260810_RoasteryPour_02_Blur.jpg',
    mediaType: 'photo',
    width: 3600,
    height: 2400,
    creationTime: new Date('2026-08-10T08:30:06').getTime(),
    modificationTime: new Date('2026-08-10T08:30:06').getTime(),
    fileSize: 3050000,
    albumName: 'Camera',
    source: 'demo',
  },
  {
    id: 'demo-18',
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnailUri: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=70',
    filename: 'VID_20260805_OceanSwell.mp4',
    mediaType: 'video',
    width: 1920,
    height: 1080,
    creationTime: new Date('2026-08-05T17:15:00').getTime(),
    modificationTime: new Date('2026-08-05T17:15:00').getTime(),
    duration: 12,
    fileSize: 12800000, // 12.8 MB
    albumName: 'Travel',
    source: 'demo',
  },
  {
    id: 'demo-19',
    uri: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=1200&q=80',
    thumbnailUri: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=400&q=70',
    filename: 'IMG_20260802_PuppyGrass.jpg',
    mediaType: 'photo',
    width: 3800,
    height: 2600,
    creationTime: new Date('2026-08-02T11:20:00').getTime(),
    modificationTime: new Date('2026-08-02T11:20:00').getTime(),
    fileSize: 3400000,
    albumName: 'Camera',
    source: 'demo',
  },

  // --- JULY 2026 ---
  {
    id: 'demo-20',
    uri: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80',
    thumbnailUri: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=400&q=70',
    filename: 'IMG_20260725_GoldenBeachSunset.jpg',
    mediaType: 'photo',
    width: 4000,
    height: 2700,
    creationTime: new Date('2026-07-25T19:50:00').getTime(),
    modificationTime: new Date('2026-07-25T19:50:00').getTime(),
    fileSize: 5300000,
    albumName: 'Travel',
    source: 'demo',
  },
  {
    id: 'demo-21',
    uri: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1200&q=80',
    thumbnailUri: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=400&q=70',
    filename: 'IMG_20260718_MalibuSurfer.jpg',
    mediaType: 'photo',
    width: 3600,
    height: 2400,
    creationTime: new Date('2026-07-18T16:40:00').getTime(),
    modificationTime: new Date('2026-07-18T16:40:00').getTime(),
    fileSize: 4600000,
    albumName: 'Travel',
    source: 'demo',
  },
  {
    id: 'demo-22',
    uri: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80',
    thumbnailUri: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=70',
    filename: 'IMG_20260712_SourdoughLoaf.jpg',
    mediaType: 'photo',
    width: 3800,
    height: 2530,
    creationTime: new Date('2026-07-12T09:15:00').getTime(),
    modificationTime: new Date('2026-07-12T09:15:00').getTime(),
    fileSize: 3200000,
    albumName: 'Camera',
    source: 'demo',
  },
  {
    id: 'demo-23',
    uri: 'https://images.unsplash.com/photo-1439853941329-a9a20243e8e7?auto=format&fit=crop&w=1200&q=80',
    thumbnailUri: 'https://images.unsplash.com/photo-1439853941329-a9a20243e8e7?auto=format&fit=crop&w=400&q=70',
    filename: 'IMG_20260704_LakeMirrorReflection.jpg',
    mediaType: 'photo',
    width: 4200,
    height: 2800,
    creationTime: new Date('2026-07-04T08:10:00').getTime(),
    modificationTime: new Date('2026-07-04T08:10:00').getTime(),
    fileSize: 5800000,
    albumName: 'Travel',
    source: 'demo',
  },

  // --- MAY 2026 ---
  {
    id: 'demo-24',
    uri: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=1200&q=80',
    thumbnailUri: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=400&q=70',
    filename: 'IMG_20260515_CherryBlossomSpring.jpg',
    mediaType: 'photo',
    width: 3900,
    height: 2600,
    creationTime: new Date('2026-05-15T14:20:00').getTime(),
    modificationTime: new Date('2026-05-15T14:20:00').getTime(),
    fileSize: 4500000,
    albumName: 'Camera',
    source: 'demo',
  },
  {
    id: 'demo-25',
    uri: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    thumbnailUri: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=70',
    filename: 'IMG_20260508_ModernVillaInterior.jpg',
    mediaType: 'photo',
    width: 4000,
    height: 2670,
    creationTime: new Date('2026-05-08T16:00:00').getTime(),
    modificationTime: new Date('2026-05-08T16:00:00').getTime(),
    fileSize: 4900000,
    albumName: 'Architecture',
    source: 'demo',
  },
  {
    id: 'demo-26',
    uri: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
    thumbnailUri: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=400&q=70',
    filename: 'IMG_20260502_DesertDunesSunset.jpg',
    mediaType: 'photo',
    width: 4100,
    height: 2730,
    creationTime: new Date('2026-05-02T18:30:00').getTime(),
    modificationTime: new Date('2026-05-02T18:30:00').getTime(),
    fileSize: 5200000,
    albumName: 'Travel',
    source: 'demo',
  },

  // --- PAST MEMORIES (OCTOBER 2025 - FOR ON THIS DAY) ---
  {
    id: 'demo-27',
    uri: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=1200&q=80',
    thumbnailUri: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=400&q=70',
    filename: 'IMG_20251016_CatSunbeam.jpg',
    mediaType: 'photo',
    width: 3400,
    height: 2260,
    creationTime: new Date('2025-10-16T15:00:00').getTime(),
    modificationTime: new Date('2025-10-16T15:00:00').getTime(),
    fileSize: 3750000,
    albumName: 'Camera',
    source: 'demo',
  },
  {
    id: 'demo-28',
    uri: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80',
    thumbnailUri: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=400&q=70',
    filename: 'IMG_20251016_AutumnForestWalk.jpg',
    mediaType: 'photo',
    width: 4000,
    height: 2670,
    creationTime: new Date('2025-10-16T11:20:00').getTime(),
    modificationTime: new Date('2025-10-16T11:20:00').getTime(),
    fileSize: 4700000,
    albumName: 'Travel',
    source: 'demo',
  },
  {
    id: 'demo-29',
    uri: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=1200&q=80',
    thumbnailUri: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=400&q=70',
    filename: 'IMG_20251010_CitySkylineNight.jpg',
    mediaType: 'photo',
    width: 3900,
    height: 2600,
    creationTime: new Date('2025-10-10T21:40:00').getTime(),
    modificationTime: new Date('2025-10-10T21:40:00').getTime(),
    fileSize: 4950000,
    albumName: 'Travel',
    source: 'demo',
  },
  {
    id: 'demo-30',
    uri: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
    thumbnailUri: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=400&q=70',
    filename: 'IMG_20250915_CoffeeShopRain.jpg',
    mediaType: 'photo',
    width: 3600,
    height: 2400,
    creationTime: new Date('2025-09-15T16:10:00').getTime(),
    modificationTime: new Date('2025-09-15T16:10:00').getTime(),
    fileSize: 3150000,
    albumName: 'Camera',
    source: 'demo',
  },
  // --- ADDITIONAL RICH CURATED MEDIA (50+ TOTAL) ---
  {
    id: 'demo-31',
    uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80',
    thumbnailUri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=400&q=70',
    filename: 'IMG_20261015_SnowyPeakView.jpg',
    mediaType: 'photo',
    width: 4200,
    height: 2800,
    creationTime: new Date('2026-10-15T08:15:00').getTime(),
    modificationTime: new Date('2026-10-15T08:15:00').getTime(),
    fileSize: 5600000,
    albumName: 'Travel',
    source: 'demo',
  },
  {
    id: 'demo-32',
    uri: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
    thumbnailUri: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=400&q=70',
    filename: 'IMG_20261015_MountainLakeBoats.jpg',
    mediaType: 'photo',
    width: 3900,
    height: 2600,
    creationTime: new Date('2026-10-15T10:30:00').getTime(),
    modificationTime: new Date('2026-10-15T10:30:00').getTime(),
    fileSize: 4900000,
    albumName: 'Travel',
    source: 'demo',
  },
  {
    id: 'demo-33',
    uri: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&w=1200&q=80',
    thumbnailUri: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&w=400&q=70',
    filename: 'IMG_20261013_GoldenRetriever_Smiling_01.jpg',
    mediaType: 'photo',
    width: 3800,
    height: 2530,
    creationTime: new Date('2026-10-13T15:20:00').getTime(),
    modificationTime: new Date('2026-10-13T15:20:00').getTime(),
    fileSize: 3850000,
    albumName: 'Camera',
    source: 'demo',
  },
  {
    id: 'demo-34',
    uri: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=1200&q=80',
    thumbnailUri: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=400&q=70',
    filename: 'IMG_20261013_GoldenRetriever_Smiling_02_Blur.jpg',
    mediaType: 'photo',
    width: 3800,
    height: 2530,
    creationTime: new Date('2026-10-13T15:20:04').getTime(),
    modificationTime: new Date('2026-10-13T15:20:04').getTime(),
    fileSize: 3790000,
    albumName: 'Camera',
    source: 'demo',
  },
  {
    id: 'demo-35',
    uri: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1200&q=80',
    thumbnailUri: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=400&q=70',
    filename: 'IMG_20261008_ArtisanPizza_Dinner.jpg',
    mediaType: 'photo',
    width: 3600,
    height: 2400,
    creationTime: new Date('2026-10-08T19:45:00').getTime(),
    modificationTime: new Date('2026-10-08T19:45:00').getTime(),
    fileSize: 4200000,
    albumName: 'Camera',
    source: 'demo',
  },
  {
    id: 'demo-36',
    uri: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80',
    thumbnailUri: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=400&q=70',
    filename: 'IMG_20261005_BirthdayPartyToast.jpg',
    mediaType: 'photo',
    width: 4000,
    height: 2670,
    creationTime: new Date('2026-10-05T21:10:00').getTime(),
    modificationTime: new Date('2026-10-05T21:10:00').getTime(),
    fileSize: 4500000,
    albumName: 'Camera',
    source: 'demo',
  },
  {
    id: 'demo-37',
    uri: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80',
    thumbnailUri: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=400&q=70',
    filename: 'IMG_20260925_NatureTrailSun.jpg',
    mediaType: 'photo',
    width: 4100,
    height: 2730,
    creationTime: new Date('2026-09-25T14:30:00').getTime(),
    modificationTime: new Date('2026-09-25T14:30:00').getTime(),
    fileSize: 5800000,
    albumName: 'Travel',
    source: 'demo',
  },
  {
    id: 'demo-38',
    uri: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80',
    thumbnailUri: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=400&q=70',
    filename: 'IMG_20260920_LakeCruiseMisty.jpg',
    mediaType: 'photo',
    width: 4200,
    height: 2800,
    creationTime: new Date('2026-09-20T10:15:00').getTime(),
    modificationTime: new Date('2026-09-20T10:15:00').getTime(),
    fileSize: 5400000,
    albumName: 'Travel',
    source: 'demo',
  },
  {
    id: 'demo-39',
    uri: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
    thumbnailUri: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&q=70',
    filename: 'Screenshot_2026-09-18_CodeSnippet.png',
    mediaType: 'photo',
    width: 1170,
    height: 2532,
    creationTime: new Date('2026-09-18T16:45:00').getTime(),
    modificationTime: new Date('2026-09-18T16:45:00').getTime(),
    fileSize: 1950000,
    albumName: 'Screenshots',
    source: 'demo',
  },
  {
    id: 'demo-40',
    uri: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
    thumbnailUri: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=70',
    filename: 'IMG_20260910_GrilledSalmonGourmet.jpg',
    mediaType: 'photo',
    width: 3800,
    height: 2530,
    creationTime: new Date('2026-09-10T19:20:00').getTime(),
    modificationTime: new Date('2026-09-10T19:20:00').getTime(),
    fileSize: 4100000,
    albumName: 'Camera',
    source: 'demo',
  },
  {
    id: 'demo-41',
    uri: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=80',
    thumbnailUri: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=400&q=70',
    filename: 'IMG_20260826_HighwayDesertDrive.jpg',
    mediaType: 'photo',
    width: 4100,
    height: 2730,
    creationTime: new Date('2026-08-26T11:40:00').getTime(),
    modificationTime: new Date('2026-08-26T11:40:00').getTime(),
    fileSize: 4900000,
    albumName: 'Travel',
    source: 'demo',
  },
  {
    id: 'demo-42',
    uri: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=1200&q=80',
    thumbnailUri: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=400&q=70',
    filename: 'IMG_20260822_SunriseGoldenHour.jpg',
    mediaType: 'photo',
    width: 4000,
    height: 2670,
    creationTime: new Date('2026-08-22T06:15:00').getTime(),
    modificationTime: new Date('2026-08-22T06:15:00').getTime(),
    fileSize: 4600000,
    albumName: 'Travel',
    source: 'demo',
  },
  {
    id: 'demo-43',
    uri: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80',
    thumbnailUri: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=400&q=70',
    filename: 'Screenshot_2026-08-14_DesignMockup.png',
    mediaType: 'photo',
    width: 1170,
    height: 2532,
    creationTime: new Date('2026-08-14T15:30:00').getTime(),
    modificationTime: new Date('2026-08-14T15:30:00').getTime(),
    fileSize: 1820000,
    albumName: 'Screenshots',
    source: 'demo',
  },
  {
    id: 'demo-44',
    uri: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=1200&q=80',
    thumbnailUri: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=400&q=70',
    filename: 'IMG_20260729_TabbyCatStare.jpg',
    mediaType: 'photo',
    width: 3800,
    height: 2530,
    creationTime: new Date('2026-07-29T14:10:00').getTime(),
    modificationTime: new Date('2026-07-29T14:10:00').getTime(),
    fileSize: 3950000,
    albumName: 'Camera',
    source: 'demo',
  },
  {
    id: 'demo-45',
    uri: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    thumbnailUri: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=70',
    filename: 'IMG_20260721_ModernPoolHouse.jpg',
    mediaType: 'photo',
    width: 4200,
    height: 2800,
    creationTime: new Date('2026-07-21T17:30:00').getTime(),
    modificationTime: new Date('2026-07-21T17:30:00').getTime(),
    fileSize: 5300000,
    albumName: 'Architecture',
    source: 'demo',
  },
  {
    id: 'demo-46',
    uri: 'https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?auto=format&fit=crop&w=1200&q=80',
    thumbnailUri: 'https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?auto=format&fit=crop&w=400&q=70',
    filename: 'IMG_20260715_SunlitForestMeadow.jpg',
    mediaType: 'photo',
    width: 4100,
    height: 2730,
    creationTime: new Date('2026-07-15T09:40:00').getTime(),
    modificationTime: new Date('2026-07-15T09:40:00').getTime(),
    fileSize: 5100000,
    albumName: 'Travel',
    source: 'demo',
  },
  {
    id: 'demo-47',
    uri: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
    thumbnailUri: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=400&q=70',
    filename: 'IMG_20260624_KyotoAlleyLanterns.jpg',
    mediaType: 'photo',
    width: 3900,
    height: 2600,
    creationTime: new Date('2026-06-24T20:45:00').getTime(),
    modificationTime: new Date('2026-06-24T20:45:00').getTime(),
    fileSize: 4800000,
    albumName: 'Travel',
    source: 'demo',
  },
  {
    id: 'demo-48',
    uri: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=80',
    thumbnailUri: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=400&q=70',
    filename: 'IMG_20260618_HikerSummitBoots.jpg',
    mediaType: 'photo',
    width: 4000,
    height: 2670,
    creationTime: new Date('2026-06-18T13:15:00').getTime(),
    modificationTime: new Date('2026-06-18T13:15:00').getTime(),
    fileSize: 5200000,
    albumName: 'Travel',
    source: 'demo',
  },
  {
    id: 'demo-49',
    uri: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=1200&q=80',
    thumbnailUri: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=400&q=70',
    filename: 'IMG_20260611_EmeraldValleySpring.jpg',
    mediaType: 'photo',
    width: 4200,
    height: 2800,
    creationTime: new Date('2026-06-11T10:00:00').getTime(),
    modificationTime: new Date('2026-06-11T10:00:00').getTime(),
    fileSize: 5900000,
    albumName: 'Travel',
    source: 'demo',
  },
  {
    id: 'demo-50',
    uri: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=80',
    thumbnailUri: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=400&q=70',
    filename: 'IMG_20260604_SummerPartyConfetti.jpg',
    mediaType: 'photo',
    width: 3800,
    height: 2530,
    creationTime: new Date('2026-06-04T18:25:00').getTime(),
    modificationTime: new Date('2026-06-04T18:25:00').getTime(),
    fileSize: 4100000,
    albumName: 'Camera',
    source: 'demo',
  },
  {
    id: 'demo-51',
    uri: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
    thumbnailUri: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=400&q=70',
    filename: 'IMG_20260522_TravelCompassMap.jpg',
    mediaType: 'photo',
    width: 3900,
    height: 2600,
    creationTime: new Date('2026-05-22T11:45:00').getTime(),
    modificationTime: new Date('2026-05-22T11:45:00').getTime(),
    fileSize: 4700000,
    albumName: 'Travel',
    source: 'demo',
  },
  {
    id: 'demo-52',
    uri: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    thumbnailUri: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=70',
    filename: 'IMG_20260518_ItalianPastaLunch_01.jpg',
    mediaType: 'photo',
    width: 3800,
    height: 2530,
    creationTime: new Date('2026-05-18T13:20:00').getTime(),
    modificationTime: new Date('2026-05-18T13:20:00').getTime(),
    fileSize: 3900000,
    albumName: 'Camera',
    source: 'demo',
  },
  {
    id: 'demo-53',
    uri: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    thumbnailUri: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=70',
    filename: 'IMG_20260518_ItalianPastaLunch_02_Blur.jpg',
    mediaType: 'photo',
    width: 3800,
    height: 2530,
    creationTime: new Date('2026-05-18T13:20:06').getTime(),
    modificationTime: new Date('2026-05-18T13:20:06').getTime(),
    fileSize: 3850000,
    albumName: 'Camera',
    source: 'demo',
  },
  {
    id: 'demo-54',
    uri: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80',
    thumbnailUri: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=400&q=70',
    filename: 'IMG_20260428_SeasideUmbrellas.jpg',
    mediaType: 'photo',
    width: 4100,
    height: 2730,
    creationTime: new Date('2026-04-28T16:10:00').getTime(),
    modificationTime: new Date('2026-04-28T16:10:00').getTime(),
    fileSize: 5100000,
    albumName: 'Travel',
    source: 'demo',
  },
  {
    id: 'demo-55',
    uri: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    thumbnailUri: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=70',
    filename: 'IMG_20260412_RiverBendCanyon.jpg',
    mediaType: 'photo',
    width: 4200,
    height: 2800,
    creationTime: new Date('2026-04-12T11:30:00').getTime(),
    modificationTime: new Date('2026-04-12T11:30:00').getTime(),
    fileSize: 5700000,
    albumName: 'Travel',
    source: 'demo',
  },
];

const STORAGE_KEYS = {
  MEDIA: 'luma_media_library_v3',
  BOOKMARKS: 'luma_bookmarks',
  SESSION: 'luma_current_session',
  STATS: 'luma_app_stats',
  SETTINGS: 'luma_settings',
  COMPLETED_COLLECTIONS: 'luma_completed_collections',
  ONBOARDING_DONE: 'luma_onboarding_completed',
};

class MediaService {
  private mediaList: MediaItem[] = [];
  private bookmarkedIds: Set<string> = new Set();
  private completedCollections: Set<string> = new Set();
  private stats: AppStats = {
    totalReviewed: 0,
    totalKept: 0,
    totalDeleted: 0,
    bytesReclaimed: 0,
    dailyStreak: 1,
    lastCleanDate: new Date().toISOString().split('T')[0],
    cleanupLogs: [],
  };
  private settings: AppSettings = {
    hapticsEnabled: true,
    reducedMotion: false,
    showReviewBeforeFinish: true,
    permissionState: 'granted',
    deviceFrameEnabled: true,
  };

  constructor() {
    this.init();
  }

  private init() {
    try {
      const storedMedia = localStorage.getItem(STORAGE_KEYS.MEDIA);
      if (storedMedia) {
        const parsed = JSON.parse(storedMedia);
        // Automatically replenish if stored gallery has fewer than 25 items
        if (Array.isArray(parsed) && parsed.length >= 25) {
          this.mediaList = parsed;
        } else {
          this.mediaList = [...DEMO_MEDIA_SEED];
          this.persistMedia();
        }
      } else {
        this.mediaList = [...DEMO_MEDIA_SEED];
        this.persistMedia();
      }

      const storedBookmarks = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      if (storedBookmarks) {
        this.bookmarkedIds = new Set(JSON.parse(storedBookmarks));
      }

      const storedCompleted = localStorage.getItem(STORAGE_KEYS.COMPLETED_COLLECTIONS);
      if (storedCompleted) {
        this.completedCollections = new Set(JSON.parse(storedCompleted));
      }

      const storedStats = localStorage.getItem(STORAGE_KEYS.STATS);
      if (storedStats) {
        this.stats = JSON.parse(storedStats);
      }

      const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (storedSettings) {
        this.settings = { ...this.settings, ...JSON.parse(storedSettings) };
      }
    } catch {
      this.mediaList = [...DEMO_MEDIA_SEED];
      this.persistMedia();
    }
  }

  // Recharge / Replenish 55+ demo photos so the user can test swiping & cleaning anytime
  public replenishDemoMedia(): number {
    this.mediaList = [...DEMO_MEDIA_SEED];
    this.completedCollections.clear();
    this.clearSession();
    this.persistMedia();
    this.persistCompletedCollections();
    return this.mediaList.length;
  }

  // Appends an extra batch of fresh sample photos without deleting existing ones
  public addMoreSamplePhotos(): number {
    const now = Date.now();
    const batch: MediaItem[] = DEMO_MEDIA_SEED.slice(0, 15).map((item, idx) => ({
      ...item,
      id: `sample-extra-${now}-${idx}`,
      creationTime: now - idx * 3600000 * 24,
      filename: `IMG_${now.toString().slice(-4)}_${item.filename}`,
    }));
    this.mediaList = [...batch, ...this.mediaList];
    this.persistMedia();
    return this.mediaList.length;
  }

  // Resets all completed flags on months/collections so user can test swiping again
  public resetCompletedCollections() {
    this.completedCollections.clear();
    this.persistCompletedCollections();
  }

  private persistMedia() {
    try {
      localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(this.mediaList));
    } catch {
      // storage full or quota exceeded
    }
  }

  private persistBookmarks() {
    try {
      localStorage.setItem(
        STORAGE_KEYS.BOOKMARKS,
        JSON.stringify(Array.from(this.bookmarkedIds))
      );
    } catch {
      // ignore
    }
  }

  private persistCompletedCollections() {
    try {
      localStorage.setItem(
        STORAGE_KEYS.COMPLETED_COLLECTIONS,
        JSON.stringify(Array.from(this.completedCollections))
      );
    } catch {
      // ignore
    }
  }

  public persistStats() {
    try {
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(this.stats));
    } catch {
      // ignore
    }
  }

  public persistSettings(newSettings: Partial<AppSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
    } catch {
      // ignore
    }
    return this.settings;
  }

  public getSettings(): AppSettings {
    return { ...this.settings };
  }

  public isOnboardingDone(): boolean {
    return localStorage.getItem(STORAGE_KEYS.ONBOARDING_DONE) === 'true';
  }

  public setOnboardingDone(done: boolean = true) {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_DONE, done ? 'true' : 'false');
  }

  public getAllMedia(): MediaItem[] {
    return this.mediaList.map((item) => ({
      ...item,
      isBookmarked: this.bookmarkedIds.has(item.id),
    }));
  }

  public getMediaById(id: string): MediaItem | undefined {
    const item = this.mediaList.find((m) => m.id === id);
    if (!item) return undefined;
    return {
      ...item,
      isBookmarked: this.bookmarkedIds.has(item.id),
    };
  }

  public toggleBookmark(id: string): boolean {
    if (this.bookmarkedIds.has(id)) {
      this.bookmarkedIds.delete(id);
    } else {
      this.bookmarkedIds.add(id);
    }
    this.persistBookmarks();
    return this.bookmarkedIds.has(id);
  }

  public getBookmarks(): MediaItem[] {
    return this.getAllMedia().filter((m) => this.bookmarkedIds.has(m.id));
  }

  public addUploadedMedia(items: MediaItem[]) {
    this.mediaList = [...items, ...this.mediaList];
    this.persistMedia();
  }

  // Month collections breakdown
  public getMonthCollections(): MonthCollection[] {
    const groups: Record<string, { items: MediaItem[]; year: number; month: number }> = {};
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    for (const item of this.mediaList) {
      const date = new Date(item.creationTime);
      const year = date.getFullYear();
      const month = date.getMonth(); // 0-11
      const key = `${year}-${String(month + 1).padStart(2, '0')}`;

      if (!groups[key]) {
        groups[key] = { items: [], year, month };
      }
      groups[key].items.push(item);
    }

    const collections: MonthCollection[] = Object.entries(groups).map(([key, group]) => {
      const totalBytes = group.items.reduce((sum, it) => sum + it.fileSize, 0);
      const isCompleted = this.completedCollections.has(key);
      const sampleThumbnail = group.items[0]?.thumbnailUri || group.items[0]?.uri || '';

      return {
        key,
        year: group.year,
        month: group.month,
        monthName: `${monthNames[group.month]} ${group.year}`,
        totalCount: group.items.length,
        reviewedCount: isCompleted ? group.items.length : 0,
        isCompleted,
        sampleThumbnail,
        totalBytes,
      };
    });

    // Sort descending by date
    return collections.sort((a, b) => b.key.localeCompare(a.key));
  }

  public getAlbums(): { name: string; count: number; sampleThumbnail: string }[] {
    const albumMap: Record<string, MediaItem[]> = {};
    for (const item of this.mediaList) {
      const alb = item.albumName || 'Camera';
      if (!albumMap[alb]) albumMap[alb] = [];
      albumMap[alb].push(item);
    }

    return Object.entries(albumMap).map(([name, list]) => ({
      name,
      count: list.length,
      sampleThumbnail: list[0]?.thumbnailUri || list[0]?.uri || '',
    }));
  }

  // Fast entry points
  public getRecents(count = 20): MediaItem[] {
    return [...this.mediaList]
      .sort((a, b) => b.creationTime - a.creationTime)
      .slice(0, count);
  }

  public getRandomSelection(count = 15): MediaItem[] {
    const shuffled = [...this.mediaList].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  public getOnThisDay(): MediaItem[] {
    const today = new Date();
    const todayMonth = today.getMonth();
    const todayDate = today.getDate();

    return this.mediaList.filter((item) => {
      const d = new Date(item.creationTime);
      return (
        d.getMonth() === todayMonth &&
        d.getDate() === todayDate &&
        d.getFullYear() < today.getFullYear()
      );
    });
  }

  // Smart Categories Inspired by Cleaner Guru & Cleaner AI
  public getSimilarAndDuplicates(): MediaItem[] {
    return this.mediaList.filter((item) => {
      const fn = item.filename.toLowerCase();
      return (
        fn.includes('burst') ||
        fn.includes('blur') ||
        fn.includes('01') ||
        fn.includes('02') ||
        fn.includes('copy') ||
        fn.includes('duplicate') ||
        item.id === 'demo-3' ||
        item.id === 'demo-4'
      );
    });
  }

  public getScreenshots(): MediaItem[] {
    return this.mediaList.filter(
      (item) =>
        (item.albumName && item.albumName.toLowerCase().includes('screenshot')) ||
        item.filename.toLowerCase().includes('screenshot')
    );
  }

  public getLargeVideos(): MediaItem[] {
    return this.mediaList
      .filter((item) => item.mediaType === 'video')
      .sort((a, b) => b.fileSize - a.fileSize);
  }

  public getBlurryPhotos(): MediaItem[] {
    return this.mediaList.filter(
      (item) =>
        item.filename.toLowerCase().includes('blur') ||
        item.filename.toLowerCase().includes('mist') ||
        item.id === 'demo-4'
    );
  }

  // Storage breakdown calculations
  public getStorageBreakdown() {
    let totalPhotosSize = 0;
    let totalVideosSize = 0;
    let totalScreenshotsSize = 0;
    let totalDuplicatesSize = 0;
    let photoCount = 0;
    let videoCount = 0;
    let screenshotCount = 0;
    let duplicateCount = 0;

    const screenshots = this.getScreenshots();
    const duplicates = this.getSimilarAndDuplicates();
    const screenshotIds = new Set(screenshots.map((s) => s.id));
    const duplicateIds = new Set(duplicates.map((d) => d.id));

    for (const item of this.mediaList) {
      if (item.mediaType === 'video') {
        totalVideosSize += item.fileSize;
        videoCount += 1;
      } else {
        totalPhotosSize += item.fileSize;
        photoCount += 1;
      }

      if (screenshotIds.has(item.id)) {
        totalScreenshotsSize += item.fileSize;
        screenshotCount += 1;
      }
      if (duplicateIds.has(item.id)) {
        totalDuplicatesSize += item.fileSize;
        duplicateCount += 1;
      }
    }

    const totalMediaBytes = totalPhotosSize + totalVideosSize;
    // Recoverable space estimate (duplicates + screenshots + reclaimable)
    const recoverableBytes = totalDuplicatesSize + Math.round(totalScreenshotsSize * 0.7);

    // Realistic device disk mockup (e.g. 64 GB storage device with 44.8 GB used by system/apps + media)
    const deviceCapacityBytes = 64 * 1024 * 1024 * 1024; // 64 GB
    const baseUsedBytes = 41.2 * 1024 * 1024 * 1024; // system, apps, caches
    const usedBytes = baseUsedBytes + totalMediaBytes - this.stats.bytesReclaimed;
    const freeBytes = Math.max(deviceCapacityBytes - usedBytes, 0);

    return {
      totalMediaBytes,
      totalPhotosSize,
      totalVideosSize,
      totalScreenshotsSize,
      totalDuplicatesSize,
      recoverableBytes,
      photoCount,
      videoCount,
      screenshotCount,
      duplicateCount,
      deviceCapacityBytes,
      usedBytes,
      freeBytes,
      usedPercentage: Math.min(Math.round((usedBytes / deviceCapacityBytes) * 100), 99),
    };
  }

  public getGalleryHealthScore(): number {
    const total = this.mediaList.length;
    if (total === 0) return 100;
    const duplicates = this.getSimilarAndDuplicates().length;
    const screenshots = this.getScreenshots().length;
    const uncleanedClutter = duplicates + screenshots;
    const penalty = Math.min(Math.round((uncleanedClutter / total) * 35), 35);
    const bonus = Math.min(Math.round(this.stats.totalReviewed * 2), 20);
    return Math.min(Math.max(82 - penalty + bonus, 68), 99);
  }

  // Session persistence
  public getSavedSession(): CleanupSession | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSION);
      if (!data) return null;
      const session: CleanupSession = JSON.parse(data);
      // Validate that mediaIds still exist in the current mediaList
      const currentIds = new Set(this.mediaList.map((m) => m.id));
      const validMediaIds = session.mediaIds.filter((id) => currentIds.has(id));
      if (validMediaIds.length === 0 || session.isCompleted) {
        this.clearSession();
        return null;
      }
      return {
        ...session,
        mediaIds: validMediaIds,
      };
    } catch {
      return null;
    }
  }

  public saveSession(session: CleanupSession) {
    try {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    } catch {
      // ignore
    }
  }

  public clearSession() {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  }

  public createSession(
    collectionType: CleanupSession['collectionType'],
    collectionKey: string,
    title: string,
    subtitle: string,
    mediaItems: MediaItem[]
  ): CleanupSession {
    const session: CleanupSession = {
      id: `session_${Date.now()}`,
      title,
      subtitle,
      collectionType,
      collectionKey,
      mediaIds: mediaItems.map((m) => m.id),
      currentIndex: 0,
      decisions: {},
      history: [],
      isCompleted: false,
      createdAt: Date.now(),
      lastActiveTime: Date.now(),
    };
    this.saveSession(session);
    return session;
  }

  // Deletion execution & reconciliation
  public deleteMediaBatch(idsToDelete: string[]): {
    deletedCount: number;
    bytesReclaimed: number;
    remainingItems: MediaItem[];
  } {
    const idSet = new Set(idsToDelete);
    let bytesReclaimed = 0;
    let deletedCount = 0;

    for (const item of this.mediaList) {
      if (idSet.has(item.id)) {
        bytesReclaimed += item.fileSize;
        deletedCount += 1;
      }
    }

    // Filter media library
    this.mediaList = this.mediaList.filter((item) => !idSet.has(item.id));
    this.persistMedia();

    // Clean bookmarks
    for (const id of idsToDelete) {
      this.bookmarkedIds.delete(id);
    }
    this.persistBookmarks();

    // Update real stats
    this.updateStatsAfterCleanup(0, deletedCount, bytesReclaimed);

    return {
      deletedCount,
      bytesReclaimed,
      remainingItems: this.getAllMedia(),
    };
  }

  public completeSession(session: CleanupSession) {
    this.completedCollections.add(session.collectionKey);
    this.persistCompletedCollections();
    this.clearSession();
  }

  public updateStatsAfterCleanup(keptCount: number, deletedCount: number, bytesReclaimed: number) {
    const todayStr = new Date().toISOString().split('T')[0];
    const prevDateStr = this.stats.lastCleanDate;

    let newStreak = this.stats.dailyStreak;
    if (prevDateStr !== todayStr) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (prevDateStr === yesterdayStr) {
        newStreak += 1;
      } else {
        newStreak = 1; // streak reset if skipped day
      }
    }

    this.stats = {
      ...this.stats,
      totalReviewed: this.stats.totalReviewed + keptCount + deletedCount,
      totalKept: this.stats.totalKept + keptCount,
      totalDeleted: this.stats.totalDeleted + deletedCount,
      bytesReclaimed: this.stats.bytesReclaimed + bytesReclaimed,
      dailyStreak: newStreak,
      lastCleanDate: todayStr,
      cleanupLogs: [
        {
          id: `log_${Date.now()}`,
          date: todayStr,
          sessionTitle: `Cleaned on ${todayStr}`,
          keptCount,
          deletedCount,
          bytesReclaimed,
        },
        ...this.stats.cleanupLogs.slice(0, 30), // keep last 30 logs
      ],
    };

    this.persistStats();
  }

  public getStats(): AppStats {
    return { ...this.stats };
  }

  public resetAllData() {
    localStorage.clear();
    this.mediaList = [...DEMO_MEDIA_SEED];
    this.bookmarkedIds = new Set();
    this.completedCollections = new Set();
    this.stats = {
      totalReviewed: 0,
      totalKept: 0,
      totalDeleted: 0,
      bytesReclaimed: 0,
      dailyStreak: 1,
      lastCleanDate: new Date().toISOString().split('T')[0],
      cleanupLogs: [],
    };
    this.persistMedia();
    this.persistBookmarks();
    this.persistCompletedCollections();
    this.persistStats();
  }
}

export const mediaService = new MediaService();

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(new Date(timestamp));
}
