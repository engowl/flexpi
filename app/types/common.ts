export interface Schema {
  query: string;
  items: SchemaItem[];
}

interface SchemaItem {
  key: string;
  dataType: 'string' | 'number' | 'boolean' | 'object'; // Added 'object' to allowed types
  description?: string;
  isArray?: boolean;
  subItems?: SchemaItem[];
  enabled?: boolean;
}