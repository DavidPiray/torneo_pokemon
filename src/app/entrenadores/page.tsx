"use client";

import React, { useState, useEffect } from "react";
import { obtenerEntrenadoresPublicosAction } from "./actions";
import { buscarPokemon } from "@/lib/pokeapi";
import TrainerCard from "@/components/trainers/TrainerCard";
import { TrainerDetail } from "@/components/trainers/TrainerDetails";
import { PerfilEntrenador } from "@/interface/trainer";
import { LISTA_PAISES } from "@/lib/constants";
import { Filter, Search, RotateCcw } from "lucide-react";
import { supabase } from "@/lib/supabase";
export default function App() {
  const [loading, setLoading] = useState(true);
  const [faseActual, setFaseActual] = useState<string>("REVELADA");
  const [tabActiva, setTabActiva] = useState<string>("entrenadores");
  const [entrenadores, setEntrenadores] = useState<PerfilEntrenador[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroPais, setFiltroPais] = useState("TODOS");
  const [seleccionado, setSeleccionado] = useState<PerfilEntrenador | null>(
    null,
  );

  useEffect(() => {
    // 1. Función principal de carga
    async function cargar() {
      try {
        const res = await obtenerEntrenadoresPublicosAction();
        if (res.success && res.perfiles) {
          setFaseActual(res.faseActual);
          // Enriquecer Pokémon con PokeAPI
          let entrenadoresProcesados = await Promise.all(
            res.perfiles.map(async (p: PerfilEntrenador) => {
              const equipoEnriquecido = await Promise.all(
                p.equipo.map(async (slot) => {
                  if (slot.tipos && slot.tipos.length > 0) return slot;
                  const poke = await buscarPokemon(slot.nombre);
                  return { ...slot, tipos: poke?.types || ["normal"] };
                }),
              );
              return { ...p, equipo: equipoEnriquecido };
            }),
          );
          // CALCULAR EL PUESTO INICIAL
          entrenadoresProcesados.sort((a, b) => {
            const eloA = a.clasificacion?.elo ?? 0;
            const eloB = b.clasificacion?.elo ?? 0;
            return eloB - eloA;
          });
          entrenadoresProcesados = entrenadoresProcesados.map((ent, index) => ({
            ...ent,
            puesto: index + 1,
          }));
          setEntrenadores(entrenadoresProcesados);
          if (entrenadoresProcesados.length > 0) {
            setSeleccionado(entrenadoresProcesados[0]);
          }
        }
      } catch (err) {
        console.error("Error cargando entrenadores:", err);
      } finally {
        setLoading(false);
      }
    }
    cargar();
    // 2. ESCÁNER EN TIEMPO REAL (Supabase Realtime)
    const channel = supabase
      .channel("cambios_clasificacion")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "clasificacion" },
        (payload) => {
          console.log("¡Actualización de ELO detectada!", payload);
          setEntrenadores((prev) => {
            // Actualizamos los datos del entrenador que cambió
            const nuevosEntrenadores = prev.map((ent) => {
              if (ent.id === payload.new.perfil_id) {
                return {
                  ...ent,
                  clasificacion: {
                    ...ent.clasificacion,
                    elo: payload.new.elo,
                    rango: payload.new.rango,
                    victorias: payload.new.victorias,
                    derrotas: payload.new.derrotas,
                  },
                };
              }
              return ent;
            });
            // Re-ordenamos dinámicamente toda la tabla
            nuevosEntrenadores.sort((a, b) => {
              const eloA = a.clasificacion?.elo ?? 0;
              const eloB = b.clasificacion?.elo ?? 0;
              return eloB - eloA;
            });
            // Re-calculamos los puestos en vivo
            return nuevosEntrenadores.map((ent, index) => ({
              ...ent,
              puesto: index + 1,
            }));
          });
        },
      )
      .subscribe();
    // Limpiamos el socket al desmontar el componente
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  const entrenadoresFiltrados = entrenadores.filter((ent) => {
    const term = busqueda.toLowerCase().trim();
    const coincideTexto =
      !term ||
      ent.nombre_streamer.toLowerCase().includes(term) ||
      ent.minecraft_uuid.toLowerCase().includes(term);

    const coincidePais = filtroPais === "TODOS" || ent.pais === filtroPais;

    return coincideTexto && coincidePais;
  });
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-cyan-400 font-mono flex flex-col items-center justify-center gap-4">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
          <div className="w-8 h-8 border-2 border-amber-400/30 border-b-amber-400 rounded-full animate-spin direction-reverse" />
        </div>
        <span className="text-xs font-bold tracking-[0.25em] uppercase text-cyan-400 animate-pulse">
          SISTEMA ESCANEANDO BASE DE DATOS DE LA COPA...
        </span>
      </div>
    );
  }
  return (
    <div className="min-h-screen w-full bg-[#050505] text-white flex flex-col font-sans relative overflow-x-hidden">
      <div
        className="fixed inset-0 pointer-events-none opacity-20 z-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 2px 2px, #06b6d4 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-cyan-600/10 rounded-full filter blur-[150px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full filter blur-[150px] pointer-events-none" />
      <main className="relative z-10 w-full max-w-[1400px] mx-auto px-4 py-4 flex-1 flex flex-col gap-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div
            className={`transition-all duration-300 ${
              seleccionado ? "lg:col-span-5 xl:col-span-4" : "lg:col-span-12"
            }`}
          >
            <div className="flex items-center justify-between mb-2 px-1">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400 font-mono">
                1. VISTA DE LISTA{" "}
                <span className="text-slate-500 font-normal">(Directorio)</span>
              </h2>
              <span className="text-[10px] font-mono text-slate-500">
                {entrenadoresFiltrados.length} REGISTROS
              </span>
            </div>
            <div className="bg-slate-900/40 border border-cyan-500/30 rounded-2xl p-4 shadow-[0_0_25px_rgba(6,182,212,0.1)] backdrop-blur-xl relative">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-cyan-300 w-full sm:w-auto">
                    <Filter className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="font-bold uppercase text-[10px] text-slate-400 hidden sm:inline">
                      Filtro:
                    </span>
                    <select
                      value={filtroPais}
                      onChange={(e) => setFiltroPais(e.target.value)}
                      className="bg-transparent text-cyan-300 font-bold focus:outline-none cursor-pointer text-xs w-full"
                    >
                      <option value="TODOS" className="bg-slate-900 text-white">
                        🌐 Todos los Países
                      </option>
                      {LISTA_PAISES.map((pais) =>
                        pais.code !== "ND" ? (
                          <option
                            key={pais.code}
                            value={pais.code}
                            className="bg-slate-900 text-white"
                          >
                            {pais.name}
                          </option>
                        ) : null,
                      )}
                    </select>
                  </div>
                </div>
                <div className="relative w-full sm:w-48">
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar..."
                    className="w-full bg-white/5 border border-white/10 focus:border-cyan-400/80 rounded-xl pl-3 pr-8 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                  />
                  <Search className="absolute right-3 top-2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>
              {entrenadoresFiltrados.length === 0 ? (
                <div className="py-12 text-center text-slate-400 font-mono text-xs flex flex-col items-center gap-2">
                  <span>
                    No se encontraron entrenadores con el criterio actual.
                  </span>
                  <button
                    onClick={() => {
                      setBusqueda("");
                      setFiltroPais("TODOS");
                    }}
                    className="mt-2 flex items-center gap-1.5 px-3 py-1.5 bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-500/40 rounded-lg text-cyan-300 text-xs font-bold cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" /> Limpiar Filtros
                  </button>
                </div>
              ) : (
                <div
                  className={`grid gap-3 ${
                    seleccionado
                      ? "grid-cols-2 sm:grid-cols-2 xl:grid-cols-2"
                      : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
                  }`}
                >
                  {entrenadoresFiltrados.map((entrenador) => (
                    <TrainerCard
                      key={entrenador.id}
                      entrenador={entrenador}
                      isActivo={seleccionado?.id === entrenador.id}
                      onSelect={(ent) => setSeleccionado(ent)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
          {seleccionado && (
            <div className="lg:col-span-7 xl:col-span-8 sticky top-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between mb-2 px-1">
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400 font-mono">
                  2. VISTA DETALLADA{" "}
                  <span className="text-slate-500 font-normal">
                    (Ficha Individual)
                  </span>
                </h2>
              </div>
              <TrainerDetail
                entrenador={seleccionado}
                faseActual={faseActual}
                onClose={() => setSeleccionado(null)}
              />
            </div>
          )}
        </div>
      </main>
      <footer className="relative z-10 w-full border-t border-cyan-500/10 py-3 px-6 bg-black/60 backdrop-blur-md mt-6">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono text-slate-500 gap-2">
          <div className="flex items-center gap-3">
            <span className="text-cyan-400/80 font-bold">
              SRV: node-pokemon-master
            </span>
            <span>|</span>
            <span className="text-slate-400">LATENCY: 42ms</span>
            <span>|</span>
            <span className="text-amber-400/80">ENCRYPTION: AES-256</span>
          </div>
          <div>TERMINAL COPA DE MAESTROS © ALL RIGHTS RESERVED</div>
        </div>
      </footer>
    </div>
  );
}
