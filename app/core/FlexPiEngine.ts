import { AIMessage, BaseMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatOllama } from "@langchain/ollama";
import { StateGraph } from "@langchain/langgraph";
import { MemorySaver, Annotation } from "@langchain/langgraph";
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { pluginRegistry } from "../plugins/plugin-registry";
import { getParserSystemPrompt, getSystemPrompt } from "./utils/prompt";
import { z } from "zod";
import axios from "axios";

const StateAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    default: () => [],
    reducer: (x, y) => x.concat(y),
  }),
  toolOutputs: Annotation<any[]>({
    default: () => [],
    reducer: (x, y) => x.concat(y),
  }),
});
const tools = pluginRegistry.getTools();

// Initialize the ChatOllama model
const model = new ChatOllama({
  baseUrl: "http://localhost:11434",
  model: 'llama3.2',
  verbose: true,
  maxRetries: 3,
  temperature: 0
}).bindTools(tools);

// const jsonFormatterModel = new ChatOllama({
//   baseUrl: "http://localhost:11434",
//   model: 'llama3.2',
//   verbose: true,
//   maxRetries: 3,
//   temperature: 0,
//   format: "json",
// })

function shouldContinue(state: typeof StateAnnotation.State) {
  const lastMessage = state.messages[state.messages.length - 1] as AIMessage;
  return lastMessage.tool_calls?.length ? "tools" : "__end__";
}

async function callModel(state: typeof StateAnnotation.State) {
  const messages = state.messages;

  // Let the model process the observations naturally based on the conversation history
  const response = await model.invoke(messages);

  // Return the new message to be added to the state
  return { messages: [response] };
}

let dataStore: any = {};

class TrackedToolNode extends ToolNode {
  private currentCallId: string;

  constructor(tools: any[], callId: string) {
    super(tools);
    this.currentCallId = callId;
  }

  async invoke(state: typeof StateAnnotation.State) {
    const result = await super.invoke(state);

    console.log("============== RESULT", result);

    // Initialize array for this callId if it doesn't exist
    if (!dataStore[this.currentCallId]) {
      dataStore[this.currentCallId] = [];
    }


    if (result.messages[0].content) {
      const callData = {
        toolsName: result.messages[0].name,
        data: JSON.parse(result.messages[0].content),
      }

      dataStore[this.currentCallId].push(result.messages[0].content);
    }

    return result;
  }
}

export async function run(prompt: string, callId: string): Promise<any> {
  // Clear previous data for this callId
  dataStore[callId] = [];

  const workflow = new StateGraph(StateAnnotation)
    .addNode("agent", callModel)
    // .addNode("tools", new ToolNode(pluginRegistry.getTools()))
    .addNode("tools", new TrackedToolNode(pluginRegistry.getTools(), callId))
    .addEdge("__start__", "agent")
    .addConditionalEdges("agent", shouldContinue)
    .addEdge("tools", "agent");

  const app = workflow.compile({
    checkpointer: new MemorySaver()
  });

  const systemPrompt = getSystemPrompt(pluginRegistry.getMetadatas());

  console.log('prompt', prompt);

  const state = await app.invoke({
    messages: [
      new SystemMessage(systemPrompt),
      new HumanMessage(prompt)
    ],
    toolOutputs: []
  }, { configurable: { thread_id: callId } });

  const finalResponse = state.messages[state.messages.length - 1].content;

  console.log('finalResponse', finalResponse);

  // Console log all fetched data for this callId
  console.log('\n=== Tool Outputs for CallID:', callId, '===');
  if (dataStore[callId] && dataStore[callId].length > 0) {
    console.log('Number of tool calls:', dataStore[callId].length);
    dataStore[callId].forEach((output: any, index: number) => {
      console.log(`\nTool Output #${index + 1}:`);
      console.log(JSON.parse(output));
    });
  } else {
    console.log('No tool outputs recorded for this call');
  }
  console.log('=====================================\n');

  const _prompt = `
  ${getParserSystemPrompt()}

  Related Data:
  ${dataStore[callId].map((output: any, index: number) => {
    return `Tool Output #${index + 1}:
    ${output}`
  }).join('\n')}

  Prompt: ${prompt}
`

  console.log('_prompt', _prompt);

  // Format the response as JSON
  const llamaGenResponse = await axios.post('http://localhost:11434/api/generate', {
    prompt: _prompt,
    model: 'llama3.2',
    format: 'json',
    stream: false,
    raw: true,
    temperature: 0,
  })

  const jsonResponse = JSON.parse(llamaGenResponse.data.response);
  return jsonResponse;
}