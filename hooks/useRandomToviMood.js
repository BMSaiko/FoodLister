import { useEffect, useState } from "react";

const IDLE_MOODS = ["feliz", "piscar-o-olho", "apaixonada", "fixe", "a-celebrar"];

/** Emote de repouso do Tovi: "feliz" no SSR, aleatório a cada abertura ou refresh. */
export function useRandomToviMood() {
  const [mood, setMood] = useState("feliz");
  useEffect(() => {
    setMood(IDLE_MOODS[Math.floor(Math.random() * IDLE_MOODS.length)]);
  }, []);
  return mood;
}
