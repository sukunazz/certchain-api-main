export interface UserWithoutPassword {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  isVerified: boolean;
  verificationToken?: string | null;
  resetPasswordToken?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}
