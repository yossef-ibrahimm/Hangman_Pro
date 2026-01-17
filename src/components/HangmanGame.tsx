import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Trophy, RotateCcw, Lightbulb, Sun, Moon, Volume2, VolumeX, Clock, Target, Zap, Award, TrendingUp, Brain, Star, Sparkles, Crown, Languages } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { WORD_DATABASE, KEYBOARD_ROWS, Difficulty, WordData } from '@/data/wordDatabase';
import "./HangmanGame.css";
// ============================================
// TYPES & INTERFACES
// ============================================
interface GameState {
  word: string;
  wordData: WordData;
  difficulty: Difficulty;
  guessedLetters: Set<string>;
  wrongGuesses: number;
  maxWrongGuesses: number;
  isGameOver: boolean;
  isWinner: boolean;
  score: number;
  hintsUsed: number;
  startTime: number;
  endTime: number | null;
  streak: number;
  multiplier: number;
}

interface Achievement {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: React.ReactNode;
  unlocked: boolean;
}

type Screen = 'home' | 'game' | 'leaderboard' | 'achievements';

// ============================================
// UTILITY FUNCTIONS
// ============================================
const calculateScore = (
  baseScore: number,
  difficulty: Difficulty,
  timeElapsed: number,
  hintsUsed: number,
  wrongGuesses: number
): number => {
  const difficultyMultiplier = { easy: 1, medium: 1.5, hard: 2, expert: 3 }[difficulty];
  const timeBonus = Math.max(0, 500 - timeElapsed * 2);
  const hintPenalty = hintsUsed * 200;
  const wrongPenalty = wrongGuesses * 100;
  return Math.round((baseScore + timeBonus - hintPenalty - wrongPenalty) * difficultyMultiplier);
};

const formatTime = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const getAccuracy = (correct: number, total: number): number => {
  if (total === 0) return 100;
  return Math.round((correct / total) * 100);
};

