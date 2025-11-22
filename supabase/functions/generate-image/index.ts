import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();
    
    if (!prompt) {
      throw new Error('Prompt is required');
    }

    const reveApiKey = Deno.env.get('REVE_API_KEY');
    if (!reveApiKey) {
      throw new Error('REVE_API_KEY is not configured');
    }

    console.log('Generating image with Reve API, prompt:', prompt);

    const response = await fetch('https://api.reve.com/v1/image/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${reveApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Reve API error:', error);
      throw new Error(`Reve API error: ${error}`);
    }

    const data = await response.json();
    const imageUrl = data.imageUrl || data.url || data.data?.url;

    if (!imageUrl) {
      throw new Error('No image URL in response');
    }

    console.log('Image generated successfully with Reve API');

    return new Response(
      JSON.stringify({ imageUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-image function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
