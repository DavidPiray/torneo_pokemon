"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

interface PerfilData {
  nombre_streamer: string;
  minecraft_uuid: string;
}

interface ClasificacionData {
  elo: number;
  rango: string;
  victorias: number;
  derrotas: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [perfil, setPerfil] = useState<PerfilData | null>(null);
  const [stats, setClasificacion] = useState<ClasificacionData | null>(null);

  useEffect(() => {
    async function loadTrainerData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/");
        return;
      }

      // Cargar datos del perfil
      const { data: perfilData } = await supabase
        .from("perfiles")
        .select("nombre_streamer, minecraft_uuid")
        .eq("id", user.id)
        .single();

      // Cargar clasificación
      const { data: clasificacionData } = await supabase
        .from("clasificacion")
        .select("elo, rango, victorias, derrotas")
        .eq("perfil_id", user.id)
        .single();

      setPerfil(perfilData);
      setClasificacion(clasificacionData);
      setLoading(false);
    }

    loadTrainerData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-cyan-400 font-mono flex items-center justify-center">
        CARGANDO DISPOSITIVO ROTOM...
      </div>
    );
  }

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center p-6 pt-28 text-white">
      <div
        className="fixed inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/background.jpg')" }}
      />
      <div className="fixed inset-0 z-0 bg-black/75" />

      <div className="relative z-10 w-full max-w-4xl space-y-8">
        {/* Encabezado del Dashboard */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-900/80 backdrop-blur-xl border border-cyan-500/30 p-6 rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.15)] gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
              Panel del Entrenador
            </span>
            <h1 className="text-4xl font-black uppercase text-white">
              {perfil?.nombre_streamer}
            </h1>
            <p className="text-sm text-gray-400 font-mono">
              Nick MC:{" "}
              <span className="text-gray-200">{perfil?.minecraft_uuid}</span>
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-5 py-2.5 bg-red-600/80 hover:bg-red-500 text-white font-bold rounded-lg text-sm transition-all shadow-md"
          >
            Cerrar Sesión
          </button>
        </div>

        {/* Tarjetas de Estadísticas Competitivas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-900/80 backdrop-blur-md border border-white/10 p-5 rounded-xl text-center">
            <span className="text-xs text-gray-400 uppercase font-bold tracking-widest">
              Puntos ELO
            </span>
            <p className="text-3xl font-black text-yellow-400 mt-1">
              {stats?.elo ?? 1000}
            </p>
          </div>
          <div className="bg-gray-900/80 backdrop-blur-md border border-white/10 p-5 rounded-xl text-center">
            <span className="text-xs text-gray-400 uppercase font-bold tracking-widest">
              Rango
            </span>
            <p className="text-3xl font-black text-cyan-400 mt-1">
              {stats?.rango ?? "Normal"}
            </p>
          </div>
          <div className="bg-gray-900/80 backdrop-blur-md border border-white/10 p-5 rounded-xl text-center">
            <span className="text-xs text-gray-400 uppercase font-bold tracking-widest">
              Victorias
            </span>
            <p className="text-3xl font-black text-green-400 mt-1">
              {stats?.victorias ?? 0}
            </p>
          </div>
          <div className="bg-gray-900/80 backdrop-blur-md border border-white/10 p-5 rounded-xl text-center">
            <span className="text-xs text-gray-400 uppercase font-bold tracking-widest">
              Derrotas
            </span>
            <p className="text-3xl font-black text-red-400 mt-1">
              {stats?.derrotas ?? 0}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
