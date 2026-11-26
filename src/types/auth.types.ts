export interface SendOtpBody {
  phone: string;
}

export interface VerifyOtpBody {
  phone: string;
  otp: string;
}

export interface AuthUser {
  id: string;
  phone: string;
  name: string | null;
  city: string | null;
  schoolName: string | null;
  targetYear: number | null;
  profileComplete: boolean;
  isPremium?: boolean;
}

export interface VerifyOtpData {
  accessToken: string;
  user: AuthUser;
}

export interface RegisterBody {
  name: string;
  city?: string;
  schoolName?: string;
  targetYear?: number;
}
