// schema.ts

import { Schema } from "../../types/common";

export function schemaToPrompt(schema: Schema): string {
  const { query, items } = schema;
  let prompt = `Please answer the following in JSON format:\n${generateSchema(items)}\n\nAnswer in JSON format. JSON Answer:`;

  return prompt;
}

interface SchemaItem {
  key: string;
  dataType: 'string' | 'number' | 'boolean' | 'object';
  description?: string;
  isArray?: boolean;
  subItems?: SchemaItem[];
  enabled?: boolean;
}

function generateSchema(items: SchemaItem[], indentLevel: number = 1): string {
  // First generate the type definition
  // const typeDefinition = `Type definition:\n{ ${items.map(item => {
  //   if (item.isArray && item.dataType === 'object' && Array.isArray(item.subItems) && item.subItems.length > 0) {
  //     return `"${item.key}": [{ ${item.subItems.map(sub =>
  //       `"${sub.key}": ${sub.dataType}`
  //     ).join(', ')} }]${item.description ? ` // ${item.description}` : ''}`
  //   } else {
  //     return `"${item.key}": ${item.dataType}${item.description ? ` // ${item.description}` : ''}`
  //   }
  // }).join(', ')} }\n\n`;

  // First generate the TypeScript interface
  const typeDefinition = `interface Response{
      ${items.map(item => {
    if (item.isArray && item.dataType === 'object' && Array.isArray(item.subItems) && item.subItems.length > 0) {
      return `${item.key}: Array<{
        ${item.subItems.map(sub =>
        `${sub.key}: ${sub.dataType}; ${sub.description ? `// ${sub.description}` : ''}`
      ).join('\n    ')}
      }>;${item.description ? ` // ${item.description}` : ''}`
    } else {
      return `${item.key}: ${item.dataType};${item.description ? ` // ${item.description}` : ''}`
    }
  }).join('\n  ')}
    }\n\n`;

  // Then generate example with generic type examples
  const indent = '  '.repeat(indentLevel);
  let exampleStr = 'Example:\n{\n';

  items.forEach((item) => {
    exampleStr += `${indent}"${item.key}": `;

    if (item.isArray) {
      exampleStr += '[\n';
      if (item.dataType === 'object' && Array.isArray(item.subItems) && item.subItems.length > 0) {
        exampleStr += `${indent}  {\n`;
        exampleStr += generateExampleValues(item.subItems, indentLevel + 2);
        exampleStr += `${indent}  }`;
        exampleStr += '\n' + indent + ']';
      } else {
        exampleStr += `${indent}  "${item.dataType}"\n${indent}]`;
      }
    } else if (item.dataType === 'object') {
      if (Array.isArray(item.subItems) && item.subItems.length > 0) {
        exampleStr += generateExampleValues(item.subItems, indentLevel + 1);
      } else {
        exampleStr += '{}';
      }
    } else {
      // Generic examples based only on type
      switch (item.dataType) {
        case 'string':
          exampleStr += '"example_string"';
          break;
        case 'number':
          exampleStr += '0';
          break;
        case 'boolean':
          exampleStr += 'false';
          break;
        default:
          exampleStr += '""';
      }
    }

    // Add comma and description if exists
    exampleStr += item.description ? `, // ${item.description}` : ',';
    exampleStr += '\n';
  });

  exampleStr += '}';

  return typeDefinition + exampleStr;
}

function generateExampleValues(items: SchemaItem[], indentLevel: number): string {
  const indent = '  '.repeat(indentLevel);
  let str = '';

  items.forEach((item, index) => {
    str += `${indent}"${item.key}": `;

    // Generic examples based only on type
    switch (item.dataType) {
      case 'string':
        str += '"example_string"';
        break;
      case 'number':
        str += '0';
        break;
      case 'boolean':
        str += 'false';
        break;
      default:
        str += '""';
    }

    str += index < items.length - 1 ? ',\n' : '\n';
  });

  return str;
}