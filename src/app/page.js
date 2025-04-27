'use client'
import Image from "next/image";
import styles from "./page.module.css";
import PokemonInfo from "./pages/pokemon/pokemon";
import { useState,useEffect } from "react";
export default function Home() {
  const [name, setName] = useState("Charizard");
  const [name2, setName2] = useState(null);
  const handleSubmit = (e) => {
    e.preventDefault();
   
    
    setName(e.target[0].value);
  }

  return (
    <div className={styles.page}>
        <form action="" onSubmit={handleSubmit} className={styles.form}>
        <input type="text" className={styles.input} />
        <button type="submit" className={styles.button}>Search</button>
        </form>
        <PokemonInfo pokemonName={name} />
    </div>
  );
}
