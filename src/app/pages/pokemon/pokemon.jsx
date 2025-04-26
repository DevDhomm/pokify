// PokemonInfo.jsx
"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from './PokemonInfo.module.css';

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
        const res = await fetch(
          `https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`
        );
        const data = await res.json();
        const speciesRes = await fetch(data.species.url);
        const speciesData = await speciesRes.json();
        const evoRes = await fetch(speciesData.evolution_chain.url);
        const evoData = await evoRes.json();

        const parseChain = (chain) => {
          let names = [chain.species.name];
          chain.evolves_to.forEach((e) => {
            names = names.concat(parseChain(e));
          });
          return names;
        };
        const evoNames = parseChain(evoData.chain);

        const evoDetails = await Promise.all(
          evoNames.map(async (evoName) => {
            try {
              const evoRes = await fetch(
                `https://pokeapi.co/api/v2/pokemon/${evoName}`
              );
              const evoData = await evoRes.json();
              // Prioritize home artwork, then dream_world, then official-artwork, then default
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

  if (loading) return <p className={styles.loading}>Loading...</p>;
  if (!pokemon || !species) return <p className={styles.error}>Pokémon non trouvé.</p>;

  // Determine best available main image: home > dream_world > official-artwork > default
  const mainImage =
    pokemon.sprites.other.home?.front_default ||
    pokemon.sprites.other['dream_world']?.front_default ||
    pokemon.sprites.other['official-artwork']?.front_default ||
    pokemon.sprites.front_default;

  const flavorEntry =
    species.flavor_text_entries.find((e) => e.language.name === 'en')?.flavor_text.replace(/\n|\f/g, ' ') || '';
  const genus = species.genera.find((g) => g.language.name === 'en')?.genus || '';

  // Map stats to CSS module classes
  const statClasses = {
    hp: styles.statHp,
    attack: styles.statAttack,
    defense: styles.statDefense,
    'special-attack': styles.statSpecialAttack,
    'special-defense': styles.statSpecialDefense,
    speed: styles.statSpeed,
  };

  return (
    <div className={styles.pokemonContainer}>
        <div className={styles.box}>
            <div className={styles.box1}>
            <h1 className={styles.pokemonName}>{pokemon.name}</h1>
      <p className={styles.pokemonGenus}><em>{genus}</em></p>
      <img
        className={styles.pokemonImage}
        src={mainImage}
        alt={pokemon.name}
      />

            </div>

            <div className={styles.box2}>
            <section className={styles.infoSection}>
        <h2>Stats</h2>
        <div className={styles.statsContainer}>
          {pokemon.stats.map((s) => (
            <div key={s.stat.name} className={`${styles.statBox} ${statClasses[s.stat.name] || ''}`}>
              <p className={styles.statName}>{s.stat.name}</p>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${s.base_stat}%` }}
                >
                  <span className={styles.progressValue}>{s.base_stat}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
            </div>
        </div>

      <section className={styles.infoSection}>
        <h2>Description</h2>
        <p>{flavorEntry}</p>
      </section>

      
        

      <section className={styles["info-section"]}>
        <h2>Types & Caractéristiques</h2>
        <p>Types: {pokemon.types.map((t) => t.type.name).join(', ')}</p>
        <p>Height: {pokemon.height / 10} m</p>
        <p>Weight: {pokemon.weight / 10} kg</p>
        <p>Base Exp: {pokemon.base_experience}</p>

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
