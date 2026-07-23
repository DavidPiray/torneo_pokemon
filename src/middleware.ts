import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refrescar la sesión activa
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const url = request.nextUrl.clone();

  // 1. Sin usuario autenticado -> Redirigir al Inicio
  if (
    !user &&
    (url.pathname.startsWith("/dashboard") ||
      url.pathname.startsWith("/registro"))
  ) {
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // 2. Con usuario autenticado -> Validar registro en BD
  if (user) {
    const { data: perfil } = await supabase
      .from("perfiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    // Si ya tiene perfil e intenta ir a /registro -> Mandar a /dashboard
    if (perfil && url.pathname === "/registro") {
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    // Si NO tiene perfil e intenta saltar a /dashboard -> Mandar a /registro
    if (!perfil && url.pathname.startsWith("/dashboard")) {
      url.pathname = "/registro";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/registro"],
};
