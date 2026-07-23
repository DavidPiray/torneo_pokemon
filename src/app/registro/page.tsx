"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function RegistroPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [discordUser, setDiscordUser] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [nombreStreamer, setNombreStreamer] = useState("");
  const [minecraftUuid, setMinecraftUuid] = useState("");

  useEffect(() => {
    async function fetchUserData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/");
        return;
      }

      setDiscordUser({
        id: user.id,
        name:
          user.user_metadata?.custom_claims?.global_name ||
          user.user_metadata?.full_name ||
          "Entrenador",
      });
    }

    fetchUserData();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discordUser) return;

    setLoading(true);

    // Crear el perfil en Supabase
    const { error } = await supabase.from("perfiles").insert({
      id: discordUser.id,
      discord_id: discordUser.id,
      nombre_streamer: nombreStreamer,
      minecraft_uuid: minecraftUuid,
    });

    if (error) {
      alert(`Error al registrar el perfil: ${error.message}`);
      setLoading(false);
      return;
    }

    // Inicializar fila en la tabla de clasificación
    await supabase.from("clasificacion").insert({
      perfil_id: discordUser.id,
      elo: 1000,
      rango: "Normal",
      victorias: 0,
      derrotas: 0,
    });

    // Redirigir al dashboard
    router.push("/dashboard");
  };

  if (!discordUser) {
    return (
      <div className="min-h-screen bg-black text-cyan-400 font-mono flex items-center justify-center">
        CONECTANDO CON EL DISPOSITIVO ROTOM...
      </div>
    );
  }

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center p-6 text-white pt-24">
      <div
        className="fixed inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/background.jpg')" }}
      />
      <div className="fixed inset-0 z-0 bg-black/80" />

      <div className="relative z-10 w-full max-w-md bg-gray-900/90 backdrop-blur-xl border border-cyan-500/30 p-8 rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.2)] space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black uppercase text-cyan-400 tracking-wider">
            Ficha de Inscripción
          </h1>
          <p className="text-gray-400 text-sm">
            Hola{" "}
            <span className="text-white font-bold">{discordUser.name}</span>,
            ingresa tus datos competitivos.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-cyan-300 mb-2">
              Nombre de Streamer / Creador
            </label>
            <input
              type="text"
              required
              value={nombreStreamer}
              onChange={(e) => setNombreStreamer(e.target.value)}
              placeholder="Ej. TwitchUser_TV"
              className="w-full bg-black/60 border border-gray-700 focus:border-cyan-400 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-cyan-300 mb-2">
              Usuario exacto de Minecraft
            </label>
            <input
              type="text"
              required
              value={minecraftUuid}
              onChange={(e) => setMinecraftUuid(e.target.value)}
              placeholder="Tu Nick en Charroland"
              className="w-full bg-black/60 border border-gray-700 focus:border-cyan-400 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-500 font-bold py-3 rounded-lg uppercase tracking-wider transition-all shadow-lg hover:shadow-cyan-500/30 disabled:opacity-50"
          >
            {loading ? "Guardando en Rotom..." : "Completar Registro"}
          </button>
        </form>
      </div>
    </main>
  );
}
