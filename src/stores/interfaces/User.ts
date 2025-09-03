// src/stores/interfaces/User.ts (ลบ modal states)
export interface UserType {
  userId: string | null;
  userFirstName: string;
  userLastName: string;
  isAuth: boolean;
  userToken: string | null;
  isSignUpModalOpen?: boolean;    // เพิ่มบรรทัดนี้
  isConfirmDetailModalOpen?: boolean;  // เพิ่มบรรทัดนี้
}

export interface LoginPayloadType {
  username: string;
  password: string;
}

export interface ResetPasswordPayloadType {
  email: string;
}