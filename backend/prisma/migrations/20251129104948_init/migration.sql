-- CreateTable
CREATE TABLE "PlantSpecies" (
    "id" SERIAL NOT NULL,
    "commonName" TEXT NOT NULL,
    "latinName" TEXT,
    "descriptionShort" TEXT,
    "imageUrl" TEXT,

    CONSTRAINT "PlantSpecies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlantCare" (
    "id" SERIAL NOT NULL,
    "speciesId" INTEGER NOT NULL,
    "minMoisture" DOUBLE PRECISION,
    "maxMoisture" DOUBLE PRECISION,
    "minLight" DOUBLE PRECISION,
    "maxLight" DOUBLE PRECISION,
    "wateringIntervalDays" INTEGER,
    "recommendedTemperatureMin" DOUBLE PRECISION,
    "recommendedTemperatureMax" DOUBLE PRECISION,
    "careTips" TEXT,

    CONSTRAINT "PlantCare_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlantCare_speciesId_key" ON "PlantCare"("speciesId");

-- AddForeignKey
ALTER TABLE "PlantCare" ADD CONSTRAINT "PlantCare_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "PlantSpecies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
