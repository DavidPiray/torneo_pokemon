"use client";

import React, { useState, useEffect } from "react";
import { obtenerDatosTorneoAction } from "./actions";
import { buscarPokemon } from "@/lib/pokeapi";
import { supabase } from "@/lib/supabase";
import { TYPE_COLORS, LISTA_PAISES } from "@/lib/constants";
import type { PerfilEntrenador } from "@/interface/trainer";
import { Trophy, Shield, Swords, Lock } from "lucide-react";
interface EnfrentamientoBD {
  id: string;
  fase: string;
  jugador1_id: string;
  jugador2_id: string;
  ganador_id?: string;
}
export default function TorneoPage() {
  const [loading, setLoading] = useState(true);
  const [faseActual, setFaseActual] = useState<string>("REGISTRO");
  const [leaderboard, setLeaderboard] = useState<PerfilEntrenador[]>([]);
  const [enfrentamientos, setEnfrentamientos] = useState<EnfrentamientoBD[]>(
    [],
  );
  const cargarDatos = async () => {
    try {
      const res = await obtenerDatosTorneoAction();
      if (res.success && res.leaderboard) {
        setFaseActual(res.faseActual || "REGISTRO");
        setEnfrentamientos(res.enfrentamientos || []);
        // Enriquecer Pokémon con tipos desde PokéAPI
        const procesados = await Promise.all(
          res.leaderboard.map(async (p: PerfilEntrenador) => {
            const equipoEnriquecido = await Promise.all(
              (p.equipo || []).map(async (slot) => {
                if (slot.tipos && slot.tipos.length > 0) return slot;
                const poke = await buscarPokemon(slot.nombre);
                return { ...slot, tipos: poke?.types || ["normal"] };
              }),
            );
            return { ...p, equipo: equipoEnriquecido };
          }),
        );
        setLeaderboard(procesados);
      }
    } catch (err) {
      console.error("Error al cargar torneo:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    cargarDatos();
    // Listener Realtime para Supabase
    const channel = supabase
      .channel("torneo_realtime_publico")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "clasificacion" },
        () => {
          cargarDatos();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "enfrentamientos" },
        () => {
          cargarDatos();
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  // Top 8 clasificados a Playoffs
  const top8 = leaderboard.slice(0, 8);
  const getIso = (paisCode?: string) => {
    if (!paisCode) return "";
    const p = LISTA_PAISES.find((item) => item.code === paisCode);
    return p ? p.iso : "";
  };
  const getMcHead = (mcNick: string) => {
    return `https://mc-heads.net/avatar/${mcNick || "Steve"}/100`;
  };
  // Renderizador seguro para Ficha de Bracket
  const renderFichaBracket = (
    jugador?: PerfilEntrenador,
    esMisterioso: boolean = false,
  ) => {
    if (esMisterioso || !jugador) {
      return (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-2.5 flex items-center gap-3 opacity-60 min-w-[200px] my-1">
          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 shrink-0">
            <Lock className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-slate-400 uppercase">
              Clasificado 🔒
            </span>
            <span className="text-[9px] text-slate-600 font-mono">
              Por definir
            </span>
          </div>
        </div>
      );
    }
    const iso = getIso(jugador.pais);
    const starter = (jugador.equipo || []).find((p) => p.slot === 1);
    const colorTipo = starter?.tipos?.[0]
      ? TYPE_COLORS[starter.tipos[0]]
      : "#06b6d4";
    return (
      <div
        className="bg-slate-900/90 border border-cyan-500/40 p-2.5 rounded-xl flex flex-col gap-2 min-w-[210px] shadow-lg my-1 transition-all"
        style={{ boxShadow: `0 0 10px ${colorTipo}20` }}
      >
        <div className="flex items-center gap-2.5">
          <div className="relative shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getMcHead(jugador.minecraft_uuid)}
              alt={jugador.minecraft_uuid}
              className="w-8 h-8 rounded-lg border border-cyan-400 object-cover bg-slate-800"
            />
            {iso && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={`https://flagcdn.com/w20/${iso}.png`}
                alt="Bandera"
                className="absolute -bottom-1 -right-1 w-3.5 h-2 object-cover rounded shadow"
              />
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-black uppercase text-white truncate">
              {jugador.nombre_streamer}
            </span>
            <span className="text-[9px] text-cyan-400 font-mono">
              MC: {jugador.minecraft_uuid}
            </span>
          </div>
        </div>
        {/* Miniequipo de 6 Pokémon */}
        <div className="flex gap-1 pt-1 border-t border-white/10 justify-between">
          {[1, 2, 3, 4, 5, 6].map((slotNum) => {
            const poke = (jugador.equipo || []).find((p) => p.slot === slotNum);
            const esStarter = slotNum === 1;
            const oculto = faseActual === "REGISTRO" && !esStarter;

            if (oculto) {
              return (
                <div
                  key={slotNum}
                  className="w-4 h-4 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-[7px] text-slate-500"
                >
                  🔒
                </div>
              );
            }
            return (
              <div
                key={slotNum}
                className="w-4 h-4 rounded bg-slate-950 border border-cyan-500/30 flex items-center justify-center p-0.5"
              >
                {poke ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={poke.sprite_url}
                    alt={poke.nombre}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-[7px] text-slate-600">•</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  const bracketsActivos =
    faseActual === "EN_JUEGO" || faseActual === "PLAYOFFS";
  const getGanadorPorFase = (faseNombre: string) => {
    const match = enfrentamientos.find((e) => e.fase === faseNombre);
    if (!match || !match.ganador_id) return undefined;
    return leaderboard.find((p) => p.id === match.ganador_id);
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-cyan-400 font-mono flex flex-col items-center justify-center gap-4">
        <div className="relative w-12 h-12 flex items-center justify-center">
          <div className="absolute inset-0 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
        </div>
        <span className="text-xs font-bold tracking-[0.2em] uppercase animate-pulse">
          ESCANEANDO MATRIZ DE COMBATE EN VIVO...
        </span>
      </div>
    );
  }
  return (
    <main className="relative min-h-screen w-full flex flex-col items-center p-4 md:p-8 pt-28 text-white bg-[#050505]">
      <div
        className="fixed inset-0 pointer-events-none opacity-20 z-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 2px 2px, #06b6d4 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="relative z-10 w-full max-w-[1600px] space-y-6">
        {/* ENCABEZADO */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900/40 border border-cyan-500/30 p-6 rounded-2xl backdrop-blur-xl shadow-lg gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 font-mono">
                FASE COMPETITIVA
              </span>
            </div>
            <h1 className="text-3xl font-black uppercase text-white tracking-wide mt-1">
              Tabla de Posiciones & Brackets
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`text-xs font-bold font-mono px-3 py-1.5 rounded-xl border ${
                bracketsActivos
                  ? "bg-green-500/20 text-green-300 border-green-500/40"
                  : "bg-amber-500/20 text-amber-300 border-amber-500/40"
              }`}
            >
              {bracketsActivos
                ? "⚔️ PLAYOFFS ACTIVOS"
                : "🔒 BRACKETS EN PREPARACIÓN"}
            </span>
          </div>
        </div>
        {/* ESTRUCTURA PRINCIPAL DE 2 COLUMNAS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* COLUMNA 1 (IZQUIERDA): TABLA DE POSICIONES */}
          <div className="lg:col-span-5 space-y-3 bg-slate-900/40 border border-cyan-500/30 p-5 rounded-2xl backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2 font-mono">
                <Shield className="w-4 h-4" /> Clasificación Global
              </h2>
              <span className="text-[10px] font-mono text-slate-400">
                TOP 8 CLASIFICA A LA COPA
              </span>
            </div>
            {leaderboard.length === 0 ? (
              <p className="text-xs text-slate-500 font-mono py-4 text-center">
                No hay participantes registrados en la tabla aún.
              </p>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((entrenador, idx) => {
                  const esTop8 = idx < 8;
                  const iso = getIso(entrenador.pais);
                  return (
                    <div
                      key={entrenador.id}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                        esTop8
                          ? "bg-cyan-950/30 border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.1)]"
                          : "bg-black/40 border-slate-800 opacity-80"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`w-6 text-center text-xs font-black font-mono ${
                            idx === 0
                              ? "text-amber-400 text-sm"
                              : idx === 1
                                ? "text-slate-300"
                                : idx === 2
                                  ? "text-amber-600"
                                  : esTop8
                                    ? "text-cyan-400"
                                    : "text-slate-600"
                          }`}
                        >
                          #{idx + 1}
                        </span>
                        {/* Cabeza de Minecraft */}
                        <div className="relative shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={getMcHead(entrenador.minecraft_uuid)}
                            alt={entrenador.minecraft_uuid}
                            className="w-9 h-9 rounded-lg border border-slate-700 object-cover bg-slate-800"
                          />
                          {iso && (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={`https://flagcdn.com/w20/${iso}.png`}
                              alt="Bandera"
                              className="absolute -bottom-1 -right-1 w-3.5 h-2 object-cover rounded shadow"
                            />
                          )}
                        </div>

                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold uppercase text-white truncate">
                            {entrenador.nombre_streamer}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            MC: {entrenador.minecraft_uuid}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <span className="text-xs font-black text-amber-400 font-mono block">
                            {entrenador.clasificacion?.elo ?? 1000} ELO
                          </span>
                          <span className="text-[9px] text-slate-500 uppercase font-bold">
                            {entrenador.clasificacion?.rango ?? "Normal"}
                          </span>
                        </div>

                        {esTop8 && (
                          <span className="text-[9px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded uppercase font-extrabold font-mono">
                            PASS
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {/* COLUMNA 2 (DERECHA): BRACKETS ELIMINATORIOS */}
          <div className="lg:col-span-7 space-y-4 bg-slate-900/40 border border-cyan-500/30 p-5 rounded-2xl backdrop-blur-xl shadow-xl overflow-x-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 min-w-[600px]">
              <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2 font-mono">
                <Swords className="w-4 h-4" /> Cuadro Eliminatorio (Playoffs)
              </h2>
              <span className="text-[10px] font-mono text-slate-400">
                ACTUALIZADO EN TIEMPO REAL
              </span>
            </div>
            <div className="flex justify-between items-center min-w-[650px] gap-6 py-4">
              {/* CUARTOS DE FINAL */}
              <div className="flex flex-col gap-6 flex-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 text-center font-mono">
                  Cuartos de Final
                </span>
                <div className="space-y-1 bg-black/40 p-2 rounded-xl border border-slate-800">
                  {renderFichaBracket(top8[0], !bracketsActivos)}
                  <div className="text-center text-[10px] font-mono text-slate-600 font-bold">
                    VS
                  </div>
                  {renderFichaBracket(top8[7], !bracketsActivos)}
                </div>
                <div className="space-y-1 bg-black/40 p-2 rounded-xl border border-slate-800">
                  {renderFichaBracket(top8[3], !bracketsActivos)}
                  <div className="text-center text-[10px] font-mono text-slate-600 font-bold">
                    VS
                  </div>
                  {renderFichaBracket(top8[4], !bracketsActivos)}
                </div>
                <div className="space-y-1 bg-black/40 p-2 rounded-xl border border-slate-800">
                  {renderFichaBracket(top8[1], !bracketsActivos)}
                  <div className="text-center text-[10px] font-mono text-slate-600 font-bold">
                    VS
                  </div>
                  {renderFichaBracket(top8[6], !bracketsActivos)}
                </div>
                <div className="space-y-1 bg-black/40 p-2 rounded-xl border border-slate-800">
                  {renderFichaBracket(top8[2], !bracketsActivos)}
                  <div className="text-center text-[10px] font-mono text-slate-600 font-bold">
                    VS
                  </div>
                  {renderFichaBracket(top8[5], !bracketsActivos)}
                </div>
              </div>
              <div className="w-px h-full bg-cyan-500/20 shrink-0" />
              {/* SEMIFINALES */}
              <div className="flex flex-col gap-16 flex-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 text-center font-mono">
                  Semifinales
                </span>
                <div className="space-y-1 bg-black/40 p-2 rounded-xl border border-slate-800">
                  {renderFichaBracket(
                    getGanadorPorFase("CUARTOS_1"),
                    !bracketsActivos,
                  )}
                  <div className="text-center text-[10px] font-mono text-slate-600 font-bold">
                    VS
                  </div>
                  {renderFichaBracket(
                    getGanadorPorFase("CUARTOS_2"),
                    !bracketsActivos,
                  )}
                </div>
                <div className="space-y-1 bg-black/40 p-2 rounded-xl border border-slate-800">
                  {renderFichaBracket(
                    getGanadorPorFase("CUARTOS_3"),
                    !bracketsActivos,
                  )}
                  <div className="text-center text-[10px] font-mono text-slate-600 font-bold">
                    VS
                  </div>
                  {renderFichaBracket(
                    getGanadorPorFase("CUARTOS_4"),
                    !bracketsActivos,
                  )}
                </div>
              </div>
              <div className="w-px h-full bg-cyan-500/20 shrink-0" />
              {/* GRAN FINAL */}
              <div className="flex flex-col gap-8 flex-1 justify-center">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 text-center font-mono flex items-center justify-center gap-1">
                  👑 Gran Final
                </span>
                <div className="space-y-1 bg-amber-950/20 p-3 rounded-xl border border-amber-500/40 shadow-[0_0_25px_rgba(245,158,11,0.15)]">
                  {renderFichaBracket(
                    getGanadorPorFase("SEMI_1"),
                    !bracketsActivos,
                  )}
                  <div className="text-center text-[10px] font-mono text-amber-400 font-bold my-1">
                    🏆 CAMPEÓN COPA DE MAESTROS
                  </div>
                  {renderFichaBracket(
                    getGanadorPorFase("SEMI_2"),
                    !bracketsActivos,
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