// ============================================
// CUSTOM HOOKS
// ============================================
const useHangman = (difficulty: Difficulty) => {
  const [gameState, setGameState] = useState<GameState>(() => initializeGame(difficulty));
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);

  function initializeGame(diff: Difficulty): GameState {
    const words = WORD_DATABASE[diff];
    const randomWordData = words[Math.floor(Math.random() * words.length)];

    return {
      word: randomWordData.word,
      wordData: randomWordData,
      difficulty: diff,
      guessedLetters: new Set(),
      wrongGuesses: 0,
      maxWrongGuesses: 6,
      isGameOver: false,
      isWinner: false,
      score: 1000,
      hintsUsed: 0,
      startTime: Date.now(),
      endTime: null,
      streak: 0,
      multiplier: 1,
    };
  }

  const playSound = useCallback((type: 'correct' | 'wrong' | 'win' | 'lose') => {
    if (!soundEnabled) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      const frequencies = { correct: 523.25, wrong: 329.63, win: 659.25, lose: 246.94 };
      oscillator.frequency.value = frequencies[type];
      oscillator.type = type === 'win' ? 'sine' : 'square';

      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
    } catch (e) {
      // Audio not supported
    }
  }, [soundEnabled]);

  const createParticles = useCallback((x: number, y: number) => {
    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      x,
      y,
    }));
    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 1000);
  }, []);

  const guessLetter = useCallback((letter: string, event?: React.MouseEvent) => {
    if (gameState.isGameOver || gameState.guessedLetters.has(letter)) return;

    if (event) {
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      createParticles(rect.left + rect.width / 2, rect.top);
    }

    setGameState(prev => {
      const newGuessed = new Set(prev.guessedLetters).add(letter);
      const isCorrect = prev.word.includes(letter);
      const newWrong = isCorrect ? prev.wrongGuesses : prev.wrongGuesses + 1;

      const baseChange = isCorrect ? 0 : -50;
      const newScore = Math.max(0, prev.score + baseChange * prev.multiplier);
      const newMultiplier = isCorrect ? Math.min(prev.multiplier + 0.1, 3) : 1;

      const wordLetters = new Set(prev.word.split(''));
      const isWinner = [...wordLetters].every(l => newGuessed.has(l));
      const isGameOver = newWrong >= prev.maxWrongGuesses || isWinner;

      playSound(isCorrect ? 'correct' : 'wrong');

      if (isGameOver) {
        const endTime = Date.now();
        const timeElapsed = (endTime - prev.startTime) / 1000;
        const finalScore = calculateScore(newScore, prev.difficulty, timeElapsed, prev.hintsUsed, newWrong);
        playSound(isWinner ? 'win' : 'lose');

        return {
          ...prev,
          guessedLetters: newGuessed,
          wrongGuesses: newWrong,
          score: finalScore,
          isGameOver,
          isWinner,
          endTime,
          multiplier: newMultiplier,
        };
      }

      return {
        ...prev,
        guessedLetters: newGuessed,
        wrongGuesses: newWrong,
        score: newScore,
        multiplier: newMultiplier,
      };
    });
  }, [gameState.isGameOver, gameState.guessedLetters, playSound, createParticles]);

  const resetGame = useCallback(() => {
    setGameState(initializeGame(difficulty));
    setShowHint(false);
  }, [difficulty]);

  const useHintSystem = useCallback(() => {
    if (gameState.hintsUsed >= 2) return;

    const unguessedLetters = gameState.word.split('')
      .filter(l => !gameState.guessedLetters.has(l));

    if (unguessedLetters.length > 0) {
      const randomLetter = unguessedLetters[Math.floor(Math.random() * unguessedLetters.length)];

      setGameState(prev => ({
        ...prev,
        guessedLetters: new Set(prev.guessedLetters).add(randomLetter),
        hintsUsed: prev.hintsUsed + 1,
        score: Math.max(0, prev.score - 200),
        multiplier: 1,
      }));

      playSound('correct');
      setShowHint(false);
    }
  }, [gameState, playSound]);

  const toggleHintModal = useCallback(() => setShowHint(prev => !prev), []);

  return {
    gameState,
    guessLetter,
    resetGame,
    useHintSystem,
    soundEnabled,
    setSoundEnabled,
    showHint,
    toggleHintModal,
    particles,
  };
};

const useGameTimer = (startTime: number, isGameOver: boolean) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (isGameOver) return;
    const interval = setInterval(() => setElapsed(Date.now() - startTime), 100);
    return () => clearInterval(interval);
  }, [startTime, isGameOver]);

  return elapsed;
};

