import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options),
              );
            } catch {
              // Llamado desde Server Component / Route Handler
            }
          },
        },
      },
    );

    // Intercambiar el código de Discord por la sesión de Supabase
    const {
      data: { session },
      error,
    } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && session) {
      // Verificar si ya existe perfil registrado
      const { data: perfil } = await supabase
        .from("perfiles")
        .select("id")
        .eq("id", session.user.id)
        .maybeSingle();

      // Si no tiene perfil, mandar a registro; si lo tiene, a dashboard
      if (!perfil) {
        return NextResponse.redirect(`${origin}/registro`);
      } else {
        return NextResponse.redirect(`${origin}/dashboard`);
      }
    }
  }

  // Si hubo algún fallo o no hay código, redirigir al inicio de forma segura
  return NextResponse.redirect(`${origin}/`);
}
