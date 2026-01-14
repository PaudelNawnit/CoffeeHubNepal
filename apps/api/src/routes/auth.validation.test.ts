import { describe, expect, it } from 'vitest';
import {
  signupSchema,
  completeSignupSchema,
  updateProfileSchema,
  emailSchema
} from './auth.js';

describe('Auth input validation hardening', () => {
  it('rejects overly long email addresses', () => {
    const longLocal = 'a'.repeat(300);
    const email = `${longLocal}@example.com`;
    const result = emailSchema.safeParse(email);
    expect(result.success).toBe(false);
  });

  it('enforces max length on name / phone / location during signup', () => {
    const result = signupSchema.safeParse({
      email: 'user@example.com',
      password: 'StrongPass1',
      name: 'a'.repeat(101),
      phone: '1'.repeat(25),
      location: 'x'.repeat(300)
    });
    expect(result.success).toBe(false);
  });

  it('enforces avatar size constraint in profile update', () => {
    const bigAvatar = 'x'.repeat(600000); // > 550000 threshold
    const parsed = updateProfileSchema.safeParse({
      name: 'User',
      avatar: bigAvatar
    });
    expect(parsed.success).toBe(false);
  });

  it('reuses the same constraints for complete-signup', () => {
    const result = completeSignupSchema.safeParse({
      token: 'abc123',
      password: 'StrongPass1',
      name: 'a'.repeat(101)
    });
    expect(result.success).toBe(false);
  });
});

