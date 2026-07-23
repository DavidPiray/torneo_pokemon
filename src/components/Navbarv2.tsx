"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

interface UserProfile {
  name: string;
  avatar: string;
  nombreStreamer?: string;
}

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (authUser) {
        // Consultar nombre de streamer registrado
        const { data: perfil } = await supabase
          .from("perfiles")
          .select("nombre_streamer")
          .eq("id", authUser.id)
          .maybeSingle();

        const avatarUrl = authUser.user_metadata?.avatar_url || "/pokeball.png";
        const name =
          perfil?.nombre_streamer ||
          authUser.user_metadata?.full_name ||
          "Entrenador";

        setUser({
          name,
          avatar: avatarUrl,
          nombreStreamer: perfil?.nombre_streamer,
        });
      } else {
        setUser(null);
      }
    }

    checkUser();

    // Escuchar cambios de sesión en tiempo real (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          setUser(null);
        } else {
          checkUser();
        }
      },
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
        scopes: "identify",
      },
    });
  };

  const handleLogout = async () => {
    setMenuOpen(false);
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-gray-900/80 backdrop-blur-md border-b border-cyan-500/30 shadow-[0_4px_30px_rgba(6,182,212,0.15)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center border-2 border-cyan-400 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.8)] transition-all duration-300">
                <Image
                  src="/Logo_LSFondo.png"
                  alt="CM"
                  width={40}
                  height={40}
                  className="object-contain"
                  style={{ width: "auto", height: "auto" }}
                />
              </div>
            </Link>
          </div>

          {/* Enlaces Centrales */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {["Inicio", "Torneo", "Entrenadores", "Noticias"].map((item) => (
                <Link
                  key={item}
                  href={item === "Inicio" ? "/" : `/${item.toLowerCase()}`}
                  className="text-gray-300 hover:text-cyan-400 hover:scale-105 transition-all duration-300 px-3 py-2 rounded-md text-sm font-bold uppercase tracking-widest"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>

          {/* Área de Usuario / Iniciar Sesión */}
          <div className="hidden md:flex items-center relative">
            {user ? (
              /* Usuario Autenticado -> Mostrar Foto y Menú Desplegable */
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-3 bg-gray-800/90 hover:bg-gray-700/90 border border-cyan-500/40 px-4 py-2 rounded-full transition-all shadow-md focus:outline-none"
                >
                  <img
                    src={user.avatar}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full border border-cyan-400 object-cover"
                  />
                  <span className="text-sm font-bold text-cyan-300 uppercase tracking-wider">
                    {user.name}
                  </span>
                  <svg
                    className={`w-4 h-4 text-cyan-400 transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Menú Desplegable */}
                {menuOpen && (
                  <div className="absolute right-0 mt-3 w-48 bg-gray-900 border border-cyan-500/40 rounded-xl shadow-2xl py-2 z-50 backdrop-blur-xl">
                    <Link
                      href="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2.5 text-sm font-bold text-gray-200 hover:bg-cyan-600/20 hover:text-cyan-300 uppercase tracking-wider transition-colors"
                    >
                      Panel de Control
                    </Link>
                    <hr className="border-gray-800 my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-400 hover:bg-red-600/20 uppercase tracking-wider transition-colors"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Usuario NO Autenticado -> Mostrar Botón Discord */
              <button
                onClick={handleLogin}
                className="flex items-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white px-6 py-2.5 rounded-lg font-bold transition-all duration-300 shadow-lg hover:shadow-[#5865F2]/50 hover:-translate-y-0.5"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                </svg>
                Iniciar Sesión
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
