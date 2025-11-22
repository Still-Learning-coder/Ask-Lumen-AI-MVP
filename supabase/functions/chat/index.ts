import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI Gateway key is not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Starting chat request with", messages.length, "messages");

    // Check if the last user message is requesting image generation
    const lastUserMessage = messages[messages.length - 1];
    
    console.log('Last user message:', lastUserMessage?.content);
    
    const isImageRequest = lastUserMessage?.role === 'user' && (() => {
      const content = lastUserMessage.content.toLowerCase();
      
      const actionWords = ['generate', 'create', 'make', 'draw', 'show', 'produce'];
      const objectWords = ['image', 'picture', 'photo', 'visual', 'illustration', 'artwork'];
      
      const matchedActions = actionWords.filter(word => content.includes(word));
      const matchedObjects = objectWords.filter(word => content.includes(word));
      
      const hasAction = matchedActions.length > 0;
      const hasObject = matchedObjects.length > 0;
      
      console.log('Detection analysis:', {
        matchedActions,
        matchedObjects,
        hasAction,
        hasObject,
        willTriggerImageGen: hasAction && hasObject
      });
      
      // Must have both an action word AND an object word
      return hasAction && hasObject;
    })();

    console.log('Is image request:', isImageRequest);

    if (isImageRequest) {
      console.log('Image generation request detected - calling generate-image function');
      
      let imagePrompt = lastUserMessage.content;
      
      // Remove command phrases
      const commandPhrases = [
        /^(can you |could you |please |would you )?generate (an? |the )?(image|picture|photo)/i,
        /^(can you |could you |please |would you )?create (an? |the )?(image|picture|photo)/i,
        /^(can you |could you |please |would you )?make (an? |the )?(image|picture|photo)/i,
        /^(can you |could you |please |would you )?draw (an? |the )?(image|picture|photo)?/i,
        /^(can you |could you |please |would you )?show me (an? |the )?(image|picture|photo)/i,
        /^i want to see (an? |the )?(image|picture|photo)/i
      ];
      
      for (const pattern of commandPhrases) {
        imagePrompt = imagePrompt.replace(pattern, '');
      }
      
      imagePrompt = imagePrompt.replace(/^(of |for |about |showing )*/i, '').trim();
      
      // Detect vague/contextual requests (contains pronouns or too short)
      const pronouns = ['it', 'its', 'that', 'this', 'them', 'those', 'these'];
      const hasPronouns = pronouns.some(p => imagePrompt.toLowerCase().includes(p));
      const isVague = !imagePrompt || imagePrompt.length < 10 || hasPronouns;
      
      console.log('Initial extracted prompt:', imagePrompt, 'isVague:', isVague);
      
      // If vague, use AI to extract context from conversation
      if (isVague && messages.length > 1) {
        console.log('Vague request detected, extracting context from conversation history');
        
        try {
          const contextResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [
                {
                  role: "system",
                  content: "Extract what the user wants to visualize from the conversation. Return ONLY a detailed, descriptive image generation prompt (2-3 sentences). Do not include any other text or explanations."
                },
                ...messages.slice(-5) // Last 5 messages for context
              ],
            }),
          });
          
          if (contextResponse.ok) {
            const contextData = await contextResponse.json();
            const extractedPrompt = contextData.choices?.[0]?.message?.content?.trim();
            
            if (extractedPrompt && extractedPrompt.length > 10) {
              imagePrompt = extractedPrompt;
              console.log('Context-aware prompt extracted:', imagePrompt);
            }
          }
        } catch (error) {
          console.error('Error extracting context:', error);
          // Fall back to original prompt
        }
      }
      
      // Final validation
      if (!imagePrompt || imagePrompt.length < 5) {
        imagePrompt = lastUserMessage.content;
      }
      
      console.log('Final image prompt:', imagePrompt);

      // Call the generate-image function
      const imageResponse = await fetch(`https://jsuqipnblmjayovklhrf.supabase.co/functions/v1/generate-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: imagePrompt }),
      });

      if (imageResponse.ok) {
        const imageData = await imageResponse.json();
        
        // Return a combined response with text and image
        return new Response(
          JSON.stringify({ 
            content: "Here's your generated image!",
            imageUrl: imageData.imageUrl 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      } else {
        const error = await imageResponse.text();
        console.error('Image generation failed:', error);
        
        // Return an error message to the user
        return new Response(
          JSON.stringify({ 
            content: `I apologize, but I'm having trouble generating that image right now. Please try again. Error: ${error}`,
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
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
          {
            role: "system",
            content: "You are an intelligent and helpful AI assistant with image generation capabilities. You can help with a wide range of tasks including answering questions, generating content, analyzing information, and providing creative solutions. Be concise, accurate, and friendly in your responses. Do not introduce yourself unless specifically asked who you are.",
          },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI Gateway error:", response.status, errorText);
      
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
          JSON.stringify({ error: "AI usage credits depleted. Please add credits in Settings → Workspace → Usage." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({ error: "Failed to get response from AI" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Streaming response from Lovable AI");

    // Return the stream directly
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in chat function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
