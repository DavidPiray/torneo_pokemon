"use server";

import { prisma } from "@/lib/prisma";

export async function obtenerEntrenadoresPublicosAction() {
  try {
    // 1. Obtener la fase del torneo global
    const config = await prisma.configuracionTorneo.findUnique({
      where: { id: 1 },
    });
    const faseActual = config?.fase_actual || "REGISTRO";

    // 2. Obtener todos los perfiles de entrenadores registrados con su clasificación y equipo
    const perfiles = await prisma.perfil.findMany({
      include: {
        clasificacion: true,
        equipo: {
          orderBy: { slot: "asc" },
        },
      },
      orderBy: {
        nombre_streamer: "asc",
      },
    });

    return {
      success: true,
      faseActual,
      perfiles: JSON.parse(JSON.stringify(perfiles)),
    };
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : "Error al cargar entrenadores";
    return {
      success: false,
      error: msg,
      faseActual: "REGISTRO",
      perfiles: [],
    };
  }
}
