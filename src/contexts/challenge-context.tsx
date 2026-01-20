"use client";

import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { countries, type Country } from '@/lib/countries';
import { translations, type Language } from '@/lib/translations';
import { generateQuestion, type Question } from '@/lib/challenge-logic';
import { useGame } from './game-context';

type ChallengeGameState = 'playing' | 'answered' | 'gameOver';

const HIGH_SCORE_KEY = 'world_challenge_highscore';

interface ChallengeContextType {
  t: (typeof translations)[Language];
  question: Question | null;
  score: number;
  highScore: number;
  gameState: ChallengeGameState;
  selectedAnswer: Country | null;
  selectAnswer: (country: Country) => void;
  restartGame: () => void;
}

const ChallengeContext = createContext<ChallengeContextType | undefined>(undefined);

export const ChallengeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { language, challengeQuestionTypes } = useGame();
  const t = useMemo(() => ({...translations[language], languageCode: language}), [language]);

  const [question, setQuestion] = useState<Question | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameState, setGameState] = useState<ChallengeGameState>('playing');
  const [selectedAnswer, setSelectedAnswer] = useState<Country | null>(null);
  const [askedQuestionKeys, setAskedQuestionKeys] = useState<string[]>([]);
  
  useEffect(() => {
    const storedHighScore = localStorage.getItem(HIGH_SCORE_KEY);
    if (storedHighScore) {
      setHighScore(parseInt(storedHighScore, 10));
    }
    if (challengeQuestionTypes.length > 0) {
      const newQuestion = generateQuestion(countries, language, challengeQuestionTypes, []);
      setQuestion(newQuestion);
      setAskedQuestionKeys([`${newQuestion.correctAnswer.id}-${newQuestion.type}`]);
    }
  }, [language, challengeQuestionTypes]);

  const nextQuestion = useCallback(() => {
    setSelectedAnswer(null);
    setGameState('playing');
    if (challengeQuestionTypes.length > 0) {
        const newQuestion = generateQuestion(countries, language, challengeQuestionTypes, askedQuestionKeys);
        const newKey = `${newQuestion.correctAnswer.id}-${newQuestion.type}`;

        // If generateQuestion returns a key that's already been asked, it means the pool was reset.
        // So we should reset our list of keys as well.
        if (askedQuestionKeys.includes(newKey) && askedQuestionKeys.length > 0) {
            setAskedQuestionKeys([newKey]);
        } else {
            setAskedQuestionKeys(prev => [...prev, newKey]);
        }
        setQuestion(newQuestion);
    }
  }, [language, challengeQuestionTypes, askedQuestionKeys]);
  
  const selectAnswer = useCallback((country: Country) => {
    if (gameState !== 'playing') return;

    setSelectedAnswer(country);
    setGameState('answered');

    if (country.id === question?.correctAnswer.id) {
      const newScore = score + 1;
      setScore(newScore);
      setTimeout(() => {
        nextQuestion();
      }, 1500);
    } else {
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem(HIGH_SCORE_KEY, String(score));
      }
      setTimeout(() => {
        setGameState('gameOver');
      }, 1500);
    }
  }, [gameState, question, score, highScore, nextQuestion]);

  const restartGame = useCallback(() => {
    setScore(0);
    setSelectedAnswer(null);
    setGameState('playing');
     if (challengeQuestionTypes.length > 0) {
        const newQuestion = generateQuestion(countries, language, challengeQuestionTypes, []);
        setQuestion(newQuestion);
        setAskedQuestionKeys([`${newQuestion.correctAnswer.id}-${newQuestion.type}`]);
    }
  }, [language, challengeQuestionTypes]);


  const value = {
    t,
    question,
    score,
    highScore,
    gameState,
    selectedAnswer,
    selectAnswer,
    restartGame,
  };

  return <ChallengeContext.Provider value={value}>{children}</ChallengeContext.Provider>;
};

export const useChallenge = () => {
  const context = useContext(ChallengeContext);
  if (context === undefined) {
    throw new Error('useChallenge must be used within a ChallengeProvider');
  }
  return context;
};
