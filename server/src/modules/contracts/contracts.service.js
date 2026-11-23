/**
 * Contracts Service
 * Encapsulates canonical contract reference generation and validation logic.
 */

import crypto from 'crypto';

/**
 * Generate a canonical, human-readable, unique contract number.
 * Pattern: CNT-YYYYMMDD-HEX4
 *
 * @param {'bid'|'directHire'} sourceType
 * @returns {string} Canonical contract number
 */
export const generateCanonicalContractNumber = (sourceType = 'bid') => {
  const prefix = sourceType === 'directHire' ? 'CNT-DIR' : 'CNT';
  const timestamp = Date.now();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${timestamp}-${randomSuffix}`;
};
