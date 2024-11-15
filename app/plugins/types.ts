type Tool = {
  id: string;
  name: string;
  description: string;
}

export type PluginMetadata = {
  name: string;
  description: string;
  tools: Tool[];
}