"use client";
import { useEffect, useState } from "react";
import { buildCoffeeScene } from "@/lib/coffee-sounds";
import { POUR_END, REVEAL_AT } from "@/components/CoffeePour";

export default function SoundTest() {
  const [out, setOut] = useState("running");
  useEffect(() => {
    (async () => {
      const rate = 44100;
      const ctx = new OfflineAudioContext(1, rate * 7, rate);
      const landings = [0, 1, 2, 3].map((i) => 1.0 + i * 0.62 + 0.48);
      buildCoffeeScene(ctx, ctx.destination, { pourStart: 0.6, pourEnd: POUR_END, landings, chimeAt: REVEAL_AT + 0.15 }, 0);
      const buffer = await ctx.startRendering();
      const data = buffer.getChannelData(0);
      const win = Math.round(rate * 0.1);
      const rows = [];
      let peak = 0;
      for (let i = 0; i < data.length; i += win) {
        let sum = 0;
        for (let j = i; j < Math.min(i + win, data.length); j++) { sum += data[j] * data[j]; peak = Math.max(peak, Math.abs(data[j])); }
        rows.push(Math.sqrt(sum / win).toFixed(3));
      }
      const payload = JSON.stringify({ peak: peak.toFixed(3), landings, pourEnd: POUR_END, reveal: REVEAL_AT, rms100ms: rows });
      console.log("SOUNDTEST " + payload);
      setOut(payload);
    })().catch((e) => { console.log("SOUNDTEST ERROR " + e.message); setOut("ERROR " + e.message); });
  }, []);
  return <pre id="result">{out}</pre>;
}
