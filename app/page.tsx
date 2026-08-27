import { cookies } from "next/headers";

import { GalleriaApp } from "@/components/galleria-app";

export default async function Home() {
  const jar = await cookies();
  const unlocked = jar.get("galleria_gate")?.value === "open";

  return <GalleriaApp initiallyUnlocked={unlocked} />;
}
