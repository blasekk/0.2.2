"use client";

import { useGame } from "@/contexts/game-context";
import { Button } from "@/components/ui/button";
import { Gamepad2, Settings, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PatchNotesDialog } from "./patch-notes-dialog";

export function MainMenu() {
  const { setView, startGame, t, challengeQuestionTypes } = useGame();
  const { toast } = useToast();

  const startChallenge = () => {
    if (challengeQuestionTypes.length === 0) {
      toast({
        title: t.noChallengeCategorySelected,
        variant: "destructive",
      });
      return;
    }
    setView('challenge');
  };

  return (
    <div className="relative flex flex-col items-center justify-center h-full p-4 text-center">
      <h1 className="flex items-center justify-center gap-4 text-6xl md:text-8xl font-bold tracking-tight font-headline text-primary drop-shadow-lg mb-4">
        {t.appName}
        <span className="text-5xl md:text-7xl inline-block">🌍</span>
      </h1>
      <p className="text-lg text-muted-foreground mb-12 max-w-md">{t.guessTheCountry}</p>
      <div className="flex flex-col gap-6 w-full max-w-xs">
        <Button
          size="lg"
          onClick={startGame}
          className="w-full py-6 text-lg font-semibold"
        >
          <Gamepad2 className="mr-3 h-6 w-6" />
          {t.newGame}
        </Button>
        <Button
          size="lg"
          onClick={startChallenge}
          className="w-full py-6 text-lg font-semibold"
        >
          <Trophy className="mr-3 h-6 w-6" />
          {t.worldChallenge}
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={() => setView('settings')}
          className="w-full py-6 text-lg font-semibold"
        >
          <Settings className="mr-3 h-6 w-6" />
          {t.settings}
        </Button>
      </div>
      <div className="absolute bottom-4 right-4 flex items-center gap-2">
        <PatchNotesDialog />
        <div className="text-xs text-muted-foreground">
          v0.2.2
        </div>
      </div>
    </div>
  );
}
