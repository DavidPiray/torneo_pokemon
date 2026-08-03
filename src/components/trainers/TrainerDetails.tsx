import React from "react";
import { PerfilEntrenador } from "@/interface/trainer";
import { TYPE_COLORS, TYPE_TRANSLATIONS, LISTA_PAISES } from "@/lib/constants";
import {
  TwitchIcon,
  YoutubeIcon,
  KickIcon,
  TiktokIcon,
} from "@/components/SocialIcons";

interface TrainerDetailProps {
  entrenador: PerfilEntrenador;
  faseActual: string;
  onClose: () => void;
}

export function TrainerDetail({
  entrenador,
  faseActual,
  onClose,
}: TrainerDetailProps) {
  const isoBandera = LISTA_PAISES.find(
    (pais) => pais.code === entrenador.pais,
  )?.iso;
  const starter =
    entrenador.equipo.find((p) => p.slot === 1) || entrenador.equipo[0];

  // 3D Minecraft skin body render URL
  const skinBodyUrl = `https://mc-heads.net/body/${entrenador.minecraft_uuid || "Steve"}/250`;

  return (
    <div className="relative w-full bg-slate-900/40 border border-cyan-500/30 rounded-2xl p-4 sm:p-6 shadow-[0_0_30px_rgba(6,182,212,0.15)] text-white backdrop-blur-xl overflow-hidden flex flex-col">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
      <div className="absolute inset-0 pointer-events-none opacity-5 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:20px_20px]" />
      {/* Top Header Controls */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-4 mb-4">
        {/* Back Button */}
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-400 rounded-lg text-cyan-300 hover:text-white transition-all text-xs font-bold uppercase cursor-pointer"
          title="Cerrar Ficha"
        >
          <span className="text-base leading-none">←</span> Volver a Lista
        </button>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest hidden sm:inline">
            FICHA INDIVIDUAL / COMPETIDOR
          </span>
        </div>
      </div>
      {/* Grid Principal: Izquierda-Skin + Redes | Derecha: Stats, Pokemon */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========== MINECRAFT SKIN & REDES ========== */}
        <div className="lg:col-span-4 flex flex-col items-center bg-black/40 border border-white/10 rounded-2xl p-4 relative">
          {/* 3D Skin */}
          <div className="relative w-full h-60 sm:h-72 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-radial from-cyan-500/10 via-transparent to-transparent pointer-events-none" />
            <img
              src={skinBodyUrl}
              alt={entrenador.nombre_streamer}
              className="h-full object-contain filter drop-shadow-[0_10px_25px_rgba(0,0,0,0.9)] transition-transform duration-300 hover:scale-105"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  `https://mc-heads.net/body/Steve/250`;
              }}
            />
          </div>
          {/* Redes Sociales Header */}
          {/* Redes Sociales Header */}
          <div className="w-full mt-4 text-center">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-400 border-b border-white/10 pb-2 mb-3">
              Redes Sociales
            </h4>
            {/* Botones */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 w-full">
              {/* Twitch */}
              {entrenador.redes_sociales?.twitch && (
                <a
                  href={entrenador.redes_sociales?.twitch || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-purple-400 hover:bg-purple-950/40 transition-all text-slate-300 hover:text-purple-300 group"
                >
                  <TwitchIcon className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform text-purple-400" />
                  <span className="text-[10px] font-bold uppercase">
                    Twitch
                  </span>
                </a>
              )}
              {/* YouTube */}
              {entrenador.redes_sociales?.youtube && (
                <a
                  href={entrenador.redes_sociales?.youtube || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-red-400 hover:bg-red-950/40 transition-all text-slate-300 hover:text-red-300 group"
                >
                  <YoutubeIcon className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform text-red-400" />
                  <span className="text-[10px] font-bold uppercase">
                    YouTube
                  </span>
                </a>
              )}
              {/* Kick */}
              {entrenador.redes_sociales?.kick && (
                <a
                  href={entrenador.redes_sociales?.kick || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-orange-400 hover:bg-orange-950/40 transition-all text-slate-300 hover:text-orange-300 group"
                >
                  <KickIcon className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform text-orange-400" />
                  <span className="text-[10px] font-bold uppercase">Kick</span>
                </a>
              )}
              {/* TikTok */}
              {entrenador.redes_sociales?.tiktok && (
                <a
                  href={entrenador.redes_sociales?.tiktok || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-pink-400 hover:bg-pink-950/40 transition-all text-slate-300 hover:text-pink-300 group"
                >
                  <TiktokIcon className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform text-pink-400" />
                  <span className="text-[10px] font-bold uppercase">
                    TikTok
                  </span>
                </a>
              )}
            </div>
          </div>
        </div>
        {/* ========== STATS & TEAM ========== */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {/* Top: Nombre + Rango */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl sm:text-4xl font-black uppercase text-white tracking-tight">
                  {entrenador.nombre_streamer}
                </h2>
                {isoBandera && (
                  <img
                    src={`https://flagcdn.com/w40/${isoBandera}.png`}
                    alt={entrenador.pais}
                    className="w-6 h-4 object-cover rounded shadow"
                    referrerPolicy="no-referrer"
                  />
                )}
                <span className="px-2.5 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/40 text-xs font-black text-cyan-300">
                  {entrenador.clasificacion?.rango || "PLATINUM RANK"}
                </span>
              </div>
              <p className="text-xs font-mono text-slate-400 mt-1">
                MC ID:{" "}
                <span className="text-cyan-400 font-bold">
                  {entrenador.minecraft_uuid}
                </span>
              </p>
            </div>
            {/* Rango */}
            <div className="flex flex-col items-end bg-white/5 border border-white/10 px-5 py-2.5 rounded-xl text-right">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">
                Puesto
              </span>
              <span className="text-3xl font-black text-amber-400 leading-none mt-0.5">
                #{entrenador.puesto ?? 1}
              </span>
            </div>
          </div>
          {/* Datos de la Serie */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400">
              Datos de la Serie
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Pokémon Inicial Asignado */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center shrink-0">
                  {starter ? (
                    <img
                      src={starter.sprite_url}
                      alt={starter.nombre}
                      className="w-10 h-10 object-contain drop-shadow"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-xs text-cyan-400">⚡</span>
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Pokémon Inicial
                  </span>
                  <span className="text-sm font-black uppercase text-cyan-300">
                    {starter ? `${starter.nombre} (Inicial)` : "Sin Inicial"}
                  </span>
                </div>
              </div>
              {/* Puntos de Combate & Métricas de Registro */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    Puntos de Combate
                  </span>
                  <span className="text-lg font-black text-white">
                    {entrenador.clasificacion?.elo ?? 1420}{" "}
                    <span className="text-xs text-cyan-400 uppercase font-mono">
                      ELO
                    </span>
                  </span>
                </div>
                <div className="text-right border-l border-white/10 pl-4">
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    Victorias / Derrotas
                  </span>
                  <span className="text-lg font-black text-white">
                    {entrenador.clasificacion?.victorias ?? 12}{" "}
                    <span className="text-slate-500">/</span>{" "}
                    {entrenador.clasificacion?.derrotas ?? 4}
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* EQUIPO */}
          <div className="space-y-3 mt-2">
            <div className="flex items-center gap-3">
              <h3 className="text-xs font-black uppercase tracking-[0.25em] text-cyan-400">
                Equipo Pokemón Activo
              </h3>
              <div className="h-[1px] flex-1 bg-cyan-500/20" />
            </div>
            {/* 3x2 Grid of Pokemon slots */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map((slotNum) => {
                const pokeEnSlot = entrenador.equipo.find(
                  (p) => p.slot === slotNum,
                );
                const esStarter = slotNum === 1;
                const estaBloqueado = faseActual === "REGISTRO" && !esStarter;
                const tipoPrincipal =
                  pokeEnSlot?.tipos?.[0]?.toLowerCase() || "normal";
                const colorHex = TYPE_COLORS[tipoPrincipal] || "#06b6d4";
                if (estaBloqueado) {
                  return (
                    <div
                      key={slotNum}
                      className="bg-black/60 border border-dashed border-slate-700 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[140px] text-center opacity-50"
                    >
                      <div className="w-10 h-10 rounded-full border border-slate-600 flex items-center justify-center mb-2">
                        <span className="text-lg">🔒</span>
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        Slot Bloqueado
                      </span>
                    </div>
                  );
                }
                return (
                  <div
                    key={slotNum}
                    className="relative rounded-2xl p-4 border flex flex-col items-center justify-between min-h-[145px] bg-gradient-to-br from-slate-900/90 via-[#0b101a] to-black/80 transition-all duration-300 hover:scale-102 group overflow-hidden"
                    style={
                      pokeEnSlot
                        ? {
                            borderColor: `${colorHex}80`,
                            boxShadow: `0 4px 20px ${colorHex}25`,
                          }
                        : { borderColor: "#334155" }
                    }
                  >
                    {/* Starter Badge */}
                    {esStarter && (
                      <div className="absolute top-2.5 left-2.5 z-10">
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500 text-[8px] font-black uppercase text-black">
                          Starter
                        </span>
                      </div>
                    )}
                    {/* Sprite & Glow */}
                    {pokeEnSlot ? (
                      <>
                        <div className="relative my-1 h-16 w-16 flex items-center justify-center">
                          <div
                            className="w-14 h-14 rounded-full flex items-center justify-center mb-1 blur-[12px] absolute opacity-40"
                            style={{ backgroundColor: colorHex }}
                          />
                          <img
                            src={pokeEnSlot.sprite_url}
                            alt={pokeEnSlot.nombre}
                            className="relative z-10 max-h-full max-w-full object-contain filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)] transition-transform group-hover:scale-110"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        {/* Nombre */}
                        <span
                          className="text-xs font-black uppercase truncate w-full text-center tracking-wider"
                          style={{ color: colorHex }}
                        >
                          {pokeEnSlot.nombre}
                        </span>
                        {/* Tipo */}
                        <div className="flex flex-wrap items-center justify-center gap-1 mt-1">
                          {pokeEnSlot.tipos?.map((t) => {
                            const rawType = t.toLowerCase();
                            const c = TYPE_COLORS[rawType] || "#94a3b8";
                            const translated = TYPE_TRANSLATIONS[rawType] || t;
                            return (
                              <span
                                key={t}
                                className="text-[8px] font-bold uppercase px-2 py-0.5 rounded border leading-none"
                                style={{
                                  backgroundColor: `${c}20`,
                                  borderColor: `${c}60`,
                                  color: c,
                                }}
                              >
                                {translated}
                              </span>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      <span className="text-xs text-slate-500 font-mono uppercase font-bold my-auto">
                        Vacío
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          {/* Footer */}
          <div className="mt-2 pt-4 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-3">
            <button
              onClick={() =>
                alert(
                  `Cargando historial de combates de ${entrenador.nombre_streamer}...`,
                )
              }
              className="w-full sm:w-auto px-6 py-2.5 bg-cyan-500 text-black font-black text-[11px] uppercase tracking-widest rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:scale-105 transition-transform cursor-pointer"
            >
              Ver Historial de Combates
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
