"use client";

import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { countries, type Country } from '@/lib/countries';
import { translations, type Language } from '@/lib/translations';
import { getRandomCountry, evaluateGuess, type GuessResult } from '@/lib/game-logic';
import { useToast } from '@/hooks/use-toast';
import type { QuestionType } from '@/lib/challenge-logic';

type View = 'menu' | 'settings' | 'game' | 'challenge';
type GameState = 'playing' | 'won' | 'given_up';

interface GameContextType {
  view: View;
  setView: (view: View) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (typeof translations)[Language];
  
  targetCountry: Country | null;
  guesses: GuessResult[];
  gameState: GameState;
  
  challengeQuestionTypes: QuestionType[];
  setChallengeQuestionTypes: (types: QuestionType[]) => void;

  startGame: () => void;
  submitGuess: (countryName: string) => void;
  giveUp: () => void;
  nextGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [view, setView] = useState<View>('menu');
  const [language, setLanguage] = useState<Language>('hu');
  const [targetCountry, setTargetCountry] = useState<Country | null>(null);
  const [guesses, setGuesses] = useState<GuessResult[]>([]);
  const [gameState, setGameState] = useState<GameState>('playing');
  const [challengeQuestionTypes, setChallengeQuestionTypes] = useState<QuestionType[]>(['flag', 'capital', 'audio', 'dish']);
  const { toast } = useToast();

  const t = useMemo(() => translations[language], [language]);

  const startNewGameRound = useCallback(() => {
    setGuesses([]);
    setGameState('playing');
    setTargetCountry(getRandomCountry(countries));
  }, []);

  useEffect(() => {
    // Select the first country on initial load
    if (!targetCountry) {
      startNewGameRound();
    }
  }, [targetCountry, startNewGameRound]);

  const startGame = useCallback(() => {
    startNewGameRound();
    setView('game');
  }, [startNewGameRound]);

  const nextGame = useCallback(() => {
    startNewGameRound();
  }, [startNewGameRound]);

  const submitGuess = useCallback((countryName: string) => {
    if (gameState !== 'playing' || !targetCountry) return;

    const guessedCountry = countries.find(c => c.name[language].toLowerCase() === countryName.toLowerCase());

    if (!guessedCountry) {
      return;
    }

    const result = evaluateGuess(guessedCountry, targetCountry);
    const newGuesses = [result, ...guesses];

    if (result.isCorrect) {
      setGameState('won');
      toast({
        title: t.youWon,
        description: t.congratsWithCount.replace('{count}', String(newGuesses.length)),
        className: 'border-green-500 bg-green-500/10 text-green-700 dark:text-green-400',
      });
    }
    
    setGuesses(newGuesses);

  }, [gameState, targetCountry, language, t, toast, guesses]);

  const giveUp = useCallback(() => {
    if (!targetCountry) return;
    setGameState('given_up');
    toast({
      title: t.youLost,
      description: `${t.correctAnswerWas} ${targetCountry.name[language]}.`,
      variant: 'destructive',
    });
  }, [targetCountry, language, t, toast]);

  const value = {
    view,
    setView,
    language,
    setLanguage,
    t,
    targetCountry,
    guesses,
    gameState,
    challengeQuestionTypes,
    setChallengeQuestionTypes,
    startGame,
    submitGuess,
    giveUp,
    nextGame,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
