import { Schema } from "../../types/common";

interface SchemaItem {
  key: string;
  dataType: 'string' | 'number' | 'boolean' | 'object';
  description?: string;
  isArray?: boolean;
  subItems?: SchemaItem[];
  enabled?: boolean;
}

export function schemaToPrompt(schema: Schema): string {
  const { query, items } = schema;
  let prompt = `Please answer the following in JSON format:\n${generateSchema(items)}\n\nAnswer in JSON format. JSON Answer:`;
  return prompt;
}

function generateSchema(items: SchemaItem[], indentLevel: number = 1): string {
  // Generate the TypeScript interface with proper nested types
  const typeDefinition = generateTypeDefinition(items);
  
  // Generate example with generic type examples
  const exampleStr = generateExample(items, indentLevel);
  
  return typeDefinition + '\n\nExample:\n' + exampleStr;
}

function generateTypeDefinition(items: SchemaItem[]): string {
  return `interface Response {
  ${items.map(item => generateTypeForItem(item)).join('\n  ')}
}`;
}

function generateTypeForItem(item: SchemaItem, indent: string = ''): string {
  let typeStr = '';
  
  if (item.dataType === 'object' && item.subItems?.length) {
    // For objects with subItems, create a nested interface
    typeStr = `${item.key}: {
    ${item.subItems.map(subItem => generateTypeForItem(subItem, '    ')).join('\n    ')}
  }`;
  } else {
    // For primitive types or empty objects
    typeStr = `${item.key}: ${item.dataType}`;
  }
  
  // Handle arrays
  if (item.isArray) {
    typeStr = typeStr.replace(': ', '[] : ');
  }
  
  // Add description as comment if it exists
  if (item.description) {
    typeStr += `; // ${item.description}`;
  } else {
    typeStr += ';';
  }
  
  return indent + typeStr;
}

function generateExample(items: SchemaItem[], indentLevel: number): string {
  const indent = '  '.repeat(indentLevel);
  let str = '{\n';
  
  items.forEach((item, index) => {
    str += `${indent}"${item.key}": `;
    
    if (item.isArray) {
      str += '[\n';
      if (item.dataType === 'object' && item.subItems?.length) {
        str += generateObjectExample(item.subItems, indentLevel + 2);
        str += `${indent}]`;
      } else {
        str += `${indent}  ${generateExampleValue(item.dataType)}\n${indent}]`;
      }
    } else if (item.dataType === 'object' && item.subItems?.length) {
      str += generateObjectExample(item.subItems, indentLevel + 1);
    } else {
      str += generateExampleValue(item.dataType);
    }
    
    // Add comma and description if exists
    str += index < items.length - 1 ? ',' : '';
    if (item.description) {
      str += ` // ${item.description}`;
    }
    str += '\n';
  });
  
  return str + indent.slice(2) + '}';
}

function generateObjectExample(items: SchemaItem[], indentLevel: number): string {
  const indent = '  '.repeat(indentLevel);
  let str = '{\n';
  
  items.forEach((item, index) => {
    str += `${indent}"${item.key}": ${generateExampleValue(item.dataType)}`;
    str += index < items.length - 1 ? ',' : '';
    if (item.description) {
      str += ` // ${item.description}`;
    }
    str += '\n';
  });
  
  return str + '  '.repeat(indentLevel - 1) + '}';
}

function generateExampleValue(dataType: string): string {
  switch (dataType) {
    case 'string':
      return '"example_string"';
    case 'number':
      return '0';
    case 'boolean':
      return 'false';
    case 'object':
      return '{}';
    default:
      return '""';
  }
}