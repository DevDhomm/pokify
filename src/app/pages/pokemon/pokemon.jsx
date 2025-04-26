"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from "./PokemonInfo.module.css";
const PokemonInfo = ({ pokemonName }) => {
  const [pokemon, setPokemon] = useState(null);
  const [species, setSpecies] = useState(null);
  const [evolutions, setEvolutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const name = pokemonName || useRouter().query.name;

  useEffect(() => {
    if (!name) return;
    const fetchData = async () => {
      try {
        // Fetch main Pokémon data
        const res = await fetch(
          `https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`
        );
        const data = await res.json();

        // Fetch species data for description, genus, egg groups, etc.
        const speciesRes = await fetch(data.species.url);
        const speciesData = await speciesRes.json();

        // Fetch evolution chain
        const evoRes = await fetch(speciesData.evolution_chain.url);
        const evoData = await evoRes.json();

        // Recursive parse of evolution names
        const parseChain = (chain) => {
          let names = [chain.species.name];
          if (chain.evolves_to.length) {
            chain.evolves_to.forEach((e) => {
              names = names.concat(parseChain(e));
            });
          }
          return names;
        };
        const evoNames = parseChain(evoData.chain);

        // Fetch details (images) for each evolution
        const evoDetails = await Promise.all(
          evoNames.map(async (evoName) => {
            try {
              const evoRes = await fetch(
                `https://pokeapi.co/api/v2/pokemon/${evoName}`
              );
              const evoData = await evoRes.json();
              const image =
                evoData.sprites.other.home?.front_default ||
                evoData.sprites.other['dream_world']?.front_default ||
                evoData.sprites.other['official-artwork']?.front_default ||
                evoData.sprites.front_default;
              return { name: evoName, image };
            } catch {
              return { name: evoName, image: null };
            }
          })
        );

        setPokemon(data);
        setSpecies(speciesData);
        setEvolutions(evoDetails);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [name]);

  if (loading) return <p>Loading...</p>;
  if (!pokemon || !species) return <p>Pokémon non trouvé.</p>;

  // Determine best available main image
  const mainImage =
    pokemon.sprites.other.home?.front_default ||
    pokemon.sprites.other['dream_world']?.front_default ||
    pokemon.sprites.other['official-artwork']?.front_default ||
    pokemon.sprites.front_default;

  // Get English description and genus
  const flavorEntry =
    species.flavor_text_entries.find((e) => e.language.name === 'en')?.flavor_text.replace(/\n|\f/g, ' ') || '';
  const genus = species.genera.find((g) => g.language.name === 'en')?.genus || '';

  return (
    <div className={styles.pokemonContainer}>
      <h1 className={styles["pokemon-name"]}>{pokemon.name}</h1>
      <p className={styles["pokemon-genus"]}><em>{genus}</em></p>
      <img
        src={mainImage}
        alt={pokemon.name}
        width={300}
        height={300}
        className={styles["pokemon-image"]}
      />

      <section className={styles["info-section"]}>
        <h2>Description</h2>
        <p>{flavorEntry}</p>
      </section>

      <section className={styles["info-section"]}>
        <h2>Types & Caractéristiques</h2>
        <p>Types: {pokemon.types.map((t) => t.type.name).join(', ')}</p>
        <p>Height: {pokemon.height / 10} m</p>
        <p>Weight: {pokemon.weight / 10} kg</p>
        <p>Base Exp: {pokemon.base_experience}</p>
        <ul className={styles.stats}>
          {pokemon.stats.map((s) => (
            <li key={s.stat.name}>{s.stat.name}: {s.base_stat}</li>
          ))}
        </ul>
      </section>

      <section className={styles["info-section"]}>
        <h2>Abilities</h2>
        <ul className={styles.abilities}>
          {pokemon.abilities.map((a) => (
            <li key={a.ability.name}>{a.ability.name}</li>
          ))}
        </ul>
      </section>

      <section className={styles["info-section"]}>
        <h2>Formes</h2>
        <ul className={styles.forms}>
          {pokemon.forms.map((f) => (
            <li key={f.name}>
              <Link href={`/pokemon/${f.name}`}>{f.name}</Link>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles["info-section"]}>
        <h2>Evolution Chain</h2>
        <ul className={styles.evolutions}>
          {evolutions.map((evo) => (
            <li key={evo.name}>
              <Link href={`/pokemon/${evo.name}`}>
                {evo.image && (
                  <img
                    src={evo.image}
                    alt={evo.name}
                    width={150}
                    height={150}
                    className={styles["evo-image"]}
                  />
                )}
                <p>{evo.name}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles["info-section"]}>
        <h2>Espèce & Reproduction</h2>
        <p>Habitat: {species.habitat?.name || 'Unknown'}</p>
        <p>Egg Groups: {species.egg_groups.map((e) => e.name).join(', ')}</p>
        <p>Capture Rate: {species.capture_rate}</p>
        <p>Growth Rate: {species.growth_rate.name}</p>
      </section>
    </div>
  );
}
export default PokemonInfo;
