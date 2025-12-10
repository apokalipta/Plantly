// DTO de réponse: pot de l'utilisateur dans une liste.
export class ListPotsResponseDto {
  id!: string;
  name!: string;
  deviceUid!: string;
  lastSeenAt?: Date;
  globalStatus!: 'OK' | 'ACTION_REQUIRED' | 'BAD' | 'OFFLINE';
}

