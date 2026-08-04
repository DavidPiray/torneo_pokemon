"use server";

import { prisma } from "@/lib/prisma";

export async function obtenerCombatesAction() {
  try {
    const config = await prisma.configuracionTorneo.findUnique({
      where: { id: 1 },
    });

    const faseActual = config?.fase_actual || "REGISTRO";

    // Obtener todos los enfrentamientos con los datos completos de los dos jugadores
    const combates = await prisma.enfrentamiento.findMany({
      include: {
        jugador1: {
          include: { clasificacion: true },
        },
        jugador2: {
          include: { clasificacion: true },
        },
        ganador: true,
      },
      orderBy: {
        fecha_combate: "desc",
      },
    });

    return {
      success: true,
      faseActual,
      combates: JSON.parse(JSON.stringify(combates)),
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error al cargar combates";
    return {
      success: false,
      error: msg,
      faseActual: "REGISTRO",
      combates: [],
    };
  }
}