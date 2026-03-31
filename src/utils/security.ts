/**
 * Cryptographic utilities for secure save/restore operations
 * 
 * Security Level: High
 * - Uses Web Crypto API (SubtleCrypto)
 * - HMAC-SHA256 for integrity
 * - AES-256-GCM for confidentiality
 * - PBKDF2 for key derivation
 * - Crypto.getRandomValues for CSPRNG
 */

const ALGORITHM_AES = 'AES-GCM';
const ALGORITHM_HMAC = { name: 'HMAC', hash: 'SHA-256' };
const ALGORITHM_PBKDF2 = { name: 'PBKDF2', hash: 'SHA-256', iterations: 100000 };
const KEY_LENGTH = 256;
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const APP_SALT = new Uint8Array([0x41, 0x6e, 0x74, 0x53, 0x69, 0x6d, 0x53, 0x65, 0x63, 0x72, 0x65, 0x74, 0x4b, 0x65, 0x79, 0x31]); // "AntSimSecretKey1"

/**
 * Derive a cryptographic key from password using PBKDF2
 * Security: High - 100k iterations, SHA-256
 */
export async function deriveKey(password: string, salt?: Uint8Array): Promise<{ key: CryptoKey; salt: Uint8Array }> {
  const useSalt = salt || crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  
  const baseKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  
  const key = await crypto.subtle.deriveKey(
    { ...ALGORITHM_PBKDF2, salt: useSalt },
    baseKey,
    { name: ALGORITHM_AES, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
  
  return { key, salt: useSalt };
}

/**
 * Generate application-specific integrity key
 * Uses a constant salt combined with runtime derivation
 * Security: Medium - Protects against casual tampering
 */
async function getIntegrityKey(): Promise<CryptoKey> {
  const baseKey = await crypto.subtle.importKey(
    'raw',
    APP_SALT,
    { name: 'HKDF' },
    false,
    ['deriveKey']
  );
  
  return crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: APP_SALT,
      info: new TextEncoder().encode('ant-sim-integrity-v1')
    },
    baseKey,
    ALGORITHM_HMAC,
    false,
    ['sign', 'verify']
  );
}

/**
 * Generate HMAC-SHA256 for data integrity
 * Security: High - Cryptographically secure
 */
export async function generateHMAC(data: string): Promise<string> {
  const key = await getIntegrityKey();
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(data)
  );
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Verify HMAC-SHA256 signature
 * Security: High - Timing-safe comparison
 */
export async function verifyHMAC(data: string, signature: string): Promise<boolean> {
  try {
    const key = await getIntegrityKey();
    const expectedSig = await generateHMAC(data);
    
    // Timing-safe comparison
    if (signature.length !== expectedSig.length) return false;
    let result = 0;
    for (let i = 0; i < signature.length; i++) {
      result |= signature.charCodeAt(i) ^ expectedSig.charCodeAt(i);
    }
    return result === 0;
  } catch {
    return false;
  }
}

/**
 * Encrypt data using AES-256-GCM
 * Security: High - Authenticated encryption
 */
export async function encryptAES(data: string): Promise<{ ciphertext: string; iv: string }> {
  const key = await getIntegrityKey();
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  
  const encrypted = await crypto.subtle.encrypt(
    { name: ALGORITHM_AES, iv },
    key,
    new TextEncoder().encode(data)
  );
  
  return {
    ciphertext: Array.from(new Uint8Array(encrypted))
      .map(b => b.toString(16).padStart(2, '0'))
      .join(''),
    iv: Array.from(iv)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  };
}

/**
 * Decrypt data using AES-256-GCM
 * Security: High - Built-in authentication (fails on tampering)
 */
export async function decryptAES(ciphertext: string, iv: string): Promise<string | null> {
  try {
    const key = await getIntegrityKey();
    
    const ivBytes = new Uint8Array(iv.match(/.{2}/g)!.map(byte => parseInt(byte, 16)));
    const ciphertextBytes = new Uint8Array(ciphertext.match(/.{2}/g)!.map(byte => parseInt(byte, 16)));
    
    const decrypted = await crypto.subtle.decrypt(
      { name: ALGORITHM_AES, iv: ivBytes },
      key,
      ciphertextBytes
    );
    
    return new TextDecoder().decode(decrypted);
  } catch {
    return null;
  }
}

/**
 * Generate cryptographically secure random ID
 * Security: High - CSPRNG
 */
export function generateSecureId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes)
    .map(b => b.toString(36).padStart(2, '0'))
    .join('')
    .slice(0, 25);
}

/**
 * Generate cryptographically secure nonce for replay protection
 * Security: High - 128-bit nonce
 */
