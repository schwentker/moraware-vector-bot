import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { env, pipeline } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.6.0'

// Configure Transformers.js
env.useBrowserCache = false
env.allowLocalModels = false

const pipe = await pipeline(
  'feature-extraction',
  'Xenova/all-MiniLM-L6-v2'
)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { input } = await req.json()

    if (!input) {
      return new Response(
        JSON.stringify({ error: 'Missing input parameter' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Generate embedding
    const output = await pipe(input, {
      pooling: 'mean',
      normalize: true,
    })

    // Extract the embedding array
    const embedding = Array.from(output.data)

    return new Response(
      JSON.stringify({ embedding }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
