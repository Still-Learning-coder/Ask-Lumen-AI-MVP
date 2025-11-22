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
    const imageKeywords = ['generate image', 'create image', 'draw', 'make an image', 'generate a picture', 'create a picture'];
    const isImageRequest = lastUserMessage?.role === 'user' && 
      imageKeywords.some(keyword => lastUserMessage.content.toLowerCase().includes(keyword));

    if (isImageRequest) {
      console.log('Image generation request detected');
      
      // Extract the prompt by removing the command keywords
      let imagePrompt = lastUserMessage.content;
      imageKeywords.forEach(keyword => {
        imagePrompt = imagePrompt.replace(new RegExp(keyword, 'gi'), '');
      });
      imagePrompt = imagePrompt.trim();

      if (!imagePrompt) {
        imagePrompt = lastUserMessage.content; // Use full content if extraction fails
      }

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
            content: `I've generated an image based on your request: "${imagePrompt}"`,
            imageUrl: imageData.imageUrl 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      } else {
        console.error('Image generation failed:', await imageResponse.text());
        // Fall through to regular chat if image generation fails
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
            content: "You are Lumen AI, an intelligent and helpful AI assistant. You can help with a wide range of tasks including answering questions, generating content, analyzing information, and providing creative solutions. Be concise, accurate, and friendly in your responses. When users want to generate images, tell them to use phrases like 'generate image' or 'create image' followed by their description.",
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
