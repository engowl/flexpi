export const chunkArray = (array: any[], size: number) => {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
};

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export function clamp(value: number, min: number, max: number) {
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
}

// Example usage

export const safeJsonParser = async (text: string) => {
  try {
    // Handle if content is already an object
    if (typeof text === 'object' && text !== null) {
      return text;
    }

    // Regular JSON parse attempt
    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.warn('Direct JSON parse failed, attempting cleanup', parseError);
      
      // Clean and parse
      const cleanedContent = text
        .replace(/[\n\r\t]/g, '')
        .replace(/,\s*}/g, '}')
        .replace(/\\n/g, '')
        .replace(/\\/g, '')
        .replace(/'\s*\+\s*'/g, '')
        .trim();
        
      try {
        return JSON.parse(cleanedContent);
      } catch (retryError) {
        try {
          // Remove the curly braces and any whitespace/quotes
          const noQuotes = text
            .replace(/[{}'"]/g, '') // Remove braces and quotes
            .replace(/\\n/g, '')     // Remove \n
            .trim();
          
          const pairs = noQuotes.split(',').filter(s => s.trim());
          const obj: any = {};
          
          pairs.forEach(pair => {
            let [key, value] = pair.split(':').map(s => s.trim());
            if (key && value) {
              // Clean up any remaining special characters
              key = key.replace(/[^a-zA-Z0-9_]/g, '');
              obj[key] = isNaN(Number(value)) ? value : Number(value);
            }
          });
          return obj;
        } catch (finalError) {
          console.warn('All parse attempts failed', finalError);
          return text;
        }
      }
    }
  } catch (error) {
    console.error('Error in safeJsonParser:', error);
    throw error;
  }
};