export class PlantSpeciesDetailsDto {
  id!: number;
  commonName!: string;
  latinName?: string;
  descriptionShort?: string;
  imageUrl?: string;
  care!: {
    minMoisture?: number;
    maxMoisture?: number;
    minLight?: number;
    maxLight?: number;
    wateringIntervalDays?: number;
    recommendedTemperatureMin?: number;
    recommendedTemperatureMax?: number;
    careTips?: string;
  };
}

