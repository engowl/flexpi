export interface VectorData {
  id: string;                         // Unique identifier
  content: string;                    // Text content to be embedded
  metadata: VectorMetadata;           // Metadata for filtering and info
  embedding?: number[];              // Vector embedding
  timestamp: Date;                   // When the data was indexed
  source: string;                    // Source plugin identifier
}

export interface VectorMetadata {
  type: string;                      // Data type (tweet, transaction, etc)
  chainId?: string;                  // For blockchain data
  tags: string[];                    // Searchable tags
  symbols: string[];                 // Token symbols mentioned
  addresses: string[];               // Blockchain addresses mentioned
  raw: Record<string, any>;         // Original raw data
  [key: string]: any;               // Additional metadata fields
}
