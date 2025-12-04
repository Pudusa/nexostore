export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  phone?: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
