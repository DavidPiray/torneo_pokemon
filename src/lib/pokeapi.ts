export interface PokemonData {
  id: number;
  name: string;
  sprite: string;
  types: string[];
}

// Búsqueda detallada de un Pokémon por nombre exacto o ID
export async function buscarPokemon(
  query: string,
): Promise<PokemonData | null> {
  if (!query) return null;

  try {
    const res = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${query.toLowerCase().trim()}`,
    );
    if (!res.ok) return null;

    const data = await res.json();

    return {
      id: data.id,
      name: data.name,
      sprite:
        data.sprites.other?.["official-artwork"]?.front_default ||
        data.sprites.front_default ||
        "",
      types: data.types.map((t: { type: { name: string } }) => t.type.name),
    };
  } catch {
    return null;
  }
}

// Obtener lista rápida de nombres para el buscador interactivo (Autocomplete)
export async function buscarSugerenciasPokemon(
  query: string,
): Promise<string[]> {
  if (!query || query.length < 2) return [];

  try {
    const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1025");
    if (!res.ok) return [];

    const data = await res.json();
    const filtrados = data.results
      .filter((p: { name: string }) =>
        p.name.toLowerCase().includes(query.toLowerCase().trim()),
      )
      .slice(0, 5)
      .map((p: { name: string }) => p.name);

    return filtrados;
  } catch {
    return [];
  }
}
