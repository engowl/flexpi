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

// Usage example:
// generateApiKey() // Output: flex-xK9f-pL2m-nR7q-tY3w