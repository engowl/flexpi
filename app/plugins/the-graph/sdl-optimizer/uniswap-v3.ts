type ScalarType = 'ID' | 'String' | 'Int' | 'Float' | 'Boolean' | 'BigInt' | 'BigDecimal' | 'Bytes';

interface Field {
  name: string;
  type: string;
  isRequired?: boolean;
  isArray?: boolean;
  isScalar?: boolean;
}

interface Type {
  name: string;
  fields: Field[];
}

function generateFilterType(type: Type): string {
  const filterName = `${type.name}_filter`;
  let output = `input ${filterName} {\n`;

  // Generate basic scalar filters
  for (const field of type.fields) {
    const baseType = field.type.replace(/[\[\]!]/g, '');
    const isScalar = ['ID', 'String', 'Int', 'Float', 'Boolean', 'BigInt', 'BigDecimal', 'Bytes'].includes(baseType);
    
    if (isScalar) {
      output += generateScalarFilters(field.name, baseType);
    } else {
      // Handle relationship filters
      output += `  ${field.name}: String\n`;
      output += `  ${field.name}_not: String\n`;
      output += `  ${field.name}_gt: String\n`;
      output += `  ${field.name}_lt: String\n`;
      output += `  ${field.name}_gte: String\n`;
      output += `  ${field.name}_lte: String\n`;
      output += `  ${field.name}_in: [String!]\n`;
      output += `  ${field.name}_not_in: [String!]\n`;
      output += `  ${field.name}_contains: String\n`;
      output += `  ${field.name}_contains_nocase: String\n`;
      output += `  ${field.name}_not_contains: String\n`;
      output += `  ${field.name}_not_contains_nocase: String\n`;
      output += `  ${field.name}_starts_with: String\n`;
      output += `  ${field.name}_starts_with_nocase: String\n`;
      output += `  ${field.name}_not_starts_with: String\n`;
      output += `  ${field.name}_not_starts_with_nocase: String\n`;
      output += `  ${field.name}_ends_with: String\n`;
      output += `  ${field.name}_ends_with_nocase: String\n`;
      output += `  ${field.name}_not_ends_with: String\n`;
      output += `  ${field.name}_not_ends_with_nocase: String\n`;
      output += `  ${field.name}_: ${baseType}_filter\n`;
    }
  }

  // Add common filter fields
  output += `\n  """Filter for the block changed event."""\n`;
  output += `  _change_block: BlockChangedFilter\n`;
  output += `  and: [${filterName}]\n`;
  output += `  or: [${filterName}]\n`;
  output += `}\n`;

  return output;
}

function generateScalarFilters(fieldName: string, scalarType: string): string {
  let output = '';
  
  // Basic comparison operators
  output += `  ${fieldName}: ${scalarType}\n`;
  output += `  ${fieldName}_not: ${scalarType}\n`;
  output += `  ${fieldName}_gt: ${scalarType}\n`;
  output += `  ${fieldName}_lt: ${scalarType}\n`;
  output += `  ${fieldName}_gte: ${scalarType}\n`;
  output += `  ${fieldName}_lte: ${scalarType}\n`;
  output += `  ${fieldName}_in: [${scalarType}!]\n`;
  output += `  ${fieldName}_not_in: [${scalarType}!]\n`;

  // Additional string-specific operators
  if (scalarType === 'String' || scalarType === 'Bytes') {
    output += `  ${fieldName}_contains: ${scalarType}\n`;
    output += `  ${fieldName}_not_contains: ${scalarType}\n`;
  }

  return output;
}

function generateOrderByType(type: Type): string {
  const orderByName = `${type.name}_orderBy`;
  let output = `enum ${orderByName} {\n`;

  // Add basic fields
  for (const field of type.fields) {
    output += `  ${field.name}\n`;
    
    // Add nested fields for relationships
    if (!['ID', 'String', 'Int', 'Float', 'Boolean', 'BigInt', 'BigDecimal', 'Bytes'].includes(field.type)) {
      output += `  ${field.name}__id\n`;
      // Add more nested fields as needed
    }
  }

  output += `}\n`;
  return output;
}

// Example usage
const flashType: Type = {
  name: 'Flash',
  fields: [
    { name: 'id', type: 'ID', isRequired: true },
    { name: 'transaction', type: 'Transaction', isRequired: true },
    { name: 'timestamp', type: 'BigInt', isRequired: true },
    { name: 'pool', type: 'Pool', isRequired: true },
    { name: 'sender', type: 'Bytes', isRequired: true },
    { name: 'recipient', type: 'Bytes', isRequired: true },
    { name: 'amount0', type: 'BigDecimal', isRequired: true },
    { name: 'amount1', type: 'BigDecimal', isRequired: true },
    { name: 'amountUSD', type: 'BigDecimal', isRequired: true },
    { name: 'amount0Paid', type: 'BigDecimal', isRequired: true },
    { name: 'amount1Paid', type: 'BigDecimal', isRequired: true },
    { name: 'logIndex', type: 'BigInt' }
  ]
};

// Generate the schema
console.log('// Original Type');
console.log(`type Flash {
  id: ID!
  transaction: Transaction!
  timestamp: BigInt!
  pool: Pool!
  sender: Bytes!
  recipient: Bytes!
  amount0: BigDecimal!
  amount1: BigDecimal!
  amountUSD: BigDecimal!
  amount0Paid: BigDecimal!
  amount1Paid: BigDecimal!
  logIndex: BigInt
}\n`);

console.log('// Generated Filter Type');
console.log(generateFilterType(flashType));

console.log('// Generated OrderBy Type');
console.log(generateOrderByType(flashType));