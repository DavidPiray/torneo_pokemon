import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req: Request) => {
  // Configuración de cabeceras CORS para permitir peticiones externas
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  }

  // Responder de inmediato a la petición pre-vuelo (Preflight OPTIONS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Desestructuración limpia de los datos entrantes de Minecraft
    const { ganador_id, perdedor_id, ganador_nombre, perdedor_nombre, fase } = await req.json()

    // 1. Registrar combate histórico
    const { error: errorCombate } = await supabaseClient
      .from('combates')
      .insert({
        ganador_id,
        perdedor_id,
        ganador_nombre,
        perdedor_nombre,
        fase_torneo: fase || 'fase_regular'
      })

    if (errorCombate) throw errorCombate

    return new Response(
      JSON.stringify({ success: true, message: "Batalla registrada en el Dispositivo Rotom" }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    )

  } catch (error) {
    const mensajeError = error instanceof Error ? error.message : "Error desconocido"
    
    return new Response(
      JSON.stringify({ success: false, error: mensajeError }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400 
      }
    )
  }
})