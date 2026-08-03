import React from "react";
import { EquipoItem, PerfilEntrenador } from "@/interface/trainer";
import { LISTA_PAISES, TYPE_COLORS } from "@/lib/constants";

interface TrainerCardProps {
  entrenador: PerfilEntrenador;
  isActivo: boolean;
  onSelect: (entrenador: PerfilEntrenador) => void;
}

export default function TrainerCard({
  entrenador,
  isActivo,
  onSelect,
}: TrainerCardProps) {
  const isoBandera = LISTA_PAISES.find((pais) => pais.code === entrenador.pais)?.iso;
  const starter =
    entrenador.equipo.find((p) => p.slot === 1) || entrenador.equipo[0];
  const tipoStarter = starter?.tipos?.[0]?.toLowerCase() || "normal";
  const colorStarter = TYPE_COLORS[tipoStarter] || "#06b6d4";
  const mcHeadUrl = `https://mc-heads.net/avatar/${entrenador.minecraft_uuid || "Steve"}/100`;
  return (
    <div
      onClick={() => onSelect(entrenador)}
      className={`group relative cursor-pointer rounded-xl p-3 sm:p-4 flex flex-col items-center justify-between transition-all duration-300 border ${
        isActivo
          ? "bg-cyan-950/30 border-cyan-400/80 shadow-[0_0_20px_rgba(6,182,212,0.3)] scale-[1.02]"
          : "bg-white/5 border-white/10 hover:border-cyan-500/50 hover:bg-white/10"
      }`}
    >
      {isActivo && (
        <div className="absolute -left-1 top-4 h-8 w-1.5 bg-cyan-400 rounded-r shadow-[0_0_10px_#22d3ee]" />
      )}
      {/* Avatar Circular */}
      <div
        className={`relative my-1 w-20 h-20 sm:w-22 sm:h-22 rounded-full border-2 overflow-hidden flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 ${
          isActivo
            ? "border-cyan-400 bg-cyan-950 shadow-[0_0_15px_rgba(34,211,238,0.4)]"
            : "border-slate-700 bg-slate-900 group-hover:border-cyan-500/60"
        }`}
      >
        <img
          src={mcHeadUrl}
          alt={entrenador.nombre_streamer}
          className="w-full h-full object-cover p-1"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              `https://api.dicebear.com/7.x/pixel-art/svg?seed=${entrenador.nombre_streamer}`;
          }}
        />
      </div>
      <div className="flex flex-col items-center gap-1 w-full mt-1">
        <div className="flex items-center gap-1.5 max-w-full">
          <h3
            className={`font-black text-xs sm:text-sm uppercase tracking-wide truncate max-w-[120px] ${
              isActivo ? "text-cyan-300" : "text-white"
            }`}
          >
            {entrenador.nombre_streamer}
          </h3>
          {isoBandera && (
            <img
              src={`https://flagcdn.com/w20/${isoBandera}.png`}
              alt={entrenador.pais}
              className="w-4 h-3 object-cover rounded-sm shrink-0 shadow-sm"
              referrerPolicy="no-referrer"
            />
          )}
        </div>
        <p className="text-[10px] font-mono text-slate-500 truncate max-w-full">
          {entrenador.minecraft_uuid}
        </p>
      </div>
      <div
        className="w-full flex items-center justify-center bg-black/40 py-1.5 px-2 rounded-lg border border-white/10 my-2 min-h-[42px]"
        style={{ borderLeft: `3px solid ${colorStarter}` }}
      >
        {starter ? (
          <div className="flex items-center gap-2">
            <img
              src={starter.sprite_url}
              alt={starter.nombre}
              className="w-7 h-7 object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
              referrerPolicy="no-referrer"
            />
            <span
              className="text-[11px] font-bold uppercase truncate"
              style={{ color: colorStarter }}
            >
              {starter.nombre}
            </span>
          </div>
        ) : (
          <span className="text-[10px] text-slate-500 uppercase font-mono">
            Sin Starter
          </span>
        )}
      </div>
      <button
        type="button"
        className={`w-full py-1.5 px-3 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all duration-200 border cursor-pointer ${
          isActivo
            ? "bg-cyan-500 text-black border-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.5)]"
            : "bg-white/5 text-slate-300 border-white/10 group-hover:border-cyan-500/40 group-hover:text-cyan-300 group-hover:bg-cyan-950/30"
        }`}
      >
        {isActivo ? "Viendo Perfil" : "Ver Perfil"}
      </button>
    </div>
  );
}
