const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function seedAchievements(prisma) {
  const achievements = [
    { code: 'FIRST_PLANT', title: 'First Plant', description: 'Create your first plant.', category: 'getting_started', icon: 'seedling' },
    { code: 'WATER_MASTER', title: 'Water Master', description: 'Maintain optimal moisture for a week.', category: 'care', icon: 'water' },
    { code: 'SUNNY_SPOT', title: 'Sunny Spot', description: 'Keep light levels ideal for 3 days.', category: 'care', icon: 'sun' },
    { code: 'CONSISTENT_CARE', title: 'Consistent Care', description: 'Daily checks for a week.', category: 'habit', icon: 'calendar' },
    { code: 'PERFECT_WEEK', title: 'Perfect Week', description: 'Maintain ideal conditions for a full week.', category: 'care', icon: 'trophy' },
  ];
  for (const a of achievements) {
    await prisma.achievement.upsert({
      where: { code: a.code },
      update: { title: a.title, description: a.description, category: a.category, icon: a.icon },
      create: { code: a.code, title: a.title, description: a.description, category: a.category, icon: a.icon },
    });
  }
}

async function main() {
  await seedAchievements(prisma);

  const wikiSpecies = [
    {
      commonName: 'Basilic',
      latinName: 'Ocimum basilicum',
      descriptionShort: 'Plante aromatique facile à cultiver.',
      imageUrl: null,
      care: {
        minMoisture: 30,
        maxMoisture: 70,
        minLight: 200,
        maxLight: 1000,
        wateringIntervalDays: 3,
        recommendedTemperatureMin: 18,
        recommendedTemperatureMax: 26,
        careTips: 'Maintenir le sol légèrement humide, éviter le plein soleil brûlant.',
      },
    },
    {
      commonName: 'Menthe',
      latinName: 'Mentha spicata',
      descriptionShort: 'Plante aromatique très vigoureuse.',
      imageUrl: null,
      care: {
        minMoisture: 40,
        maxMoisture: 80,
        minLight: 150,
        maxLight: 900,
        wateringIntervalDays: 2,
        recommendedTemperatureMin: 15,
        recommendedTemperatureMax: 28,
        careTips: 'Arroser régulièrement, supporte mi-ombre.',
      },
    },
    {
      commonName: 'Succulente',
      latinName: 'Sedum sp.',
      descriptionShort: 'Plante très tolérante à la sécheresse.',
      imageUrl: null,
      care: {
        minMoisture: 10,
        maxMoisture: 30,
        minLight: 500,
        maxLight: 1500,
        wateringIntervalDays: 14,
        recommendedTemperatureMin: 16,
        recommendedTemperatureMax: 30,
        careTips: 'Arroser très modérément, aime la lumière forte.',
      },
    },
  ];

  const speciesMap = {};
  for (const s of wikiSpecies) {
    const species = await prisma.plantSpecies.upsert({
      where: { commonName: s.commonName },
      update: {},
      create: {
        commonName: s.commonName,
        latinName: s.latinName,
        descriptionShort: s.descriptionShort,
        imageUrl: s.imageUrl,
      },
    });
    speciesMap[s.commonName] = species;
    await prisma.plantCare.upsert({
      where: { speciesId: species.id },
      update: { ...s.care },
      create: { speciesId: species.id, ...s.care },
    });
  }

  async function seedUser() {
    const email = 'demo.user@example.com';
    const password = 'Demo1234!';
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.upsert({
      where: { email },
      update: { emailVerified: true },
      create: { email, passwordHash, emailVerified: true },
    });
    return user;
  }

  async function seedDeviceForUser(user, basilicSpecies) {
    const deviceUid = 'POT-DEMO-001';
    const name = 'Demo Pot';
    const pairingCode = '999999';
    const device = await prisma.device.upsert({
      where: { deviceUid },
      update: {},
      create: {
        deviceUid,
        deviceSecretHash: 'DEMO_SECRET',
        ownerId: null,
        name,
        pairingCode,
        pairedAt: null,
      },
    });

    const paired = await prisma.device.update({
      where: { id: device.id },
      data: { ownerId: user.id, pairedAt: new Date(), pairingCode: null },
    });

    let plant = await prisma.plantInstance.findFirst({ where: { deviceId: paired.id, status: 'ACTIVE' } });
    if (!plant) {
      plant = await prisma.plantInstance.create({
        data: {
          deviceId: paired.id,
          speciesId: basilicSpecies.id,
          nickname: 'Basilou',
          plantedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          status: 'ACTIVE',
        },
      });
    }

    return { device: paired, plantInstance: plant };
  }

  async function seedSensorReadings(device, plantInstance) {
    const now = Date.now();
    const points = [
      { ts: new Date(now - 3 * 60 * 60 * 1000), soilMoisture: 45, lightLevel: 600, temperature: 22 }, // OK
      { ts: new Date(now - 2 * 60 * 60 * 1000), soilMoisture: 32, lightLevel: 210, temperature: 21 }, // ACTION_REQUIRED (slightly low)
      { ts: new Date(now - 1 * 60 * 60 * 1000), soilMoisture: 12, lightLevel: 120, temperature: 20 }, // BAD (very low moisture, low light)
      { ts: new Date(now - 0.5 * 60 * 60 * 1000), soilMoisture: 35, lightLevel: 300, temperature: 21 }, // ACTION_REQUIRED / borderline
      { ts: new Date(now - 10 * 60 * 1000), soilMoisture: 50, lightLevel: 700, temperature: 22 }, // OK
    ];

    for (const p of points) {
      const exists = await prisma.sensorReading.findFirst({ where: { deviceId: device.id, timestamp: p.ts } });
      if (!exists) {
        await prisma.sensorReading.create({
          data: {
            deviceId: device.id,
            timestamp: p.ts,
            soilMoisture: p.soilMoisture,
            lightLevel: p.lightLevel,
            temperature: p.temperature,
          },
        });
      }
    }
  }

  async function seedUserAchievements(user) {
    const firstPlant = await prisma.achievement.findUnique({ where: { code: 'FIRST_PLANT' } });
    if (firstPlant) {
      const existing = await prisma.userAchievement.findFirst({ where: { userId: user.id, achievementId: firstPlant.id } });
      if (!existing) {
        await prisma.userAchievement.create({ data: { userId: user.id, achievementId: firstPlant.id } });
      }
    }
  }

  const user = await seedUser();
  const { device, plantInstance } = await seedDeviceForUser(user, speciesMap['Basilic']);
  await seedSensorReadings(device, plantInstance);
  await seedUserAchievements(user);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('Seed completed');
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