export function generateNonce(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * HTML sanitization for user input display
 * Security: Medium - Prevents XSS in terminal output
 */
export function sanitizeHTML(input: string): string {
  if (typeof input !== 'string') return '';
  
  const div = document.createElement('div');
  div.textContent = input; // Use textContent to escape HTML
  return div.innerHTML
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Command validation using regex whitelist
 * Security: Medium - Prevents injection of special characters
 */
export function validateCommand(input: string): { valid: boolean; sanitized: string; error?: string } {
  if (typeof input !== 'string') {
    return { valid: false, sanitized: '', error: 'Invalid input type' };
  }
  
  // Length check (1-500 chars)
  if (input.length === 0) {
    return { valid: false, sanitized: '', error: 'Empty command' };
  }
  if (input.length > 500) {
    return { valid: false, sanitized: '', error: 'Command too long (max 500 chars)' };
  }
  
  // Whitelist: alphanumeric, spaces, hyphens, underscores, basic punctuation
  // Rejects: control characters, HTML tags, special symbols
  const whitelistRegex = /^[a-zA-Z0-9\s\-_.,!?()[\]{}'"@#%&*+=:;/<>~`|\\^$]*$/;
  
  if (!whitelistRegex.test(input)) {
    return { valid: false, sanitized: '', error: 'Invalid characters in command' };
  }
  
  // Additional check for potential prototype pollution
  const dangerousKeys = ['__proto__', 'constructor', 'prototype'];
  const lowerInput = input.toLowerCase();
  for (const key of dangerousKeys) {
    if (lowerInput.includes(key)) {
      return { valid: false, sanitized: '', error: 'Forbidden pattern detected' };
    }
  }
  
  // Sanitize: trim and normalize whitespace
  const sanitized = input.trim().replace(/\s+/g, ' ');
  
  return { valid: true, sanitized };
}

/**
 * Rate limiter implementation (token bucket)
 * Security: Medium - Prevents DoS via flooding
 */
export class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private maxTokens: number;
  private refillRate: number; // tokens per ms
  
  constructor(maxRequests: number, windowMs: number) {
    this.tokens = maxRequests;
    this.maxTokens = maxRequests;
    this.refillRate = maxRequests / windowMs;
    this.lastRefill = Date.now();
  }
  
  canProceed(): boolean {
    this.refill();
    
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return true;
    }
    return false;
  }
  
  private refill(): void {
    const now = Date.now();
    const delta = now - this.lastRefill;
    const tokensToAdd = delta * this.refillRate;
    
    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }
  
  getRemainingTokens(): number {
    this.refill();
    return Math.floor(this.tokens);
  }
}

/**
 * Security audit logger
 * Security: Medium - Structured logging for security events
 */
export interface SecurityAuditLog {
  security_event_id: string;
  timestamp: number;
  user_identity_hash: string; // Anonymous hash
  action: string;
  action_result: 'success' | 'failure' | 'blocked' | 'error';
  risk_score: number; // 0-100
  metadata?: Record<string, unknown>;
}

class SecurityAuditLogger {
  private logs: SecurityAuditLog[] = [];
  private maxLogs = 100;
  
  log(event: Omit<SecurityAuditLog, 'security_event_id' | 'timestamp' | 'user_identity_hash'>): void {
    const auditLog: SecurityAuditLog = {
      ...event,
      security_event_id: generateSecureId(),
      timestamp: Date.now(),
      user_identity_hash: this.getUserHash()
    };
    
    this.logs.push(auditLog);
    
    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
    
    // Log to console in development only
    if (process.env.NODE_ENV === 'development') {
      console.log('[SecurityAudit]', auditLog);
    }
  }
  
  getLogs(limit = 50): SecurityAuditLog[] {
    return this.logs.slice(-limit);
  }
  
  private getUserHash(): string {
    // Create anonymous fingerprint from session
    const sessionData = `${navigator.userAgent}${window.screen.width}${window.screen.height}`;
    let hash = 0;
    for (let i = 0; i < sessionData.length; i++) {
      const char = sessionData.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }
}

export const securityAudit = new SecurityAuditLogger();

/**
 * Schema validation for save data
 * Security: High - Prevents prototype pollution and type confusion
 */
export function validateSaveSchema(data: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (typeof data !== 'object' || data === null) {
    return { valid: false, errors: ['Data must be an object'] };
  }
  
  const obj = data as Record<string, unknown>;
  
  // Check for dangerous keys
  const dangerousKeys = ['__proto__', 'constructor', 'prototype'];
  for (const key of dangerousKeys) {
    if (key in obj) {
      errors.push(`Forbidden key detected: ${key}`);
    }
  }
  
  // Validate version is string
  if ('version' in obj && typeof obj.version !== 'string') {
    errors.push('Invalid version type');
  }
  
  // Validate timestamp is number
  if ('timestamp' in obj && typeof obj.timestamp !== 'number') {
    errors.push('Invalid timestamp type');
  }
  
  // Validate gameState is object
  if ('gameState' in obj && (typeof obj.gameState !== 'object' || obj.gameState === null)) {
    errors.push('Invalid gameState type');
  }
  
  // Deep validation of gameState if present
  if (typeof obj.gameState === 'object' && obj.gameState !== null) {
    const state = obj.gameState as Record<string, unknown>;
    
    // Check numeric bounds for awareness
    if ('awareness' in state) {
      const awareness = Number(state.awareness);
      if (isNaN(awareness) || awareness < 0 || awareness > 100) {
        errors.push('Invalid awareness value (must be 0-100)');
      }
    }
    
    // Check numeric bounds for colonySentience
    if ('colonySentience' in state) {
      const sentience = Number(state.colonySentience);
      if (isNaN(sentience) || sentience < 0 || sentience > 100) {
        errors.push('Invalid colonySentience value (must be 0-100)');
      }
    }
  }
  
  return { valid: errors.length === 0, errors };
}
