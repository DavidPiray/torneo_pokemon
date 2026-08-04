"use server";

import { prisma } from "@/lib/prisma";

export async function obtenerDatosTorneoAction() {
  let faseActual = "REGISTRO";
  let leaderboard: unknown[] = [];
  let enfrentamientos: unknown[] = [];

  // 1. Obtener la fase actual del torneo
  try {
    const config = await prisma.configuracionTorneo.findUnique({
      where: { id: 1 },
    });
    if (config) {
      faseActual = config.fase_actual;
    }
  } catch (e) {
    console.warn("No se pudo cargar configuracionTorneo:", e);
  }

  // 2. Obtener lista de perfiles con clasificación y equipo (Clasificación Global)
  try {
    const perfiles = await prisma.perfil.findMany({
      include: {
        clasificacion: true,
        equipo: {
          orderBy: { slot: "asc" },
        },
      },
    });

    // Ordenar por ELO descendente y asignar puestos
    leaderboard = perfiles
      .sort(
        (a, b) =>
          (b.clasificacion?.elo ?? 1000) - (a.clasificacion?.elo ?? 1000),
      )
      .map((p, idx) => ({
        ...p,
        puesto: idx + 1,
      }));
  } catch (e) {
    console.error("Error cargando leaderboard:", e);
  }

  // 3. Obtener enfrentamientos/brackets guardados de la BD
  try {
    const resEnfrentamientos = await prisma.enfrentamiento.findMany({
      include: {
        ganador: true,
      },
    });
    enfrentamientos = resEnfrentamientos;
  } catch (e) {
    console.warn("No se pudieron cargar enfrentamientos aún:", e);
  }

  return {
    success: true,
    faseActual,
    leaderboard: JSON.parse(JSON.stringify(leaderboard)),
    enfrentamientos: JSON.parse(JSON.stringify(enfrentamientos)),
  };
}
