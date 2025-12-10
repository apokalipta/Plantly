// DTO succès: définition + état utilisateur (débloqué, date).
export class AchievementStatusDto {
  // Identifiant
  id!: number;
  // Code
  code!: string;
  // Titre
  title!: string;
  // Description
  description!: string;
  // Catégorie optionnelle
  category?: string;
  // Icône optionnelle
  icon?: string;
  // Débloqué
  unlocked!: boolean;
  // Date de déblocage
  unlockedAt?: Date | null;
}

