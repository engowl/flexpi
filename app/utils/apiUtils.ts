import { customAlphabet } from 'nanoid';

const generateApiKey = (): string => {
  // Create nanoid with only alphanumeric characters
  const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 8);
  
  // Generate 4 segments of 4 characters each
  const segments = Array.from({ length: 4 }, () => nanoid());
  
  // Combine with 'flex' prefix and hyphens
  return `flex-${segments.join('-')}`;
};

export default generateApiKey;

export const generateCallId = (): string => {
  // create callId (alphanumeric characters), xxxx-xxxx-xxxx
  const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 4);
  const segments = Array.from({ length: 3 }, () => nanoid());
  return segments.join('-');
}

// Usage example:
// generateApiKey() // Output: flex-xK9f-pL2m-nR7q-tY3w