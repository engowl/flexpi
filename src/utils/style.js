import { twMerge } from "tailwind-merge";

export const cnm = twMerge;

export const shortenAddress = (address, charsAtStart = 6, charsAtEnd = 4) => {
  if (!address) return "";

  // Shorten the address
  return `${address.substring(0, charsAtStart)}...${address.substring(
    address.length - charsAtEnd
  )}`;
};
