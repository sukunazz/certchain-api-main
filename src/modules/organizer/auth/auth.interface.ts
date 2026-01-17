export interface OrganizerWithoutPassword {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}
