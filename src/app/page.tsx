"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import NoticiaCard from "../components/NoticiaCard";
import BatallaCard from "../components/BatallaCard";

export default function LandingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: { redirectTo: `${window.location.origin}/`, scopes: "identify" },
    });
  };

  const directoTwitch = () => {
    window.open("https://www.twitch.tv/totogamer14", "_blank");
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-black text-cyan-400 font-mono animate-pulse">
        INICIALIZANDO DISPOSITIVO ROTOM...
      </div>
    );

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center text-white pt-24 pb-16">
      {/* Fondo estático de alta calidad */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/background.jpg')" }}
      />
      <div className="fixed inset-0 z-0 bg-black/70" />

      {/* Hero Section */}
      <section className="relative z-10 text-center space-y-6 px-6 mb-20">
        <img
          src="/pokeball.png"
          alt="Pokébola"
          className="w-24 h-24 mx-auto animate-bounce"
        />
        <h1 className="text-7xl font-black tracking-tighter uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
          Copa de Maestros
        </h1>
        <p className="text-xl text-gray-300 max-w-lg mx-auto">
          El torneo definitivo de Charroland. ¿Tienes lo que se necesita para
          ser un maestro?
        </p>
        <button
          onClick={directoTwitch}
          className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-full font-bold shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all"
        >
          DIRECTO AHORA
        </button>
      </section>

      {/* Contenedor de Grid para Noticias y Batallas (Diseño tipo Rotom Dex) */}
      <section className="relative z-10 w-full max-w-6xl px-6 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Columna Noticias */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold border-l-4 border-yellow-400 pl-4 text-yellow-400 uppercase tracking-widest">
            Últimas Noticias
          </h2>
          <NoticiaCard
            titulo="Inicio de la Jornada 1"
            fecha="15 Julio, 2026"
            resumen="..."
          />
          <NoticiaCard
            titulo="Nueva Regla"
            fecha="14 Julio, 2026"
            resumen="..."
          />
        </div>

        {/* Columna Batallas (Con el estilo de la imagen) */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold border-l-4 border-cyan-400 pl-4 text-cyan-400 uppercase tracking-widest">
            Últimos Combates
          </h2>
          <div className="bg-black/40 p-4 rounded border border-cyan-900/50 space-y-3">
            <BatallaCard
              ent1="Streamer A"
              ent2="Streamer B"
              ganador="Streamer A"
            />
            <BatallaCard
              ent1="Streamer C"
              ent2="Streamer D"
              ganador="Streamer D"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
