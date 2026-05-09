import crypto from 'crypto';

/**
 * Provably Fair System implementation
 */
export class ProvablyFair {
  /**
   * Generate a secure random server seed
   */
  static generateServerSeed(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate the SHA256 hash of the server seed to be given to the client before the game
   */
  static hashServerSeed(serverSeed: string): string {
    return crypto.createHash('sha256').update(serverSeed).digest('hex');
  }

  /**
   * Generate a random game outcome based on server seed, client seed, and nonce
   * Returns a float between 0 and 1
   */
  static generateOutcome(serverSeed: string, clientSeed: string, nonce: number): number {
    const hmac = crypto.createHmac('sha256', serverSeed);
    hmac.update(`${clientSeed}:${nonce}`);
    const hash = hmac.digest('hex');
    
    // Use first 8 characters (4 bytes) of the hash to create a float
    const partialHash = hash.substring(0, 8);
    const decimalValue = parseInt(partialHash, 16);
    
    // Divide by max possible 32-bit hex value to get a float between 0-1
    return decimalValue / 0xffffffff;
  }

  /**
   * Calculate a Crash game multiplier based on the outcome
   * e.g., House edge is built in (e.g., 1%)
   */
  static calculateCrashMultiplier(outcome: number, houseEdgePercentage: number = 1): number {
    // 1% house edge means outcome of 0 or < 0.01 immediately crashes at 1.00x
    if (outcome < (houseEdgePercentage / 100)) {
      return 1.00;
    }
    
    // Standard formula: 99 / (1 - outcome) for 1% house edge
    const multiplier = (100 - houseEdgePercentage) / (1 - outcome) / 100;
    return Math.max(1.00, parseFloat(multiplier.toFixed(2)));
  }

  /**
   * Calculate a Dice roll (1-100) based on the outcome
   */
  static calculateDiceRoll(outcome: number): number {
    // Dice roll 0.00 to 100.00
    return parseFloat((outcome * 100).toFixed(2));
  }
}
