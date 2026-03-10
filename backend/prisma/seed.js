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

  // Nettoyage des doublons (anciennes versions en minuscules/mal nommées)
  const duplicatesToDelete = [
    'Menthe poivrée',
    'Persil plat',
    'Pois nain',
    'Tomate cerise',
    'Tournesol nain',
    'Tournesol' // Au cas où
  ];

  for (const name of duplicatesToDelete) {
    const species = await prisma.plantSpecies.findFirst({ where: { commonName: name } });
    if (species) {
      console.log(`Deleting duplicate species: ${name} (ID: ${species.id})`);
      // Supprimer d'abord les infos de soin liées
      await prisma.plantCare.deleteMany({ where: { speciesId: species.id } });
      // Supprimer l'espèce (si non utilisée par des plantes, sinon ça plantera et c'est bien de le savoir)
      try {
        await prisma.plantSpecies.delete({ where: { id: species.id } });
      } catch (e) {
        console.warn(`Could not delete ${name} (probably in use by a plantInstance).`);
      }
    }
  }

  const wikiSpecies = [
    {
      commonName: 'Basilic',
      latinName: 'Ocimum basilicum',
      descriptionShort: 'L\'herbe incontournable des pizzas et pestos.',
      imageUrl: '/static/plants/basilic.png',
      type: 'AROMATIQUE',
      care: {
        minMoisture: 30.0,
        maxMoisture: 70.0,
        minLight: 400,
        maxLight: 1200,
        wateringIntervalDays: 3,
        recommendedTemperatureMin: 18.0,
        recommendedTemperatureMax: 26.0,
        careTips: 'Gardez la terre un peu humide, mais pas détrempée. Attention au soleil direct qui brûle les feuilles.',
        plantingTips: 'Plantez-le au printemps, après les dernières gelées. Il aime une terre riche. Espacez les pieds de 20cm. Astuce : il adore pousser à côté des tomates !',
        maintenanceTips: 'Arrosez au pied, sans mouiller les feuilles (ça évite les maladies). Coupez les petites fleurs dès qu\'elles apparaissent pour qu\'il fasse plus de feuilles.'
      },
    },
    {
      commonName: 'Menthe',
      latinName: 'Mentha spicata',
      descriptionShort: 'Parfaite pour les thés et les mojitos, ça sent super bon !',
      imageUrl: '/static/plants/menthe.png',
      type: 'AROMATIQUE',
      care: {
        minMoisture: 40.0,
        maxMoisture: 80.0,
        minLight: 150,
        maxLight: 900,
        wateringIntervalDays: 2,
        recommendedTemperatureMin: 15.0,
        recommendedTemperatureMax: 28.0,
        careTips: 'Elle a tout le temps soif ! Arrosez souvent.',
        plantingTips: 'Mettez-la toute seule dans son pot car elle envahit tout avec ses racines. Elle aime la terre toujours un peu humide et la mi-ombre.',
        maintenanceTips: 'Arrosez très souvent, la terre ne doit jamais sécher complètement. Coupez souvent les tiges pour en avoir de nouvelles toutes fraîches.'
      },
    },
    {
      commonName: 'Menthe Poivrée',
      latinName: 'Mentha x piperita',
      descriptionShort: 'Une menthe au goût très fort, comme un bonbon à la menthe.',
      imageUrl: '/static/plants/menthe-poivree.png',
      type: 'AROMATIQUE',
      care: {
        minMoisture: 40.0,
        maxMoisture: 80.0,
        minLight: 150,
        maxLight: 900,
        wateringIntervalDays: 2,
        recommendedTemperatureMin: 15.0,
        recommendedTemperatureMax: 25.0,
        careTips: 'Dès que la terre sèche en surface, hop, un peu d\'eau !',
        plantingTips: 'Comme sa cousine la menthe verte, gardez-la dans son propre pot. Utilisez un terreau qui garde bien l\'eau.',
        maintenanceTips: 'Gardez la terre humide. Avant l\'hiver, coupez tout à ras du sol, elle repoussera au printemps. Tous les 2-3 ans, divisez la plante pour lui redonner de la vigueur.'
      },
    },
    {
      commonName: 'Capucine',
      latinName: 'Tropaeolum majus',
      descriptionShort: 'Jolies fleurs qui se mangent et protègent le potager.',
      imageUrl: '/static/plants/capucine.png',
      type: 'COMESTIBLE',
      care: {
        minMoisture: 30.0,
        maxMoisture: 60.0,
        minLight: 500,
        maxLight: 1400,
        wateringIntervalDays: 5,
        recommendedTemperatureMin: 10.0,
        recommendedTemperatureMax: 28.0,
        careTips: 'Très facile à vivre, elle attire les pucerons (pour sauver les autres plantes).',
        plantingTips: 'Semez les graines en mai. Elle pousse même dans une terre un peu pauvre. Elle aime le soleil ou un peu d\'ombre.',
        maintenanceTips: 'Arrosez quand c\'est sec. Ne mettez pas d\'engrais, sinon elle fera plein de feuilles mais pas de fleurs ! Vérifiez s\'il y a des pucerons sous les feuilles.'
      },
    },
    {
      commonName: 'Persil Plat',
      latinName: 'Petroselinum crispum',
      descriptionShort: 'Le roi des herbes en cuisine, avec beaucoup de goût.',
      imageUrl: '/static/plants/persil-plat.png',
      type: 'AROMATIQUE',
      care: {
        minMoisture: 40.0,
        maxMoisture: 75.0,
        minLight: 250,
        maxLight: 1000,
        wateringIntervalDays: 3,
        recommendedTemperatureMin: 12.0,
        recommendedTemperatureMax: 24.0,
        careTips: 'Il aime la fraîcheur, gardez sa terre humide.',
        plantingTips: 'Astuce : trempez les graines 1 jour dans l\'eau avant de semer, ça pousse plus vite ! Il aime la terre riche et légère.',
        maintenanceTips: 'Gardez la terre humide. Coupez les tiges qui montent en fleurs pour continuer à récolter des feuilles. Cueillez feuille par feuille selon vos besoins.'
      },
    },
    {
      commonName: 'Pois Nain',
      latinName: 'Pisum sativum',
      descriptionShort: 'Des petits pois faciles à faire pousser, même sur un balcon.',
      imageUrl: '/static/plants/poie-nain.png',
      type: 'COMESTIBLE',
      care: {
        minMoisture: 40.0,
        maxMoisture: 70.0,
        minLight: 400,
        maxLight: 1200,
        wateringIntervalDays: 4,
        recommendedTemperatureMin: 10.0,
        recommendedTemperatureMax: 24.0,
        careTips: 'Il n\'aime pas quand il fait trop chaud.',
        plantingTips: 'Semez au printemps (mars-avril). Mettez la graine à 2-3 cm sous terre. Espacez un peu les graines. Pas besoin de grands tuteurs.',
        maintenanceTips: 'Arrosez régulièrement pour que la terre reste fraîche (sinon les pois sont durs). Quand la plante fait 15cm, ramenez un peu de terre sur la base de la tige pour la tenir.'
      },
    },
    {
      commonName: 'Succulente',
      latinName: 'Echeveria / Sedum',
      descriptionShort: 'Petite plante grasse toute mignonne et quasi immortelle.',
      imageUrl: '/static/plants/succulente.png',
      type: 'DECORATIVE',
      care: {
        minMoisture: 10.0,
        maxMoisture: 30.0,
        minLight: 800,
        maxLight: 2000,
        wateringIntervalDays: 15,
        recommendedTemperatureMin: 5.0,
        recommendedTemperatureMax: 35.0,
        careTips: 'Surtout, pas trop d\'eau ! C\'est son pire ennemi.',
        plantingTips: 'Il faut absolument un pot avec un trou au fond. Mélangez du terreau avec du sable. Mettez-la en plein soleil.',
        maintenanceTips: 'Oubliez-la ! Arrosez seulement quand la terre est ultra sèche (toutes les 2 semaines en été, 1 fois par mois en hiver). Ne laissez jamais d\'eau dans la soucoupe.'
      },
    },
    {
      commonName: 'Thym',
      latinName: 'Thymus vulgaris',
      descriptionShort: 'L\'odeur de la Provence ! Parfait pour la cuisine et les tisanes.',
      imageUrl: '/static/plants/thym.png',
      type: 'AROMATIQUE',
      care: {
        minMoisture: 10.0,
        maxMoisture: 40.0,
        minLight: 800,
        maxLight: 2000,
        wateringIntervalDays: 10,
        recommendedTemperatureMin: 5.0,
        recommendedTemperatureMax: 35.0,
        careTips: 'Il adore le soleil et déteste avoir les pieds dans l\'eau.',
        plantingTips: 'Plantez au printemps. Il aime les sols avec des cailloux, qui ne gardent pas l\'eau. Il lui faut absolument beaucoup de soleil.',
        maintenanceTips: 'Arrosez très peu, seulement s\'il ne pleut pas depuis longtemps. Après les fleurs, coupez un peu les tiges pour qu\'il reste joli et touffu.'
      },
    },
    {
      commonName: 'Tomate Cerise',
      latinName: 'Solanum lycopersicum',
      descriptionShort: 'Le top pour l\'apéro !',
      imageUrl: '/static/plants/tomate-cerise.png',
      type: 'COMESTIBLE',
      care: {
        minMoisture: 50.0,
        maxMoisture: 80.0,
        minLight: 600,
        maxLight: 1500,
        wateringIntervalDays: 2,
        recommendedTemperatureMin: 15.0,
        recommendedTemperatureMax: 30.0,
        careTips: 'Elle mange et boit beaucoup !',
        plantingTips: 'Plantez-la profond (enterrez un peu la tige). Mettez une terre riche (compost). Mettez tout de suite un bâton (tuteur) pour la tenir.',
        maintenanceTips: 'Arrosez souvent au pied (pas sur les feuilles). Mettez de la paille au pied si possible. Pour les tomates cerises, pas besoin de couper les petites tiges sur les côtés.'
      },
    },
    {
      commonName: 'Tournesol Nain',
      latinName: 'Helianthus annuus',
      descriptionShort: 'Un mini soleil dans un pot, super facile.',
      imageUrl: '/static/plants/tournesol-nain.png',
      type: 'DECORATIVE',
      care: {
        minMoisture: 40.0,
        maxMoisture: 75.0,
        minLight: 800,
        maxLight: 2000,
        wateringIntervalDays: 3,
        recommendedTemperatureMin: 15.0,
        recommendedTemperatureMax: 30.0,
        careTips: 'Il suit le soleil et grandit vite.',
        plantingTips: 'Semez en mai. Il aime la bonne terre riche et le plein soleil.',
        maintenanceTips: 'Arrosez souvent, s\'il a soif il fait la tête tout de suite ! Si vous le mettez en pot, donnez-lui un peu d\'engrais.'
      },
    },
    {
      commonName: 'Fittonia',
      latinName: 'Fittonia albivenis',
      descriptionShort: 'Une plante aux feuilles décorées comme une mosaïque.',
      imageUrl: '/static/plants/fittonia.png',
      type: 'DECORATIVE',
      care: {
        minMoisture: 50.0,
        maxMoisture: 80.0,
        minLight: 300,
        maxLight: 1000,
        wateringIntervalDays: 3,
        recommendedTemperatureMin: 18.0,
        recommendedTemperatureMax: 24.0,
        careTips: 'Dès qu\'elle a soif, ses feuilles deviennent toutes molles (c\'est une drama queen).',
        plantingTips: 'Elle aime les endroits humides, comme un terrarium ou une salle de bain avec fenêtre. Mettez-la dans une terre légère.',
        maintenanceTips: 'Arrosez dès que la terre est sèche au dessus. Vaporisez de l\'eau sur ses feuilles pour qu\'elle soit contente. Si elle grandit trop, coupez un peu les tiges.'
      },
    },
    {
      commonName: 'Peperomia',
      latinName: 'Peperomia obtusifolia',
      descriptionShort: 'Petite plante costaude avec des feuilles bien épaisses.',
      imageUrl: '/static/plants/peperomia.png',
      type: 'DECORATIVE',
      care: {
        minMoisture: 20.0,
        maxMoisture: 50.0,
        minLight: 400,
        maxLight: 1200,
        wateringIntervalDays: 7,
        recommendedTemperatureMin: 15.0,
        recommendedTemperatureMax: 26.0,
        careTips: 'Elle n\'aime pas avoir les pieds dans l\'eau, laissez la terre sécher.',
        plantingTips: 'Un petit pot lui suffit, elle a des petites racines. Mettez du sable dans la terre pour que l\'eau s\'écoule bien.',
        maintenanceTips: 'N\'arrosez pas trop souvent. Passez un petit coup de chiffon humide sur les feuilles pour enlever la poussière.'
      },
    },
    {
      commonName: 'Pilea',
      latinName: 'Pilea peperomioides',
      descriptionShort: 'La plante aux feuilles toutes rondes, comme des pièces de monnaie.',
      imageUrl: '/static/plants/piléa.png',
      type: 'DECORATIVE',
      care: {
        minMoisture: 30.0,
        maxMoisture: 60.0,
        minLight: 500,
        maxLight: 1500,
        wateringIntervalDays: 5,
        recommendedTemperatureMin: 15.0,
        recommendedTemperatureMax: 25.0,
        careTips: 'Tournez le pot de temps en temps, sinon elle va pencher vers la lumière.',
        plantingTips: 'Utilisez un terreau classique pour plantes vertes. Elle aime être un peu serrée dans son pot.',
        maintenanceTips: 'Arrosez quand la terre est sèche au dessus. Elle fait plein de bébés au pied, vous pourrez les replanter !'
      },
    },
    {
      commonName: 'Calathea',
      latinName: 'Calathea makoyana',
      descriptionShort: 'Ses feuilles sont magnifiques, on dirait des plumes de paon.',
      imageUrl: '/static/plants/calathea.png',
      type: 'DECORATIVE',
      care: {
        minMoisture: 50.0,
        maxMoisture: 80.0,
        minLight: 300,
        maxLight: 1000,
        wateringIntervalDays: 4,
        recommendedTemperatureMin: 18.0,
        recommendedTemperatureMax: 25.0,
        careTips: 'Elle n\'aime pas l\'air sec ni le calcaire.',
        plantingTips: 'Mettez des billes d\'argile au fond du pot. Elle aime la terre riche (humus).',
        maintenanceTips: 'Si possible, arrosez avec de l\'eau de pluie ou filtrée. Vaporisez souvent de l\'eau sur les feuilles. Protégez-la des courants d\'air.'
      },
    },
    {
      commonName: 'Chlorophytum',
      latinName: 'Chlorophytum comosum',
      descriptionShort: 'La plante araignée : super facile et purifie l\'air.',
      imageUrl: '/static/plants/chlorophytum.png',
      type: 'DECORATIVE',
      care: {
        minMoisture: 30.0,
        maxMoisture: 70.0,
        minLight: 500,
        maxLight: 1500,
        wateringIntervalDays: 5,
        recommendedTemperatureMin: 10.0,
        recommendedTemperatureMax: 30.0,
        careTips: 'Si le bout des feuilles devient marron, c\'est que l\'air est trop sec.',
        plantingTips: 'Elle pousse partout ! Attention, ses grosses racines peuvent déformer les pots en plastique trop fins.',
        maintenanceTips: 'Arrosez bien en été. Elle fait des grandes tiges avec des bébés plantes au bout : vous pouvez les couper et les replanter.'
      },
    },
    {
      commonName: 'Maranta',
      latinName: 'Maranta leuconeura',
      descriptionShort: 'La plante qui dort : elle replie ses feuilles vers le haut la nuit.',
      imageUrl: '/static/plants/maranta.png',
      type: 'DECORATIVE',
      care: {
        minMoisture: 50.0,
        maxMoisture: 80.0,
        minLight: 300,
        maxLight: 1000,
        wateringIntervalDays: 4,
        recommendedTemperatureMin: 18.0,
        recommendedTemperatureMax: 25.0,
        careTips: 'Ses racines sont courtes, utilisez un pot large plutôt que profond.',
        plantingTips: 'Elle aime la terre légère et acide (terre de bruyère). Mettez des billes au fond du pot pour le drainage.',
        maintenanceTips: 'Gardez la terre toujours un peu humide. Vaporisez les feuilles. Si les couleurs palissent, c\'est qu\'elle manque de lumière.'
      },
    },
    {
      commonName: 'Monstera',
      latinName: 'Monstera deliciosa',
      descriptionShort: 'La star d\'Instagram avec ses feuilles géantes trouées.',
      imageUrl: '/static/plants/monstera.png',
      type: 'DECORATIVE',
      care: {
        minMoisture: 30.0,
        maxMoisture: 60.0,
        minLight: 500,
        maxLight: 1500,
        wateringIntervalDays: 7,
        recommendedTemperatureMin: 18.0,
        recommendedTemperatureMax: 30.0,
        careTips: 'Passez une éponge humide sur les grandes feuilles pour enlever la poussière.',
        plantingTips: 'Prévoyez un gros pot solide. Il faut absolument mettre un gros tuteur (bâton) pour qu\'elle puisse grimper.',
        maintenanceTips: 'Laissez la terre sécher entre deux arrosages. Elle fait des racines dans l\'air : ne les coupez pas, essayez de les diriger vers la terre.'
      },
    },
  ];

  const speciesMap = {};
  for (const s of wikiSpecies) {
    const species = await prisma.plantSpecies.upsert({
      where: { commonName: s.commonName },
      update: { imageUrl: s.imageUrl, type: s.type },
      create: {
        commonName: s.commonName,
        latinName: s.latinName,
        descriptionShort: s.descriptionShort,
        imageUrl: s.imageUrl,
        type: s.type,
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
      update: { emailVerified: true, username: 'user-demo' },
      create: { email, username: 'user-demo', passwordHash, emailVerified: true },
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
        deviceSecret: 'DEMO_SECRET',
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

  async function seedBaseForUser(user) {
    const baseUid = 'BASE_TEST_01';
    
    // Check if base exists
    const existingBase = await prisma.baseDevice.findUnique({ where: { baseUid } });
    if (existingBase) {
      console.log(`Base ${baseUid} already exists, skipping creation.`);
      return existingBase;
    }

    console.log(`Creating base ${baseUid} for user ${user.id}...`);
    const base = await prisma.baseDevice.create({
      data: {
        baseUid,
        ownerId: user.id,
        name: 'Plantly Base (Test)',
        slots: {
          create: [
            { slotIndex: 1, potFormat: 'SMALL' },
            { slotIndex: 2, potFormat: 'SMALL' },
            { slotIndex: 3, potFormat: 'SMALL' },
            { slotIndex: 4, potFormat: 'SMALL' },
          ]
        }
      }
    });
    console.log(`Base ${baseUid} created with 4 slots.`);
    return base;
  }

  const user = await seedUser();
  const { device, plantInstance } = await seedDeviceForUser(user, speciesMap['Basilic']);
  await seedSensorReadings(device, plantInstance);
  await seedUserAchievements(user);
  await seedBaseForUser(user);
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