const useKeyboardInput = (onKeyPress: (letter: string) => void, enabled: boolean) => {
  useEffect(() => {
    if (!enabled) return;
    const handleKeyPress = (e: KeyboardEvent) => {
      const letter = e.key.toUpperCase();
      if (/^[A-Z]$/.test(letter)) onKeyPress(letter);
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onKeyPress, enabled]);
};

// ============================================
// COMPONENTS
// ============================================
const Particles: React.FC<{ particles: Array<{ id: number; x: number; y: number }> }> = ({ particles }) => (
  <div className="fixed inset-0 pointer-events-none z-50">
    {particles.map(p => (
      <div
        key={p.id}
        className="absolute w-2 h-2 bg-primary rounded-full animate-particle-float"
        style={{ left: p.x, top: p.y }}
      />
    ))}
  </div>
);

const HangmanDrawing: React.FC<{ wrongGuesses: number }> = ({ wrongGuesses }) => {
  const { theme } = useTheme();
  const strokeColor = theme === 'dark' ? '#e5e7eb' : '#374151';
  const errorColor = 'hsl(var(--destructive))';

  return (
    <div className="relative w-64 h-64 mx-auto mb-6">
      <svg viewBox="0 0 200 250" className="w-full h-full drop-shadow-xl">
        <line x1="10" y1="230" x2="190" y2="230" stroke={strokeColor} strokeWidth="6" strokeLinecap="round" />
        <line x1="50" y1="230" x2="50" y2="20" stroke={strokeColor} strokeWidth="6" strokeLinecap="round" />
        <line x1="50" y1="20" x2="140" y2="20" stroke={strokeColor} strokeWidth="6" strokeLinecap="round" />
        <line x1="140" y1="20" x2="140" y2="50" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" />
        <line x1="50" y1="50" x2="80" y2="20" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" />

        {wrongGuesses >= 1 && (
          <g className="animate-drop-in">
            <circle cx="140" cy="70" r="20" stroke={errorColor} strokeWidth="5" fill="none" />
            <circle cx="133" cy="66" r="2" fill={errorColor} />
            <circle cx="147" cy="66" r="2" fill={errorColor} />
            <path d="M 133 78 Q 140 82 147 78" stroke={errorColor} strokeWidth="2" fill="none" strokeLinecap="round" />
          </g>
        )}
        {wrongGuesses >= 2 && <line x1="140" y1="90" x2="140" y2="150" stroke={errorColor} strokeWidth="5" strokeLinecap="round" className="animate-drop-in" />}
        {wrongGuesses >= 3 && <line x1="140" y1="110" x2="110" y2="130" stroke={errorColor} strokeWidth="5" strokeLinecap="round" className="animate-swing-in" />}
        {wrongGuesses >= 4 && <line x1="140" y1="110" x2="170" y2="130" stroke={errorColor} strokeWidth="5" strokeLinecap="round" className="animate-swing-in" />}
        {wrongGuesses >= 5 && <line x1="140" y1="150" x2="115" y2="190" stroke={errorColor} strokeWidth="5" strokeLinecap="round" className="animate-drop-in" />}
        {wrongGuesses >= 6 && <line x1="140" y1="150" x2="165" y2="190" stroke={errorColor} strokeWidth="5" strokeLinecap="round" className="animate-drop-in" />}
      </svg>
    </div>
  );
};

const WordDisplay: React.FC<{ word: string; guessedLetters: Set<string>; isGameOver: boolean }> = ({ word, guessedLetters, isGameOver }) => (
  <div className="flex gap-2 sm:gap-3 justify-center flex-wrap mb-8 px-4 dir">
    {word.split('').map((letter, idx) => {
      const isRevealed = guessedLetters.has(letter) || isGameOver;
      return (
        <div key={idx} className="relative w-10 h-14 sm:w-14 sm:h-20 perspective-1000">
          <div className={`w-full h-full transition-all duration-500 transform-style-3d ${isRevealed ? 'rotate-y-180' : ''}`}>
            <div className="absolute inset-0 backface-hidden">
              <div className="w-full h-full border-b-4 border-primary bg-secondary rounded-t-lg" />
            </div>
            <div className="absolute inset-0 backface-hidden rotate-y-180">
              <div className="w-full h-full border-b-4 border-success bg-success/10 rounded-t-lg flex items-center justify-center">
                <span className="text-2xl sm:text-4xl font-bold text-success">{letter}</span>
              </div>
            </div>
          </div>
        </div>
      );
    })}
  </div>
);

const Keyboard: React.FC<{
  guessedLetters: Set<string>;
  word: string;
  onLetterClick: (letter: string, event?: React.MouseEvent) => void;
  disabled: boolean;
}> = ({ guessedLetters, word, onLetterClick, disabled }) => {
  const getButtonState = (letter: string) => {
    if (!guessedLetters.has(letter)) return 'default';
    return word.includes(letter) ? 'correct' : 'wrong';
  };

  return (
    <div className="space-y-2 max-w-2xl mx-auto">
      {KEYBOARD_ROWS.map((row, rowIdx) => (
        <div key={rowIdx} className="flex gap-1 sm:gap-2 justify-center">
          {row.map(letter => {
            const state = getButtonState(letter);
            return (
              <button
                key={letter}
                onClick={(e) => onLetterClick(letter, e)}
                disabled={disabled || guessedLetters.has(letter)}
                className={`keyboard-key ${
                  state === 'default' ? 'keyboard-key-default' :
                  state === 'correct' ? 'keyboard-key-correct' : 'keyboard-key-wrong'
                } disabled:cursor-not-allowed`}
              >
                {letter}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};

const StatsPanel: React.FC<{
  score: number; wrongGuesses: number; maxWrong: number; hintsUsed: number;
  category: string; elapsed: number; multiplier: number;
}> = ({ score, wrongGuesses, maxWrong, hintsUsed, category, elapsed, multiplier }) => {
  const { t } = useLanguage();

  const stats = [
    { label: t('score'), value: score.toLocaleString(), icon: <Trophy size={18} />, color: 'from-warning to-orange-500' },
    { label: t('lives'), value: `${maxWrong - wrongGuesses}/${maxWrong}`, icon: <Target size={18} />, color: wrongGuesses > 3 ? 'from-destructive to-red-600' : 'from-success to-emerald-600' },
    { label: t('hints'), value: `${2 - hintsUsed}/2`, icon: <Lightbulb size={18} />, color: 'from-primary to-purple-600' },
    { label: t('time'), value: formatTime(elapsed), icon: <Clock size={18} />, color: 'from-blue-500 to-blue-600' },
  ];

  return (
    <div className="mb-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-4">
        {stats.map((stat, idx) => (
          <div key={idx} className={`stat-card bg-gradient-to-br ${stat.color} text-white`}>
            <div className="flex items-center gap-2 mb-1 opacity-90">
              {stat.icon}
              <span className="text-xs font-semibold">{stat.label}</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 sm:gap-3">
        <div className="flex-1 stat-card bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
          <div className="flex items-center gap-2 opacity-90">
            <Zap size={16} />
            <span className="text-xs font-semibold">{t('multiplier')}</span>
          </div>
          <div className="text-lg sm:text-xl font-bold">{multiplier.toFixed(1)}x</div>
        </div>
        <div className="flex-1 stat-card bg-gradient-to-br from-accent to-pink-600 text-white">
          <div className="flex items-center gap-2 opacity-90">
            <Brain size={16} />
            <span className="text-xs font-semibold">{t('category')}</span>
          </div>
          <div className="text-sm font-bold truncate">{category}</div>
        </div>
      </div>
    </div>
  );
};

const HintModal: React.FC<{
  isOpen: boolean; onClose: () => void; onUseHint: () => void;
  wordData: WordData; hintsRemaining: number;
}> = ({ isOpen, onClose, onUseHint, wordData, hintsRemaining }) => {
  const { t, language } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="glass-card rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slide-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-warning to-orange-500 rounded-full flex items-center justify-center">
            <Lightbulb className="text-white" size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground">{t('needHint')}</h3>
            <p className="text-sm text-muted-foreground">{hintsRemaining} {t('hintsRemaining')}</p>
          </div>
        </div>

        <div className="bg-secondary rounded-xl p-4 mb-4">
          <p className="text-sm font-semibold text-muted-foreground mb-2">💡 {t('clue')}:</p>
          <p className="text-foreground font-medium">{wordData.hint[language]}</p>

          {wordData.funFact && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs font-semibold text-muted-foreground mb-1">🎯 {t('funFact')}:</p>
              <p className="text-xs text-muted-foreground">{wordData.funFact[language]}</p>
            </div>
          )}
        </div>

        <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 mb-4">
          <p className="text-sm text-warning">⚠️ {t('hintWarning')}</p>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-3 btn-glass text-foreground">
            {t('cancel')}
          </button>
          <button
            onClick={() => { onUseHint(); onClose(); }}
            disabled={hintsRemaining === 0}
            className="flex-1 px-4 py-3 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('useHint')}
          </button>
        </div>
      </div>
    </div>
  );
};

const GameOverModal: React.FC<{
  isOpen: boolean; isWinner: boolean; word: string; score: number;
  timeElapsed: number; accuracy: number; onPlayAgain: () => void; onHome: () => void;
}> = ({ isOpen, isWinner, word, score, timeElapsed, accuracy, onPlayAgain, onHome }) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <>
      {isWinner && (
        <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{ left: `${Math.random() * 100}%`, top: '-10%', animationDelay: `${Math.random() * 2}s`, fontSize: '24px' }}
            >
              {['🎉', '✨', '🎊', '⭐', '🌟'][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>
      )}

      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in p-4">
        <div className={`glass-card rounded-3xl shadow-2xl max-w-lg w-full p-8 ${isWinner ? 'animate-celebrate' : 'animate-shake'}`}>
          <div className="text-center mb-6">
            <div className="text-7xl mb-4 animate-float">{isWinner ? '🎉' : '😢'}</div>
            <h2 className={`text-4xl font-bold mb-2 ${isWinner ? 'text-success' : 'text-destructive'}`}>
              {isWinner ? t('victory') : t('gameOver')}
            </h2>
            <p className="text-muted-foreground">{isWinner ? t('outstandingPerformance') : t('betterLuck')}</p>
          </div>

          <div className="bg-secondary rounded-2xl p-6 mb-6">
            <p className="text-sm font-semibold text-muted-foreground mb-2 text-center">{t('theWordWas')}</p>
            <p className="text-3xl font-bold text-center text-primary tracking-wider">{word}</p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="stat-card bg-gradient-to-br from-warning to-orange-500 text-white text-center">
              <Trophy className="mx-auto mb-2" size={24} />
              <div className="text-2xl font-bold">{score}</div>
              <div className="text-xs opacity-90">{t('score')}</div>
            </div>
            <div className="stat-card bg-gradient-to-br from-blue-500 to-blue-600 text-white text-center">
              <Clock className="mx-auto mb-2" size={24} />
              <div className="text-2xl font-bold">{formatTime(timeElapsed)}</div>
              <div className="text-xs opacity-90">{t('time')}</div>
            </div>
            <div className="stat-card bg-gradient-to-br from-success to-emerald-600 text-white text-center">
              <Target className="mx-auto mb-2" size={24} />
              <div className="text-2xl font-bold">{accuracy}%</div>
              <div className="text-xs opacity-90">{t('accuracy')}</div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={onPlayAgain} className="flex-1 btn-primary py-4 text-lg flex items-center justify-center gap-2">
              <RotateCcw size={20} />
              {t('playAgain')}
            </button>
            <button onClick={onHome} className="px-6 py-4 btn-glass text-foreground">{t('home')}</button>
          </div>
        </div>
      </div>
    </>
  );
};

// ============================================
// MAIN GAME COMPONENT
// ============================================
const HangmanGame: React.FC = () => {
  const { t, language, setLanguage, dir } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [screen, setScreen] = useState<Screen>('home');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [playerName, setPlayerName] = useState(() => localStorage.getItem('playerName') || '');

  const {
    gameState, guessLetter, resetGame, useHintSystem,
    soundEnabled, setSoundEnabled, showHint, toggleHintModal, particles,
  } = useHangman(difficulty);

  const elapsed = useGameTimer(gameState.startTime, gameState.isGameOver);
  useKeyboardInput((letter) => guessLetter(letter), screen === 'game' && !gameState.isGameOver);

  const accuracy = useMemo(() => {
    const total = gameState.guessedLetters.size;
    const correct = [...gameState.guessedLetters].filter(l => gameState.word.includes(l)).length;
    return getAccuracy(correct, total);
  }, [gameState.guessedLetters, gameState.word]);

  useEffect(() => {
    if (playerName) localStorage.setItem('playerName', playerName);
  }, [playerName]);

  const handleStartGame = () => {
    resetGame();
    setScreen('game');
  };

  // ============ HOME SCREEN ============
  if (screen === 'home') {
    const difficultyOptions: { level: Difficulty; emoji: string; gradient: string }[] = [
      { level: 'easy', emoji: '😊', gradient: 'from-easy to-emerald-500' },
      { level: 'medium', emoji: '🎯', gradient: 'from-medium to-blue-500' },
      { level: 'hard', emoji: '🔥', gradient: 'from-hard to-red-500' },
      { level: 'expert', emoji: '💀', gradient: 'from-expert to-pink-600' },
    ];

    return (
      <div dir={dir} className="min-h-screen gradient-bg">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <div className="max-w-3xl mx-auto">
            {/* Header Controls */}
            <div className="flex justify-end gap-2 mb-8">
              <button onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')} className="p-3 btn-glass flex items-center gap-2 text-foreground">
                <Languages size={20} />
                <span className="text-sm font-medium">{language === 'en' ? 'عربي' : 'EN'}</span>
              </button>
              <button onClick={toggleTheme} className="p-3 btn-glass text-foreground">
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>

            {/* Hero */}
            <div className="text-center mb-10">
              <div className="inline-block mb-6 animate-float">
                <Crown className="mx-auto text-warning" size={64} />
              </div>
              <h1 className="text-5xl sm:text-7xl font-black mb-4 gradient-text">{t('appTitle')}</h1>
              <p className="text-lg sm:text-xl text-muted-foreground mb-8">{t('appSubtitle')}</p>

              <div className="max-w-md mx-auto mb-8">
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder={t('enterName')}
                  className="w-full px-6 py-4 glass-card rounded-2xl text-center text-xl font-semibold text-foreground focus:outline-none focus:ring-4 focus:ring-primary/50 transition-all"
                />
              </div>
            </div>

            {/* Difficulty Selection */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-foreground flex items-center justify-center gap-3">
                <Target className="text-primary" />
                {t('selectDifficulty')}
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8">
                {difficultyOptions.map(({ level, emoji, gradient }) => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`p-4 sm:p-6 rounded-2xl font-bold text-base sm:text-lg transition-all transform ${
                      difficulty === level
                        ? `bg-gradient-to-br ${gradient} text-white scale-105 shadow-2xl`
                        : 'bg-secondary text-secondary-foreground hover:scale-105 shadow-lg'
                    }`}
                  >
                    <div className="text-3xl sm:text-4xl mb-2">{emoji}</div>
                    <div>{t(level)}</div>
                  </button>
                ))}
              </div>

              <button onClick={handleStartGame} className="w-full btn-primary py-4 sm:py-5 text-xl sm:text-2xl flex items-center justify-center gap-3">
                <Sparkles size={28} />
                {t('startAdventure')}
                <Sparkles size={28} />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              <button onClick={() => setScreen('leaderboard')} className="flex flex-col items-center gap-3 p-5 sm:p-6 glass-card rounded-2xl hover:scale-105 transition-all">
                <Trophy className="text-warning" size={32} />
                <span className="font-bold text-foreground">{t('leaderboard')}</span>
              </button>
              <button onClick={() => setScreen('achievements')} className="flex flex-col items-center gap-3 p-5 sm:p-6 glass-card rounded-2xl hover:scale-105 transition-all">
                <Award className="text-primary" size={32} />
                <span className="font-bold text-foreground">{t('achievements')}</span>
              </button>
              <button onClick={() => setSoundEnabled(!soundEnabled)} className="flex flex-col items-center gap-3 p-5 sm:p-6 glass-card rounded-2xl hover:scale-105 transition-all col-span-2 sm:col-span-1">
                {soundEnabled ? <Volume2 className="text-success" size={32} /> : <VolumeX className="text-muted-foreground" size={32} />}
                <span className="font-bold text-foreground">{soundEnabled ? 'Sound On' : 'Sound Off'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============ LEADERBOARD ============
  if (screen === 'leaderboard') {
    const mockLeaderboard = [
      { id: '1', name: 'Ahmed Ali', score: 2450, time: 42000, difficulty: 'expert', accuracy: 95 },
      { id: '2', name: 'Sara Mohamed', score: 2100, time: 38000, difficulty: 'hard', accuracy: 92 },
      { id: '3', name: 'Omar Hassan', score: 1850, time: 45000, difficulty: 'hard', accuracy: 88 },
      { id: '4', name: 'Fatima Khalid', score: 1600, time: 52000, difficulty: 'medium', accuracy: 85 },
      { id: '5', name: 'Youssef Ibrahim', score: 1420, time: 48000, difficulty: 'medium', accuracy: 82 },
    ];

    return (
      <div dir={dir} className="min-h-screen gradient-bg">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <div className="max-w-4xl mx-auto">
            <button onClick={() => setScreen('home')} className="mb-6 px-6 py-3 btn-glass text-foreground font-semibold">
              {t('backToHome')}
            </button>

            <div className="glass-card rounded-3xl p-6 sm:p-8">
              <div className="text-center mb-8">
                <Trophy className="mx-auto text-warning animate-float mb-4" size={64} />
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">{t('globalLeaderboard')}</h2>
                <p className="text-muted-foreground">{t('topPlayers')}</p>
              </div>

              <div className="space-y-3">
                {mockLeaderboard.map((entry, idx) => {
                  const medals = ['🥇', '🥈', '🥉'];
                  const gradients = ['from-warning to-yellow-600', 'from-gray-300 to-gray-500', 'from-orange-400 to-orange-600'];

                  return (
                    <div
                      key={entry.id}
                      className={`flex items-center gap-4 p-4 sm:p-5 rounded-2xl transition-all hover:scale-[1.02] ${
                        idx < 3 ? `bg-gradient-to-r ${gradients[idx]} text-white shadow-xl` : 'bg-secondary shadow-lg'
                      }`}
                    >
                      <div className="text-3xl sm:text-4xl font-bold w-12 sm:w-16 text-center">
                        {idx < 3 ? medals[idx] : `#${idx + 1}`}
                      </div>
                      <div className="flex-1">
                        <div className={`font-bold text-lg ${idx >= 3 ? 'text-foreground' : ''}`}>{entry.name}</div>
                        <div className={`text-sm ${idx >= 3 ? 'text-muted-foreground' : 'opacity-90'}`}>
                          {entry.difficulty} • {entry.accuracy}% {t('accuracy')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold text-xl ${idx >= 3 ? 'text-primary' : ''}`}>{entry.score.toLocaleString()}</div>
                        <div className={`text-sm ${idx >= 3 ? 'text-muted-foreground' : 'opacity-90'}`}>{formatTime(entry.time)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============ ACHIEVEMENTS ============
  if (screen === 'achievements') {
    const achievements: Achievement[] = [
      { id: '1', titleKey: 'firstVictory', descriptionKey: 'firstVictoryDesc', icon: <Star />, unlocked: true },
      { id: '2', titleKey: 'speedDemon', descriptionKey: 'speedDemonDesc', icon: <Zap />, unlocked: false },
      { id: '3', titleKey: 'perfectGame', descriptionKey: 'perfectGameDesc', icon: <Target />, unlocked: false },
      { id: '4', titleKey: 'expertMaster', descriptionKey: 'expertMasterDesc', icon: <Crown />, unlocked: false },
      { id: '5', titleKey: 'noHintsNeeded', descriptionKey: 'noHintsNeededDesc', icon: <Brain />, unlocked: true },
      { id: '6', titleKey: 'streakKing', descriptionKey: 'streakKingDesc', icon: <TrendingUp />, unlocked: false },
    ];

    const unlockedCount = achievements.filter(a => a.unlocked).length;

    return (
      <div dir={dir} className="min-h-screen gradient-bg">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <div className="max-w-4xl mx-auto">
            <button onClick={() => setScreen('home')} className="mb-6 px-6 py-3 btn-glass text-foreground font-semibold">
              {t('backToHome')}
            </button>

            <div className="glass-card rounded-3xl p-6 sm:p-8">
              <div className="text-center mb-8">
                <Award className="mx-auto text-primary mb-4" size={64} />
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">{t('achievements')}</h2>
                <p className="text-muted-foreground">{unlockedCount} {t('of')} {achievements.length} {t('unlocked')}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map(achievement => (
                  <div
                    key={achievement.id}
                    className={`p-5 sm:p-6 rounded-2xl transition-all ${
                      achievement.unlocked
                        ? 'bg-gradient-to-br from-primary to-accent text-white shadow-xl'
                        : 'bg-secondary opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center ${
                        achievement.unlocked ? 'bg-white/20' : 'bg-muted'
                      }`}>
                        <div className={achievement.unlocked ? 'text-white' : 'text-muted-foreground'}>
                          {React.cloneElement(achievement.icon as React.ReactElement, { size: 28 })}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-bold text-lg mb-1 ${achievement.unlocked ? 'text-white' : 'text-foreground'}`}>
                          {t(achievement.titleKey)}
                        </h3>
                        <p className={`text-sm ${achievement.unlocked ? 'text-white/80' : 'text-muted-foreground'}`}>
                          {t(achievement.descriptionKey)}
                        </p>
                      </div>
                      {achievement.unlocked && <div className="text-2xl">✓</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============ GAME SCREEN ============
  return (
    <div dir={dir} className="min-h-screen gradient-bg">
      <Particles particles={particles} />

      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => setScreen('home')} className="px-4 sm:px-6 py-2 sm:py-3 btn-glass text-foreground font-semibold">
            {t('home')}
          </button>

          <div className="flex gap-2">
            <button onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')} className="p-2 sm:p-3 btn-glass text-foreground">
              <Languages size={20} />
            </button>
            <button onClick={toggleTheme} className="p-2 sm:p-3 btn-glass text-foreground">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-2 sm:p-3 btn-glass text-foreground">
              {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
            <button onClick={resetGame} className="p-2 sm:p-3 btn-glass text-foreground">
              <RotateCcw size={20} />
            </button>
          </div>
        </div>

        {/* Main Game */}
        <div className="max-w-5xl mx-auto">
          <StatsPanel
            score={gameState.score}
            wrongGuesses={gameState.wrongGuesses}
            maxWrong={gameState.maxWrongGuesses}
            hintsUsed={gameState.hintsUsed}
            category={gameState.wordData.category[language]}
            elapsed={elapsed}
            multiplier={gameState.multiplier}
          />

          <div className="glass-card rounded-3xl p-6 sm:p-8 mb-6">
            <HangmanDrawing wrongGuesses={gameState.wrongGuesses} />
            <WordDisplay
              word={gameState.word}
              guessedLetters={gameState.guessedLetters}
              isGameOver={gameState.isGameOver}
            />

            {!gameState.isGameOver && (
              <div className="flex justify-center mb-8">
                <button
                  onClick={toggleHintModal}
                  disabled={gameState.hintsUsed >= 2}
                  className="flex items-center gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-warning to-orange-500 text-white rounded-2xl font-bold text-base sm:text-lg hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                >
                  <Lightbulb size={24} />
                  {t('getHint')} ({2 - gameState.hintsUsed} {t('remaining')})
                </button>
              </div>
            )}

            <Keyboard
              guessedLetters={gameState.guessedLetters}
              word={gameState.word}
              onLetterClick={guessLetter}
              disabled={gameState.isGameOver}
            />
          </div>

          <HintModal
            isOpen={showHint}
            onClose={toggleHintModal}
            onUseHint={useHintSystem}
            wordData={gameState.wordData}
            hintsRemaining={2 - gameState.hintsUsed}
          />

          <GameOverModal
            isOpen={gameState.isGameOver}
            isWinner={gameState.isWinner}
            word={gameState.word}
            score={gameState.score}
            timeElapsed={elapsed}
            accuracy={accuracy}
            onPlayAgain={resetGame}
            onHome={() => setScreen('home')}
          />
        </div>
      </div>
    </div>
  );
};

export default HangmanGame;
