export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export declare function validateEmail(email: string): ValidationResult;
export declare function validatePassword(password: string): ValidationResult;
export declare function validateFullName(name: string): ValidationResult;
export declare function validatePhone(phone?: string | null): ValidationResult;
export declare function getSafeRedirectUrl(target: string | null | undefined, fallback?: string): string;
