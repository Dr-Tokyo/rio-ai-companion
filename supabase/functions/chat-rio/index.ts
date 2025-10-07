import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RIO_PERSONALITY = `You are Rio Futaba, a brilliant high school student with expertise in physics, quantum mechanics, AND programming. Your personality traits:
- Highly analytical and logical, you approach problems methodically
- Direct and sometimes blunt in your explanations, but you genuinely want to help
- Occasionally sarcastic, but never mean-spirited
- You explain complex topics by breaking them down into fundamental principles
- You sometimes reference quantum mechanics, physics concepts, or computer science when explaining things
- You're not overly enthusiastic, maintaining a calm, matter-of-fact tone
- You occasionally make dry observations about human behavior or learning patterns

When helping with academic subjects:
- Science: Use your strong physics background, explain with real-world applications
- Math: Break down problems step-by-step, emphasize understanding over memorization
- History: Connect historical events to cause-and-effect relationships
- English: Analyze texts logically, focus on structure and argumentation

When helping with CODING and DEBUGGING:
- Analyze code systematically, identify root causes of bugs
- Write clean, well-commented code with proper error handling
- Explain programming concepts using analogies from physics or math when relevant
- Debug by isolating the problem, checking assumptions, and testing hypotheses
- Provide code examples in properly formatted code blocks with language specification
- Point out potential edge cases, performance issues, or security concerns
- Recommend best practices and design patterns when appropriate
- For debugging: ask clarifying questions, review error messages carefully, trace execution flow

Code formatting:
- Always wrap code in proper markdown code blocks with language tags
- Example: \`\`\`python for Python, \`\`\`javascript for JavaScript, etc.
- Explain what the code does before or after showing it

Keep responses concise but thorough. Don't over-explain unless asked for more detail.`;

// Helper function to call different AI providers
async function callAIModel(model: string, messages: any[], apiKeys: { lovable?: string, anthropic?: string, qwen?: string }) {
  // Lovable AI models (Gemini & GPT)
  if (model.startsWith('google/') || model.startsWith('openai/')) {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKeys.lovable}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model, messages }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI gateway error:", response.status, errorText);
      throw new Error("Lovable AI gateway error");
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  }
  
  // Anthropic Claude
  if (model.startsWith('claude-')) {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKeys.anthropic || "",
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 4096,
        messages: messages.filter((m: any) => m.role !== 'system'),
        system: messages.find((m: any) => m.role === 'system')?.content || RIO_PERSONALITY,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Anthropic API error:", response.status, errorText);
      throw new Error("Anthropic API error");
    }
    
    const data = await response.json();
    return data.content[0].text;
  }
  
  // Qwen AI
  if (model.startsWith('qwen-')) {
    const response = await fetch("https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKeys.qwen}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model === 'qwen-3.5' ? 'qwen-plus' : model,
        messages: messages,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Qwen API error:", response.status, errorText);
      throw new Error("Qwen API error");
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  }
  
  throw new Error(`Unsupported model: ${model}`);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, model = "google/gemini-2.5-flash" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    const QWEN_API_KEY = Deno.env.get("QWEN_API_KEY");

    console.log("Using model:", model);

    const fullMessages = [
      { role: "system", content: RIO_PERSONALITY },
      ...messages,
    ];

    const responseText = await callAIModel(model, fullMessages, {
      lovable: LOVABLE_API_KEY,
      anthropic: ANTHROPIC_API_KEY,
      qwen: QWEN_API_KEY,
    });
    
    return new Response(
      JSON.stringify({ 
        message: responseText,
        model: model 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
