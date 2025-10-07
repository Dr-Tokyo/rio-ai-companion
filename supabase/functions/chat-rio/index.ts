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


serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: RIO_PERSONALITY },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add more credits to your workspace." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    
    return new Response(
      JSON.stringify({ message: data.choices[0].message.content }),
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
