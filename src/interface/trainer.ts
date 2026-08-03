export interface EquipoItem {
  slot: number;
  pokemon_id: number;
  nombre: string;
  sprite_url: string;
  tipos?: string[];
}

export interface PerfilEntrenador {
  id: string;
  nombre_streamer: string;
  minecraft_uuid: string;
  pais: string;
  pokemon_inicial_nom?: string;
  redes_sociales?: {
    twitch?: string;
    youtube?: string;
    kick?: string;
    tiktok?: string;
  };
  clasificacion?: {
    elo: number;
    rango: string;
    victorias: number;
    derrotas: number;
  };
  equipo: EquipoItem[];
  puesto?: number;
}
