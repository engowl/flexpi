export interface Schema {
  query: string;
  items: SchemaItem[];
  variables?: SchemaVariable[];
}

interface SchemaItem {
  key: string;
  dataType: 'string' | 'number' | 'boolean' | 'object'; // Added 'object' to allowed types
  description?: string;
  isArray?: boolean;
  subItems?: SchemaItem[];
  enabled?: boolean;
}

export interface SchemaVariable {
  key: string;
  value: string;
  description?: string;
}

