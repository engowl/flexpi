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
console.log(clamp(5, 1, 10)); // Output: 5
console.log(clamp(-1, 0, 10)); // Output: 0
console.log(clamp(15, 0, 10)); // Output: 10
