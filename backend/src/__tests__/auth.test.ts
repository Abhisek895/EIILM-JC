import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Config } from '@config/environment';

describe('Authentication & Token Utilities', () => {
  describe('Password Hashing', () => {
    it('should hash plain password and verify correctly', async () => {
      const plainPassword = 'SecureAdminPassword@123';
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(plainPassword, salt);

      expect(hashed).not.toEqual(plainPassword);
      expect(hashed.length).toBeGreaterThan(20);

      const isValid = await bcrypt.compare(plainPassword, hashed);
      expect(isValid).toBe(true);

      const isInvalid = await bcrypt.compare('WrongPassword', hashed);
      expect(isInvalid).toBe(false);
    });

    it('should not match double-hashed passwords against plain text', async () => {
      const plain = 'Secret@123';
      const salt = await bcrypt.genSalt(10);
      const firstHash = await bcrypt.hash(plain, salt);
      const doubleHash = await bcrypt.hash(firstHash, salt);

      // Demonstrating why double hashing was broken and our fix is necessary
      const match = await bcrypt.compare(plain, doubleHash);
      expect(match).toBe(false);
    });
  });

  describe('JWT Token Generation & Verification', () => {
    it('should sign and verify valid user payload', () => {
      const payload = {
        id: 42,
        email: 'student@eiilm.edu',
        roleId: 4,
        role: 'student',
        tenantId: null,
      };

      const token = jwt.sign(payload, Config.jwt.secret, { expiresIn: '1h' });
      expect(typeof token).toBe('string');

      const decoded: any = jwt.verify(token, Config.jwt.secret);
      expect(decoded.id).toBe(42);
      expect(decoded.email).toBe('student@eiilm.edu');
      expect(decoded.role).toBe('student');
    });

    it('should reject invalid or tampered tokens', () => {
      const token = jwt.sign({ id: 1, role: 'student' }, 'different-secret');

      expect(() => {
        jwt.verify(token, Config.jwt.secret);
      }).toThrow();
    });

    it('should reject expired tokens', () => {
      const token = jwt.sign(
        { id: 1, role: 'student' },
        Config.jwt.secret,
        { expiresIn: '-1s' }
      );

      expect(() => {
        jwt.verify(token, Config.jwt.secret);
      }).toThrow(jwt.TokenExpiredError);
    });
  });
});
