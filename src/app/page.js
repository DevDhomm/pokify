'use client'
import Image from "next/image";
import styles from "./page.module.css";
import PokemonInfo from "./pages/pokemon/pokemon";
import { useState, useEffect } from "react";

export default function Home() {
 
  const [name, setName] = useState("Charizard");

  useEffect(() => {
    const pokemon = localStorage.getItem("pokemon");
    if (pokemon) {
      setName(pokemon);
      console.log(pokemon);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setName(e.target[0].value);
    localStorage.setItem("pokemon", e.target[0].value);
  }

  // Nouvelle fonction pour changer de Pokémon depuis PokemonInfo
  const handleChangePokemon = (newName) => {
    setName(newName);
    localStorage.setItem("pokemon", newName);
  };

  return (
    <div className={styles.page}>
        <form action="" onSubmit={handleSubmit} className={styles.form}>
        <input type="text" className={styles.input} />
        <button type="submit" className={styles.button}>Search</button>
        </form>
        <PokemonInfo pokemonName={name} onChangePokemon={handleChangePokemon} />
    </div>
  );
}
