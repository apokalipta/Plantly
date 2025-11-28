/**
 * Response DTO representing a user's pot in a list.
 */
export class ListPotsResponseDto {
  id!: string;
  name!: string;
  deviceUid!: string;
  lastSeenAt?: Date;
  globalStatus!: 'OK' | 'ACTION_REQUIRED' | 'BAD' | 'OFFLINE';
}

