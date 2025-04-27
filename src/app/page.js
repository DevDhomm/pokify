import Image from "next/image";
import styles from "./page.module.css";
import PokemonInfo from "./pages/pokemon/pokemon";
export default function Home() {
  return (
    <div className={styles.page}>
        <PokemonInfo pokemonName="Houndour" />
    </div>
  );
}
