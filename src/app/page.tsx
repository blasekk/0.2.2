"use client";

import { useGame, GameProvider } from "@/contexts/game-context";
import { MainMenu } from "@/components/main-menu";
import { SettingsScreen } from "@/components/settings-screen";
import { GameScreen } from "@/components/game-screen";
import { ChallengeScreen } from "@/components/challenge-screen";

function WorldNavigatorApp() {
  const { view, setView } = useGame();

  const renderView = () => {
    switch (view) {
      case 'settings':
        return <SettingsScreen />;
      case 'game':
        return <GameScreen />;
      case 'challenge':
        return <ChallengeScreen />;
      case 'menu':
      default:
        return <MainMenu />;
    }
  };

  return (
    <main className="h-[100dvh] w-screen text-foreground overflow-hidden bg-background">
      {renderView()}
    </main>
  );
}


export default function Home() {
  return (
    <GameProvider>
      <WorldNavigatorApp />
    </GameProvider>
  );
}
