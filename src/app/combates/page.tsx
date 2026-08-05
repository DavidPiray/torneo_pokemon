"use client";

import React, { useState, useEffect } from "react";
import { obtenerCombatesAction } from "./actions";
import { supabase } from "@/lib/supabase";
import { LISTA_PAISES } from "@/lib/constants";
import {
  Swords,
  Calendar,
  History,
  Trophy,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

interface PerfilSencillo {
  id: string;
  nombre_streamer: string;
  minecraft_uuid: string;
  pais?: string;
  clasificacion?: {
    elo: number;
    rango: string;
  };
}

interface EquipoSlotJSON {
  slot: number;
  nombre: string;
  sprite_url: string;
}

interface CombateItem {
  id: string;
  tipo: string;
  fase: string;
  jugador1_id: string;
  jugador2_id: string;
  ganador_id?: string;
  equipo_j1?: EquipoSlotJSON[];
  equipo_j2?: EquipoSlotJSON[];
  elo_cambio_j1?: number;
  elo_cambio_j2?: number;
  fecha_combate: string;
  jugador1: PerfilSencillo;
  jugador2: PerfilSencillo;
  ganador?: PerfilSencillo;
}

export default function CombatesPage() {
  const [loading, setLoading] = useState(true);
  const [faseActual, setFaseActual] = useState("REGISTRO");
  const [combates, setCombates] = useState<CombateItem[]>([]);
  const [tab, setTab] = useState<"HISTORIAL" | "PROGRAMACION">("HISTORIAL");
  const [filtroTipo, setFiltroTipo] = useState<
    "TODOS" | "FASE_REGULAR" | "PLAYOFFS"
  >("TODOS");

  const cargarCombates = async () => {
    const res = await obtenerCombatesAction();
    if (res.success && res.combates) {
      setFaseActual(res.faseActual);
      setCombates(res.combates);
    }
    setLoading(false);
  };

  useEffect(() => {
    cargarCombates();

    // Escuchar en tiempo real si hay nuevos combates registrados por el script de Minecraft
    const channel = supabase
      .channel("combates_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "enfrentamientos" },
        () => {
          cargarCombates();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Filtrado de combates
  const combatesFinalizados = combates.filter(
    (c) => c.ganador_id !== null && c.ganador_id !== undefined,
  );
  const combatesProgramados = combates.filter(
    (c) => c.ganador_id === null || c.ganador_id === undefined,
  );

  const listaAmostrar = (
    tab === "HISTORIAL" ? combatesFinalizados : combatesProgramados
  ).filter((c) => filtroTipo === "TODOS" || c.tipo === filtroTipo);

  const getIso = (code?: string) => {
    if (!code) return "";
    const p = LISTA_PAISES.find((i) => i.code === code);
    return p ? p.iso : "";
  };

  const getMcHead = (nick: string) =>
    `https://mc-heads.net/avatar/${nick || "Steve"}/100`;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-cyan-400 font-mono flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
        <span className="text-xs font-bold tracking-[0.2em] uppercase animate-pulse">
          SISTEMA CARGANDO REGISTRO DE COMBATES...
        </span>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center p-4 md:p-8 pt-28 text-white bg-[#050505]">
      <div
        className="fixed inset-0 z-0 bg-cover bg-center "
        style={{ backgroundImage: "url('/background.jpg') " }}
      />
      <div className="fixed inset-0 z-0 bg-black/70" />

      <div className="relative z-10 w-full max-w-6xl space-y-6 ">
        {/* HEADER DE LA SECCIÓN */}
        <div className="bg-slate-900/40 border border-cyan-500/30 p-6 rounded-2xl backdrop-blur-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 font-mono flex items-center gap-2">
              <Swords className="w-4 h-4" /> Bitácora de Batallas
            </span>
            <h1 className="text-3xl font-black uppercase text-white tracking-wide mt-1">
              Combates del Torneo
            </h1>
          </div>

          {/* Filtros de Tipo */}
          <div className="flex items-center gap-2 bg-black/60 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setFiltroTipo("TODOS")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all ${
                filtroTipo === "TODOS"
                  ? "bg-cyan-500 text-black shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              TODOS
            </button>
            <button
              onClick={() => setFiltroTipo("FASE_REGULAR")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all ${
                filtroTipo === "FASE_REGULAR"
                  ? "bg-cyan-500 text-black shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              JORNADAS
            </button>
            <button
              onClick={() => setFiltroTipo("PLAYOFFS")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all ${
                filtroTipo === "PLAYOFFS"
                  ? "bg-cyan-500 text-black shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              PLAYOFFS
            </button>
          </div>
        </div>

        {/* TABS DE SELECCIÓN (HISTORIAL VS PROGRAMACIÓN) */}
        <div className="flex border-b border-white/10 gap-4">
          <button
            onClick={() => setTab("HISTORIAL")}
            className={`flex items-center gap-2 pb-3 text-sm font-black uppercase tracking-wider transition-all border-b-2 font-mono ${
              tab === "HISTORIAL"
                ? "border-cyan-400 text-cyan-400"
                : "border-transparent text-slate-500 hover:text-slate-300"
            }`}
          >
            <History className="w-4 h-4" /> Historial de Batallas (
            {combatesFinalizados.length})
          </button>

          <button
            onClick={() => setTab("PROGRAMACION")}
            className={`flex items-center gap-2 pb-3 text-sm font-black uppercase tracking-wider transition-all border-b-2 font-mono ${
              tab === "PROGRAMACION"
                ? "border-cyan-400 text-cyan-400"
                : "border-transparent text-slate-500 hover:text-slate-300"
            }`}
          >
            <Calendar className="w-4 h-4" /> Próximas Fechas (
            {combatesProgramados.length})
          </button>
        </div>

        {/* LISTA DE TARJETAS DE COMBATES */}
        {listaAmostrar.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 p-12 text-center rounded-2xl text-slate-500 font-mono text-sm">
            {tab === "HISTORIAL"
              ? "Aún no se han registrado combates oficiales en esta categoría."
              : "No hay combates pendientes programados en el calendario."}
          </div>
        ) : (
          <div className="space-y-4">
            {listaAmostrar.map((combate) => {
              const j1EsGanador = combate.ganador_id === combate.jugador1_id;
              const j2EsGanador = combate.ganador_id === combate.jugador2_id;
              const isoJ1 = getIso(combate.jugador1?.pais);
              const isoJ2 = getIso(combate.jugador2?.pais);

              return (
                <div
                  key={combate.id}
                  className="bg-slate-900/60 border border-cyan-500/30 hover:border-cyan-400/60 p-5 rounded-2xl shadow-xl transition-all flex flex-col gap-4 relative overflow-hidden"
                >
                  {/* Etiqueta Superior de Fase */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-[10px] font-mono font-extrabold uppercase px-2.5 py-1 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                      {combate.fase || "COMBATE OFICIAL"} • {combate.tipo}
                    </span>

                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(combate.fecha_combate).toLocaleDateString(
                        "es-ES",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </span>
                  </div>
                  {/* DUELO CENTRAL (JUGADOR 1 VS JUGADOR 2) */}
                  <div className="grid grid-cols-1 md:grid-cols-11 items-center gap-4 py-2">
                    {/* JUGADOR 1 (IZQUIERDA) */}
                    <div className="md:col-span-5 flex items-center justify-start md:justify-end gap-3 order-1">
                      <div className="text-left md:text-right">
                        <div className="flex items-center md:justify-end gap-1.5">
                          {j1EsGanador && (
                            <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                          )}
                          <h3
                            className={`font-black uppercase text-base truncate ${j1EsGanador ? "text-amber-300" : "text-white"}`}
                          >
                            {combate.jugador1?.nombre_streamer}
                          </h3>
                          {isoJ1 && (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={`https://flagcdn.com/w20/${isoJ1}.png`}
                              alt="Flag"
                              className="w-4 h-2.5 object-cover rounded shadow shrink-0"
                            />
                          )}
                        </div>

                        <p className="text-[10px] font-mono text-slate-400">
                          MC: {combate.jugador1?.minecraft_uuid}
                        </p>

                        {/* Variación ELO */}
                        {tab === "HISTORIAL" &&
                          combate.elo_cambio_j1 !== undefined && (
                            <span
                              className={`text-[10px] font-bold font-mono inline-flex items-center gap-0.5 ${
                                (combate.elo_cambio_j1 ?? 0) >= 0
                                  ? "text-green-400"
                                  : "text-red-400"
                              }`}
                            >
                              {(combate.elo_cambio_j1 ?? 0) >= 0 ? (
                                <ArrowUpRight className="w-3 h-3" />
                              ) : (
                                <ArrowDownRight className="w-3 h-3" />
                              )}
                              {combate.elo_cambio_j1} ELO
                            </span>
                          )}
                      </div>
                      {/* Cabeza MC J1 */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getMcHead(combate.jugador1?.minecraft_uuid)}
                        alt="Avatar J1"
                        className={`w-12 h-12 rounded-xl border-2 object-cover shrink-0 bg-slate-800 ${
                          j1EsGanador
                            ? "border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                            : "border-slate-700"
                        }`}
                      />
                    </div>
                    {/* BADGE VS CENTRAL */}
                    <div className="md:col-span-1 text-center font-mono font-black text-cyan-400 text-sm bg-black/60 py-1.5 px-3 rounded-xl border border-slate-800 my-auto order-2">
                      VS
                    </div>
                    {/* JUGADOR 2 (DERECHA) */}
                    <div className="md:col-span-5 flex items-center justify-start gap-3 order-3">
                      {/* Cabeza MC J2 */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getMcHead(combate.jugador2?.minecraft_uuid)}
                        alt="Avatar J2"
                        className={`w-12 h-12 rounded-xl border-2 object-cover shrink-0 bg-slate-800 ${
                          j2EsGanador
                            ? "border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                            : "border-slate-700"
                        }`}
                      />
                      <div className="text-left">
                        <div className="flex items-center gap-1.5">
                          {isoJ2 && (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={`https://flagcdn.com/w20/${isoJ2}.png`}
                              alt="Flag"
                              className="w-4 h-2.5 object-cover rounded shadow shrink-0"
                            />
                          )}
                          <h3
                            className={`font-black uppercase text-base truncate ${j2EsGanador ? "text-amber-300" : "text-white"}`}
                          >
                            {combate.jugador2?.nombre_streamer}
                          </h3>
                          {j2EsGanador && (
                            <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                          )}
                        </div>
                        <p className="text-[10px] font-mono text-slate-400">
                          MC: {combate.jugador2?.minecraft_uuid}
                        </p>
                        {/* Variación ELO */}
                        {tab === "HISTORIAL" &&
                          combate.elo_cambio_j2 !== undefined && (
                            <span
                              className={`text-[10px] font-bold font-mono inline-flex items-center gap-0.5 ${
                                (combate.elo_cambio_j2 ?? 0) >= 0
                                  ? "text-green-400"
                                  : "text-red-400"
                              }`}
                            >
                              {(combate.elo_cambio_j2 ?? 0) >= 0 ? (
                                <ArrowUpRight className="w-3 h-3" />
                              ) : (
                                <ArrowDownRight className="w-3 h-3" />
                              )}
                              {combate.elo_cambio_j2} ELO
                            </span>
                          )}
                      </div>
                    </div>
                  </div>
                  {/* EQUIPOS USADOS (SNAPSHOTS DE POKÉMON EN FASE HISTORIAL) */}
                  {tab === "HISTORIAL" &&
                    (combate.equipo_j1 || combate.equipo_j2) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-white/10 bg-black/30 p-3 rounded-xl">
                        {/* Equipo J1 */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                          <span className="text-[9px] font-mono text-slate-400 uppercase mr-1">
                            Roster J1:
                          </span>
                          {combate.equipo_j1?.map((poke, i) => (
                            <div
                              key={i}
                              className="w-7 h-7 bg-slate-900 border border-slate-700 rounded p-0.5 shrink-0"
                              title={poke.nombre}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={poke.sprite_url}
                                alt={poke.nombre}
                                className="w-full h-full object-contain"
                              />
                            </div>
                          ))}
                        </div>
                        {/* Equipo J2 */}
                        <div className="flex items-center gap-1.5 md:justify-end overflow-x-auto pb-1">
                          <span className="text-[9px] font-mono text-slate-400 uppercase mr-1">
                            Roster J2:
                          </span>
                          {combate.equipo_j2?.map((poke, i) => (
                            <div
                              key={i}
                              className="w-7 h-7 bg-slate-900 border border-slate-700 rounded p-0.5 shrink-0"
                              title={poke.nombre}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={poke.sprite_url}
                                alt={poke.nombre}
                                className="w-full h-full object-contain"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
