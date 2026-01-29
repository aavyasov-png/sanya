// Supabase Edge Function для проксирования запросов к Uzum API
// Обходит CORS блокировку браузера

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { path, method = 'GET', headers = {}, body } = await req.json();

    if (!path) {
      return new Response(
        JSON.stringify({ error: 'Path is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const uzumApiUrl = `https://api-seller.uzum.uz/api/seller-openapi${path}`;
    
    const requestOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ...headers,
      },
    };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      requestOptions.body = JSON.stringify(body);
    }

    console.log(`[Uzum Proxy] ${method} ${uzumApiUrl}`);
    console.log('[Uzum Proxy] Headers:', JSON.stringify(requestOptions.headers));

    const response = await fetch(uzumApiUrl, requestOptions);
    const data = await response.text();
    
    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch (e) {
      console.error('[Uzum Proxy] Failed to parse JSON:', data);
      jsonData = { raw: data };
    }

    return new Response(
      JSON.stringify(jsonData),
      {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('[Uzum Proxy] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Proxy error', 
        message: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
