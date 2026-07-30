"use server";

import { prisma } from "@/lib/prisma";

export interface ActualizarPerfilInput {
  perfilId: string;
  nombreStreamer: string;
  minecraftUuid: string;
  pais: string;
  redesSociales?: {
    twitch?: string;
    youtube?: string;
    kick?: string;
    tiktok?: string;
  };
}

// Actualizar información general del perfil
export async function actualizarPerfilAction(input: ActualizarPerfilInput) {
  try {
    const perfilActualizado = await prisma.perfil.update({
      where: { id: input.perfilId },
      data: {
        nombre_streamer: input.nombreStreamer,
        minecraft_uuid: input.minecraftUuid,
        pais: input.pais,
        redes_sociales: input.redesSociales
          ? JSON.parse(JSON.stringify(input.redesSociales))
          : undefined,
      },
    });

    return { success: true, perfil: perfilActualizado };
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : "Error al actualizar perfil";
    return { success: false, error: msg };
  }
}

// Función auxiliar para verificar si la edición está permitida
async function esFaseRegistro() {
  const config = await prisma.configuracionTorneo.findUnique({ where: { id: 1 } });
  // Si no existe registro aun, asumimos REGISTRO por defecto
  return !config || config.fase_actual === "REGISTRO";
}

// Guardar o actualizar un slot del equipo Pokémon (Slots 2 al 6)
export async function guardarPokemonSlotAction(
  perfilId: string,
  slot: number,
  pokemonId: number,
  nombre: string,
  spriteUrl: string
) {
  try {
    const puedeEditar = await esFaseRegistro();
    if (!puedeEditar) {
      return { success: false, error: "El torneo ha entrado en fase bloqueada. No se pueden cambiar Pokémon." };
    }

    const equipo = await prisma.equipoPokemon.upsert({
      where: { perfil_id_slot: { perfil_id: perfilId, slot: slot } },
      update: { pokemon_id: pokemonId, nombre: nombre, sprite_url: spriteUrl },
      create: { perfil_id: perfilId, slot: slot, pokemon_id: pokemonId, nombre: nombre, sprite_url: spriteUrl },
    });

    return { success: true, equipo };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    return { success: false, error: msg };
  }
}

// Eliminar un Pokémon de un slot específico
export async function eliminarPokemonSlotAction(perfilId: string, slot: number) {
  try {
    const puedeEditar = await esFaseRegistro();
    if (!puedeEditar) {
      return { success: false, error: "El torneo ha entrado en fase bloqueada. No se pueden eliminar Pokémon." };
    }

    if (slot === 1) {
      return { success: false, error: "El Slot #1 es reservado para tu Pokémon Inicial." };
    }

    await prisma.equipoPokemon.deleteMany({
      where: { perfil_id: perfilId, slot: slot },
    });
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    return { success: false, error: msg };
  }
}