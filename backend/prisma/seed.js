const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function seedAchievements(prisma) {
  const achievements = [
    { code: 'PLANT_LVL1', title: 'Ma première plante', description: 'Empotez votre première plante.', category: 'getting_started', icon: 'seedling' },
    { code: 'PLANT_LVL2', title: 'Ma deuxième plante', description: 'Empotez votre deuxième plante.', category: 'getting_started', icon: 'seedling' },
    { code: 'PLANT_LVL3', title: 'Ma Dixième plante', description: 'Vous êtes un amoureux de la nature.', category: 'getting_started', icon: 'seedling' },
    { code: 'PLANT_LVL4', title: 'Ma cinquantième plante', description: 'J\'espere que vous en prenez soins quand même parce-que ça fait beaucoup la..', category: 'getting_started', icon: 'seedling' },
    { code: 'WATER_LVL1', title: 'Gestion de l\'eau', description: 'Maintenez le niveau d\'eau optimal pendant une semaine.', category: 'care', icon: 'water' },
    { code: 'WATER_LVL2', title: 'Arroseur expérimenté', description: 'Maintenez le niveau d\'eau optimal pendant deux semaines.', category: 'care', icon: 'water' },
    { code: 'WATER_LVL3', title: 'Maître de l\'eau', description: 'Maintenez le niveau d\'eau optimal pendant trois semaines.', category: 'care', icon: 'water' },
    { code: 'SUN_LVL1', title: 'Pot éclairé', description: 'Gardez un niveau d\'éclairage optimal pendant une semaine.', category: 'care', icon: 'sun' },
    { code: 'SUN_LVL2', title: 'Pot ensoleillé', description: 'Gardez un niveau d\'éclairage optimal pendant deux semaines.', category: 'care', icon: 'sun' },
    { code: 'SUN_LVL3', title: 'Pot rayonnant', description: 'Gardez un niveau d\'éclairage optimal pendant trois semaines.', category: 'care', icon: 'sun' },
    { code: 'CONSISTENT_LVL1', title: 'Petites attentions', description: 'Verifiez l\'état de votre plante pendant une semaine d\'affilé.', category: 'care', icon: 'calendar' },
    { code: 'CONSISTENT_LVL2', title: 'Afficionado des plantes', description: 'Verifiez l\'état de votre plante pendant deux semaines d\'affilé.', category: 'care', icon: 'calendar' },
    { code: 'CONSISTENT_LVL3', title: 'Amoureux des plantes', description: 'Verifiez l\'état de votre plante pendant trois semaines d\'affilé.', category: 'care', icon: 'calendar' },
    { code: 'PERFECT_WEEK_LVL1', title: 'Semaine parfaite', description: 'Maintenez les conditions idéales pour votre pot pendant une semaine.', category: 'care', icon: 'trophy' },
    { code: 'PERFECT_WEEK_LVL2', title: 'Inarrêtable !?', description: 'Maintenez les conditions idéales pour votre pot pendant deux semaines.', category: 'care', icon: 'trophy' },
    { code: 'PERFECT_WEEK_LVL3', title: 'Dieu des plantes', description: 'Maintenez les conditions idéales pour votre pot pendant trois semaines.', category: 'care', icon: 'trophy' },
    { code: 'PROFILE_PICTURE', title: 'Ce que vous êtes beaux', description: 'Changez votre photo de profile.', category: 'Customization', icon: 'camera' },
    //Achievements à continuer !!!!!!

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
        minMoisture: 30.0,
        maxMoisture: 70.0,
        minLight: 200,
        maxLight: 1000,
        wateringIntervalDays: 3,
        recommendedTemperatureMin: 18.0,
        recommendedTemperatureMax: 26.0,
        careTips: 'Maintenir le sol légèrement humide, éviter le plein soleil brûlant.',
      },
    },
    {
      commonName: 'Menthe',
      latinName: 'Mentha spicata',
      descriptionShort: 'Plante aromatique très vigoureuse.',
      imageUrl: null,
      care: {
        minMoisture: 40.0,
        maxMoisture: 80.0,
        minLight: 150,
        maxLight: 900,
        wateringIntervalDays: 2,
        recommendedTemperatureMin: 15.0,
        recommendedTemperatureMax: 28.0,
        careTips: 'Arroser régulièrement, supporte mi-ombre.',
      },
    },
    {
      commonName: 'Succulente',
      latinName: 'Sedum sp.',
      descriptionShort: 'Plante très tolérante à la sécheresse.',
      imageUrl: null,
      care: {
        minMoisture: 10.0,
        maxMoisture: 30.0,
        minLight: 500,
        maxLight: 1500,
        wateringIntervalDays: 14,
        recommendedTemperatureMin: 16.0,
        recommendedTemperatureMax: 30.0,
        careTips: 'Arroser très modérément, aime la lumière forte.',
      },
    },
    {
      commonName: 'Basilic',
      latinName: 'Ocimum basilicum',
      descriptionShort: 'Plante aromatique facile à cultiver, idéale pour l’intérieur ou un balcon ensoleillé.',
      imageUrl: null,
      care: {
        minMoisture: 30.0,
        maxMoisture: 70.0,
        minLight: 400,
        maxLight: 1200,
        wateringIntervalDays: 3,
        recommendedTemperatureMin: 18.0,
        recommendedTemperatureMax: 26.0,
        careTips: 'Placez la plante en plein soleil (6–8h/jour si possible), arrosez régulièrement en maintenant le sol légèrement humide mais sans détremper.'
      },
    },
    {
      commonName: 'Menthe poivrée',
      latinName: 'Mentha × piperita',
      descriptionShort: 'Herbe aromatique robuste et rafraîchissante, pousse très facilement en pot.',
      imageUrl: null,
      care: {
        minMoisture: 40.0,
        maxMoisture: 80.0,
        minLight: 200,
        maxLight: 800,
        wateringIntervalDays: 4,
        recommendedTemperatureMin: 15.0,
        recommendedTemperatureMax: 25.0,
        careTips: 'Arroser quand le substrat commence à sécher. Tolère bien la mi-ombre. Cultiver seule car elle est envahissante.'
      },
    },
    {
      commonName: 'Persil plat',
      latinName: 'Petroselinum crispum neapolitanum',
      descriptionShort: 'Plante aromatique bisannuelle, idéale en pot et facile d’entretien.',
      imageUrl: null,
      care: {
        minMoisture: 35.0,
        maxMoisture: 70.0,
        minLight: 250,
        maxLight: 900,
        wateringIntervalDays: 4,
        recommendedTemperatureMin: 12.0,
        recommendedTemperatureMax: 22.0,
        careTips: 'Lumière modérée à vive, sol légèrement humide, éviter l’excès d’eau.'
      },
    },
    {
      commonName: 'Thym',
      latinName: 'Thymus vulgaris',
      descriptionShort: 'Aromatique méditerranéenne résistante, adore la chaleur et la lumière.',
      imageUrl: null,
      care: {
        minMoisture: 20.0,
        maxMoisture: 50.0,
        minLight: 500,
        maxLight: 1500,
        wateringIntervalDays: 7,
        recommendedTemperatureMin: 10.0,
        recommendedTemperatureMax: 28.0,
        careTips: 'Laisser le sol sécher entre deux arrosages. Plein soleil indispensable. Sol drainant.'
      },
    },
    {
      commonName: 'Tomate cerise',
      latinName: 'Solanum lycopersicum var. cerasiforme',
      descriptionShort: 'Petit plant de tomate idéal en pot, produisant des fruits sucrés.',
      imageUrl: null,
      care: {
        minMoisture: 45.0,
        maxMoisture: 75.0,
        minLight: 600,
        maxLight: 2000,
        wateringIntervalDays: 5,
        recommendedTemperatureMin: 16.0,
        recommendedTemperatureMax: 30.0,
        careTips: 'Plein soleil obligatoire. Sol riche. Maintenir une humidité régulière sans saturer.'
      },
    },
    {
      commonName: 'Pois nain',
      latinName: 'Pisum sativum var. saccharatum',
      descriptionShort: 'Légumineuse compacte très simple à cultiver en pot.',
      imageUrl: null,
      care: {
        minMoisture: 40.0,
        maxMoisture: 70.0,
        minLight: 500,
        maxLight: 1500,
        wateringIntervalDays: 5,
        recommendedTemperatureMin: 12.0,
        recommendedTemperatureMax: 24.0,
        careTips: 'Aime le soleil. Garder le sol modérément humide, surtout durant la floraison.'
      },
    },
    {
      commonName: 'Tournesol nain',
      latinName: 'Helianthus annuus (nanus)',
      descriptionShort: 'Tournesol de petite taille, parfait pour les pots et balcons.',
      imageUrl: null,
      care: {
        minMoisture: 40.0,
        maxMoisture: 70.0,
        minLight: 800,
        maxLight: 2000,
        wateringIntervalDays: 5,
        recommendedTemperatureMin: 15.0,
        recommendedTemperatureMax: 28.0,
        careTips: 'Exposition plein soleil indispensable. Arroser régulièrement sans détremper.'
      },
    },
    {
      commonName: 'Capucine',
      latinName: 'Tropaeolum majus',
      descriptionShort: 'Plante fleurie comestible, colorée et facile d’entretien.',
      imageUrl: null,
      care: {
        minMoisture: 45.0,
        maxMoisture: 75.0,
        minLight: 600,
        maxLight: 1400,
        wateringIntervalDays: 6,
        recommendedTemperatureMin: 10.0,
        recommendedTemperatureMax: 24.0,
        careTips: 'Soleil ou légère mi-ombre. Sol léger, arrosages modérés. Supprimer les fleurs fanées.'
      }
    }

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
    const firstPlant = await prisma.achievement.findUnique({ where: { code: 'PLANT_LVL1' } });
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
