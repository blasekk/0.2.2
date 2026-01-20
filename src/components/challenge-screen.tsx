"use client";

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { ChallengeProvider, useChallenge } from '@/contexts/challenge-context';
import { useGame } from '@/contexts/game-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Play, Pause, RotateCw, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Country } from '@/lib/countries';

const GameOverScreen: React.FC = () => {
  const { score, highScore, restartGame, t } = useChallenge();
  const { setView } = useGame();

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm animate-in fade-in">
      <Card className="w-full max-w-sm text-center p-6">
        <Trophy className="mx-auto h-16 w-16 text-primary mb-4" />
        <h2 className="text-3xl font-bold mb-2">{t.gameOver}</h2>
        <p className="text-muted-foreground mb-6">{t.yourFinalScoreIs.replace('{score}', String(score))}</p>
        <div className="flex justify-around mb-8 text-lg">
          <div>
            <div className="font-bold text-primary text-3xl">{score}</div>
            <div className="text-sm text-muted-foreground">{t.score}</div>
          </div>
          <div>
            <div className="font-bold text-3xl">{highScore}</div>
            <div className="text-sm text-muted-foreground">{t.highScore}</div>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <Button size="lg" onClick={restartGame}>
            <RotateCw className="mr-2" />
            {t.playAgain}
          </Button>
          <Button size="lg" variant="outline" onClick={() => setView('menu')}>
            <ArrowLeft className="mr-2" />
            {t.backToMenu}
          </Button>
        </div>
      </Card>
    </div>
  );
};


const ChallengeView: React.FC = () => {
  const { setView } = useGame();
  const {
    t,
    question,
    score,
    gameState,
    selectedAnswer,
    selectAnswer,
  } = useChallenge();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Stop and reset audio when question changes
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  }, [question]);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  if (!question) {
    return <div className="flex items-center justify-center h-full">{t.loading}...</div>;
  }

  const { type, options, correctAnswer, image, text, audio } = question;

  const getButtonClass = (option: Country) => {
    if (gameState !== 'answered') return '';
    if (option.id === correctAnswer.id) return 'bg-green-500 hover:bg-green-600 border-transparent text-primary-foreground';
    if (option.id === selectedAnswer?.id) return 'bg-destructive hover:bg-destructive/90 border-transparent text-destructive-foreground';
    return 'opacity-50';
  };

  return (
    <div className="relative flex flex-col h-full w-full max-w-3xl mx-auto p-4">
      {gameState === 'gameOver' && <GameOverScreen />}
      <header className="grid grid-cols-3 items-center mb-4 flex-shrink-0">
          <div className="justify-self-start">
            <Button variant="ghost" onClick={() => setView('menu')} disabled={gameState === 'answered'}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t.backToMenu}
            </Button>
          </div>
          <h1 className="text-xl font-bold font-headline text-primary justify-self-center">{t.worldChallenge}</h1>
          <div className="justify-self-end text-lg font-semibold">
              <span className="text-muted-foreground">
                  {t.score}: {score}
              </span>
          </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <p className="text-muted-foreground text-3xl mb-6 font-semibold">
          {type === 'flag' && t.flagQuestion}
          {type === 'capital' && t.capitalQuestion.replace('{capital}', text || '')}
          {type === 'audio' && t.anthemQuestion}
          {type === 'dish' && t.dishQuestion.replace('{dish}', text || '')}
        </p>
        <div className="h-48 w-full flex items-center justify-center mb-8">
            {type === 'flag' && image && (
                <Image
                    src={image}
                    alt={t.flag}
                    width={200}
                    height={120}
                    className="rounded-lg shadow-lg border-2 border-border object-contain max-h-full"
                />
            )}
            {type === 'audio' && audio && (
              <>
                <audio 
                  ref={audioRef} 
                  src={audio} 
                  className="hidden" 
                  preload="auto"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                />
                <Button
                    size="lg"
                    variant="outline"
                    onClick={toggleAudio}
                    className="h-24 w-24 rounded-full"
                >
                    {isPlaying ? <Pause className="h-12 w-12" /> : <Play className="h-12 w-12" />}
                </Button>
              </>
            )}
        </div>
      </div>
      
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4">
        {options.map((option) => (
          <Button
            key={option.id}
            variant="outline"
            className={cn(
              "h-20 text-lg transition-all duration-300 rounded-lg shadow-sm whitespace-normal p-4 flex items-center justify-center hover:scale-105 border-2 border-border hover:border-primary",
              getButtonClass(option)
            )}
            onClick={() => selectAnswer(option)}
            disabled={gameState === 'answered'}
          >
            {option.name[t.languageCode as 'en' | 'hu']}
          </Button>
        ))}
      </div>
    </div>
  );
};

export const ChallengeScreen: React.FC = () => {
    return (
        <ChallengeProvider>
            <ChallengeView />
        </ChallengeProvider>
    )
}
