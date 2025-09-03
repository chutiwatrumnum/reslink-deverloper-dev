export interface AuthState {
  isAuth: boolean;
  userId: string | null;
  userFirstName: string;
  userLastName: string;
  userToken: string | null;
}