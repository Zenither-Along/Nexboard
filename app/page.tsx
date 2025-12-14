"use client"

import InfiniteCanvas from "../components/canvas/InfiniteCanvas";
import { HomePage } from "@/components/home/HomePage";
import { Toolbar } from "@/components/ui/Toolbar";
import { useAppStore } from "@/store/useAppStore";

export default function Home() {
  const { activeView } = useAppStore();

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-background">
      {activeView === 'home' ? <HomePage /> : <InfiniteCanvas />}
      <Toolbar />
    </main>
  );
}
