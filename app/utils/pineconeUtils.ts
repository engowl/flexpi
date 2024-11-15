export function encodeText(text: string): string {
  return Buffer.from(text, 'utf-8').toString('base64');
}

export function decodeText(encodedText: string): string {
  return Buffer.from(encodedText, 'base64').toString('utf-8');
}

export function toUnicode(text: string): string {
  return text.replace(/./g, (char) => `\\u{${char.codePointAt(0)?.toString(16)}}`);
}

export function fromUnicode(unicodeText: string): string {
  return unicodeText.replace(/\\u\{([0-9a-fA-F]+)\}/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)));
}
