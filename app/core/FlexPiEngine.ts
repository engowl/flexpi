import { AIMessage, BaseMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatOllama } from "@langchain/ollama";
import { StateGraph } from "@langchain/langgraph";
import { MemorySaver, Annotation } from "@langchain/langgraph";
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { pluginRegistry } from "../plugins/plugin-registry";
import { getParserSystemPrompt, getSystemPrompt } from "./utils/prompt";
import { z } from "zod";
import axios from "axios";
import { getPairsByTokenTool, searchPairsTool } from "../plugins/dexscreener";
import { getRealTimePriceOracleTool } from "../plugins/pyth-price-feeds";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatOpenAI } from "@langchain/openai";

const StateAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
  }),
  toolOutputs: Annotation<any[]>({
    default() {
      return [];
    },
    reducer: (x, y) => x.concat(y),
  }),
});

// const tools = pluginRegistry.getTools();
const toolNode = new ToolNode(pluginRegistry.getTools());

let model: any;
let jsonFormatterModel: any;

// if (process.env.ANTHROPIC_MODE === "true") {
//   model = new ChatAnthropic({
//     anthropicApiKey: process.env.ANTHROPIC_API_KEY,
//     // model: 'claude-3-5-sonnet-20241022',
//     model: 'claude-3-5-haiku-20241022',
//     temperature: 0,
//     verbose: true,
//   }).bindTools(pluginRegistry.getTools());

//   jsonFormatterModel = new ChatAnthropic({
//     anthropicApiKey: process.env.ANTHROPIC_API_KEY,
//     // model: 'claude-3-5-sonnet-20241022',
//     model: 'claude-3-5-haiku-20241022',
//     temperature: 0
//   })
// } else {
//   // Initialize the ChatOllama model
//   model = new ChatOllama({
//     baseUrl: "http://localhost:11434",
//     // model: 'llama3.2',
//     model: 'llama3-groq-tool-use',
//     verbose: true,
//     maxRetries: 3,
//     // temperature: 0

//   }).bindTools(pluginRegistry.getTools());

//   jsonFormatterModel = new ChatOllama({
//     baseUrl: "http://localhost:11434",
//     model: 'llama3.2',
//     verbose: true,
//     maxRetries: 3,
//     temperature: 0,
//     format: "json",
//   })
// }
console.log('AI_MODE', process.env.AI_MODE);
switch (process.env.AI_MODE) {
  case "anthropic":
    console.log(`Using Anthropic AI`);
    model = new ChatAnthropic({
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
      // model: 'claude-3-5-sonnet-20241022',
      model: 'claude-3-5-haiku-20241022',
      temperature: 0,
      verbose: true,
    }).bindTools(pluginRegistry.getTools());

    jsonFormatterModel = new ChatAnthropic({
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
      // model: 'claude-3-5-sonnet-20241022',
      model: 'claude-3-5-haiku-20241022',
      temperature: 0
    });
    break;

  case "openai":
    console.log(`Using OpenAI`);
    model = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'gpt-4o-mini',
      temperature: 0,
      verbose: true,
    }).bindTools(pluginRegistry.getTools());

    jsonFormatterModel = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'gpt-4o',
      temperature: 0,
    });
    break;

  case "llama":
    console.log(`Using Llama AI`);
    model = new ChatOllama({
      baseUrl: "http://localhost:11434",
      model: 'llama3-groq-tool-use',
      verbose: true,
      maxRetries: 3,
    }).bindTools(pluginRegistry.getTools());

    jsonFormatterModel = new ChatOllama({
      baseUrl: "http://localhost:11434",
      model: 'llama3.2',
      verbose: true,
      maxRetries: 3,
      temperature: 0,
      format: "json",
    });
    break;

  default:
    console.log(`Using default Llama AI`);
    model = new ChatOllama({
      baseUrl: "http://localhost:11434",
      model: 'llama3-groq-tool-use',
      verbose: true,
      maxRetries: 3,
    }).bindTools(pluginRegistry.getTools());

    jsonFormatterModel = new ChatOllama({
      baseUrl: "http://localhost:11434",
      model: 'llama3.2',
      verbose: true,
      maxRetries: 3,
      temperature: 0,
      format: "json",
    });
    break;
}

// const jsonFormatterModel = new ChatOllama({
//   baseUrl: "http://localhost:11434",
//   model: 'llama3.2',
//   verbose: true,
//   maxRetries: 3,
//   temperature: 0,
//   format: "json",
// })

function shouldContinue(state: typeof StateAnnotation.State) {
  const messages = state.messages;
  const lastMessage = messages[messages.length - 1] as AIMessage;

  // If the LLM makes a tool call, then route to the "tools" node
  if (lastMessage.tool_calls?.length) {
    return "tools";
  }
  // Otherwise, stop and reply to the user
  return "__end__";
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
    // .addNode("tools", toolNode)
    .addNode("tools", new TrackedToolNode(pluginRegistry.getTools(), callId))
    .addEdge("__start__", "agent")
    .addConditionalEdges("agent", shouldContinue)
    .addEdge("tools", "agent");

  const checkpointer = new MemorySaver();
  const app = workflow.compile({
    checkpointer: checkpointer,
  });

  const systemPrompt = getSystemPrompt(pluginRegistry.getMetadatas());

  console.log('prompt', prompt);

  const state = await app.invoke({
    messages: [
      new SystemMessage(systemPrompt),
      new HumanMessage(prompt)
    ]
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

  ONLY RESPONSE BASED ON DESIRED JSON FORMAT. Don't use sentences. Only return the JSON format.
`

  console.log('_prompt', _prompt);

  if (process.env.AI_MODE !== "llama") {
    const jsonFormatterResponse = await jsonFormatterModel.invoke(
      [new HumanMessage(_prompt)]
    );

    console.log('jsonFormatterResponse', jsonFormatterResponse);

    return JSON.parse(jsonFormatterResponse.content as string);
  } else {
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
}