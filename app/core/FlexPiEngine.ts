import { AIMessage, BaseMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatOllama } from "@langchain/ollama";
import { StateGraph } from "@langchain/langgraph";
import { MemorySaver, Annotation } from "@langchain/langgraph";
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { pluginRegistry } from "../plugins/plugin-registry";
import { getSystemPrompt } from "./utils/prompt";

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
  temperature: 0,
}).bindTools(tools);

const jsonFormatterModel = new ChatOllama({
  baseUrl: "http://localhost:11434",
  model: 'llama3.2',
  verbose: true,
  maxRetries: 3,
  temperature: 0,
  format: "json",
})

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
export async function run(prompt: string) {
  const workflow = new StateGraph(StateAnnotation)
    .addNode("agent", callModel)
    .addNode("tools", new ToolNode(pluginRegistry.getTools()))
    .addEdge("__start__", "agent")
    .addConditionalEdges("agent", shouldContinue)
    .addEdge("tools", "agent");

  const app = workflow.compile({
    checkpointer: new MemorySaver()
  });

  const systemPrompt = getSystemPrompt(pluginRegistry.getMetadatas());

  const state = await app.invoke({
    messages: [
      new SystemMessage(systemPrompt),
      new HumanMessage(prompt)
    ],
    toolOutputs: []
  }, { configurable: { thread_id: "1" } });



  const finalResponse = state.messages[state.messages.length - 1].content;

  // Format the response as JSON
  const formattedResponse = await jsonFormatterModel.invoke([
    new SystemMessage(finalResponse),
    new HumanMessage("format those results as JSON")
  ]);

  console.log('formattedResponse', formattedResponse.content);

  return JSON.parse(formattedResponse.content as string);
}