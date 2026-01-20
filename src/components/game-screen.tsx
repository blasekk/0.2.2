"use client";

import React, { useState, useRef } from 'react';
import { useGame } from "@/contexts/game-context";
import { countries } from '@/lib/countries';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { GuessResultCard } from "@/components/guess-result-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, ArrowRight } from 'lucide-react';

export function GameScreen() {
  const { 
    guesses, 
    gameState, 
    submitGuess, 
    giveUp, 
    nextGame, 
    t, 
    language,
    setView,
    targetCountry
  } = useGame();
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      submitGuess(inputValue.trim());
      setInputValue('');
    }
  };

  const isGameOver = gameState === 'won' || gameState === 'given_up';

  return (
    <div className="flex flex-col h-full w-full max-w-3xl mx-auto p-4">
        <header className="grid grid-cols-3 items-center mb-4 flex-shrink-0">
            <div className="justify-self-start">
              <Button variant="ghost" onClick={() => setView('menu')}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t.backToMenu}
              </Button>
            </div>
            <h1 className="text-xl font-bold font-headline text-primary justify-self-center">{t.appName}</h1>
            <div className="justify-self-end text-lg font-semibold">
                {!isGameOver && guesses.length > 0 && (
                    <span className="text-muted-foreground animate-in fade-in">
                        {t.attempts}: {guesses.length}
                    </span>
                )}
            </div>
        </header>

        <Card className="mb-4 shadow-md flex-shrink-0 bg-card">
            <CardContent className="p-4">
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
                    <div className="w-full relative">
                        <Input
                            ref={inputRef}
                            type="text"
                            list="country-list"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={t.countryInputPlaceholder}
                            disabled={isGameOver}
                        />
                        <datalist id="country-list">
                            {countries.map((country) => (
                                <option key={country.id} value={country.name[language]} />
                            ))}
                        </datalist>
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" disabled={isGameOver || !inputValue.trim()} className="flex-1">
                            {t.guess}
                        </Button>
                         {!isGameOver && (
                             <Button type="button" variant="destructive" onClick={giveUp}>
                                 {t.giveUp}
                             </Button>
                         )}
                    </div>
                </form>
                {isGameOver && (
                    <div className="mt-4 text-center animate-in fade-in duration-500">
                        {gameState === 'won' && <p className="font-semibold text-primary">{t.congratsWithCount.replace('{count}', String(guesses.length))}</p>}
                        {gameState === 'given_up' && targetCountry && (
                            <p className="font-semibold text-destructive">{t.correctAnswerWas} {targetCountry.name[language]}.</p>
                        )}
                        <Button onClick={nextGame} className="mt-2">
                            {t.next}
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
        
        <ScrollArea className="flex-1 min-h-0">
            <div className="space-y-3 pr-4 pb-4">
              {guesses.length === 0 && !isGameOver && (
                <div className="text-center text-muted-foreground py-10">
                  <p>{t.guessTheCountry}</p>
                </div>
              )}
                {guesses.map((guess, index) => (
                    <GuessResultCard key={`${guess.guessedCountry.id}-${index}`} result={guess} />
                ))}
            </div>
        </ScrollArea>
    </div>
  );
}
