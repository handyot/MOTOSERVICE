export declare const ALLOWED_USER_ROLES: string[];

export interface UserActionValidation {
  valid: boolean;
  error?: string;
}

export declare function validateUserAction(
  action: string,
  payload?: Record<string, unknown>,
  currentAdminId?: string | null
): UserActionValidation;

export declare function filterUsers<T = unknown>(
  users: T[],
  options?: { search?: string; role?: string; status?: string }
): T[];

export declare function formatUserStatus(user?: { isBanned?: boolean }): {
  label: string;
  badgeClass: string;
  dotClass: string;
};
