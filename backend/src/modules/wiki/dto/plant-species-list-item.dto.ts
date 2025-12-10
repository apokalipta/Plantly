// DTO liste espèce de plante.
export class PlantSpeciesListItemDto {
  id!: number;
  commonName!: string;
  latinName?: string;
  descriptionShort?: string;
  code?: string;
  imageUrl?: string | null;
}
