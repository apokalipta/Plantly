// DTO détails espèce de plante (avec conseils de soin).
export class PlantSpeciesDetailsDto {
  id!: number;
  commonName!: string;
  latinName?: string;
  descriptionShort?: string;
  imageUrl?: string;
  type?: string;
  code?: string;
  care!: {
    minMoisture?: number;
    maxMoisture?: number;
    minLight?: number;
    maxLight?: number;
    wateringIntervalDays?: number;
    recommendedTemperatureMin?: number;
    recommendedTemperatureMax?: number;
    careTips?: string;
    plantingTips?: string;
    maintenanceTips?: string;
  };
}
