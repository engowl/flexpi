import axios from 'axios';

export class LlamaEmbeddings {
  private baseUrl: string;
  private model: string;

  constructor(config: {
    baseUrl?: string;
    model?: string;
  } = {}) {
    this.baseUrl = config.baseUrl || 'http://localhost:11434';
    this.model = config.model || 'llama2';
  }

  async embedQuery(text: string): Promise<number[]> {
    try {
      const response = await axios.post(`${this.baseUrl}/api/embeddings`, {
        model: this.model,
        prompt: text
      });

      return response.data.embedding;
    } catch (error) {
      console.error('Llama embedding error:', error);
      throw new Error('Failed to generate embedding');
    }
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map(text => this.embedQuery(text)));
  }
}