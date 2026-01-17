import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'ar';

interface Translations {
  [key: string]: {
    en: string;
    ar: string;
  };
}

export const translations: Translations = {
  // General
  appTitle: { en: 'Hangman Pro', ar: 'لعبة المشنقة' },
  appSubtitle: { en: 'Master your vocabulary • Challenge your mind • Compete globally', ar: 'أتقن مفرداتك • تحدَّ عقلك • نافس عالميًا' },
  startAdventure: { en: 'Start Adventure', ar: 'ابدأ المغامرة' },
  enterName: { en: 'Enter your name', ar: 'أدخل اسمك' },
  
  // Navigation
  home: { en: 'Home', ar: 'الرئيسية' },
  backToHome: { en: '← Back to Home', ar: '→ العودة للرئيسية' },
  
  // Difficulty
  selectDifficulty: { en: 'Select Difficulty', ar: 'اختر المستوى' },
  easy: { en: 'Easy', ar: 'سهل' },
  medium: { en: 'Medium', ar: 'متوسط' },
  hard: { en: 'Hard', ar: 'صعب' },
  expert: { en: 'Expert', ar: 'خبير' },
  
  // Game Stats
  score: { en: 'Score', ar: 'النقاط' },
  lives: { en: 'Lives', ar: 'الأرواح' },
  hints: { en: 'Hints', ar: 'التلميحات' },
  time: { en: 'Time', ar: 'الوقت' },
  multiplier: { en: 'Multiplier', ar: 'المضاعف' },
  category: { en: 'Category', ar: 'الفئة' },
  accuracy: { en: 'Accuracy', ar: 'الدقة' },
  
  // Hints
  needHint: { en: 'Need a Hint?', ar: 'تحتاج تلميح؟' },
  hintsRemaining: { en: 'hints remaining', ar: 'تلميحات متبقية' },
  getHint: { en: 'Get Hint', ar: 'احصل على تلميح' },
  remaining: { en: 'remaining', ar: 'متبقي' },
  clue: { en: 'Clue', ar: 'دليل' },
  funFact: { en: 'Fun Fact', ar: 'معلومة ممتعة' },
  hintWarning: { en: 'Using a hint will reveal one random letter and cost you 200 points', ar: 'استخدام التلميح سيكشف حرفًا عشوائيًا ويكلفك 200 نقطة' },
  useHint: { en: 'Use Hint', ar: 'استخدم التلميح' },
  cancel: { en: 'Cancel', ar: 'إلغاء' },
  
  // Game Over
  victory: { en: 'Victory!', ar: 'فوز!' },
  gameOver: { en: 'Game Over', ar: 'انتهت اللعبة' },
  outstandingPerformance: { en: 'Outstanding performance!', ar: 'أداء رائع!' },
  betterLuck: { en: 'Better luck next time!', ar: 'حظ أفضل المرة القادمة!' },
  theWordWas: { en: 'The word was:', ar: 'الكلمة كانت:' },
  playAgain: { en: 'Play Again', ar: 'العب مجددًا' },
  
  // Screens
  leaderboard: { en: 'Leaderboard', ar: 'قائمة المتصدرين' },
  globalLeaderboard: { en: 'Global Leaderboard', ar: 'المتصدرين عالميًا' },
  topPlayers: { en: 'Top players worldwide', ar: 'أفضل اللاعبين عالميًا' },
  achievements: { en: 'Achievements', ar: 'الإنجازات' },
  theme: { en: 'Theme', ar: 'المظهر' },
  languageSwitch: { en: 'Language', ar: 'اللغة' },
  unlocked: { en: 'unlocked', ar: 'مفتوح' },
  of: { en: 'of', ar: 'من' },
  
  // Achievement titles
  firstVictory: { en: 'First Victory', ar: 'الفوز الأول' },
  firstVictoryDesc: { en: 'Win your first game', ar: 'فز بأول لعبة' },
  speedDemon: { en: 'Speed Demon', ar: 'شيطان السرعة' },
  speedDemonDesc: { en: 'Win a game in under 30 seconds', ar: 'فز بلعبة في أقل من 30 ثانية' },
  perfectGame: { en: 'Perfect Game', ar: 'لعبة مثالية' },
  perfectGameDesc: { en: 'Win without any wrong guesses', ar: 'فز دون أي تخمين خاطئ' },
  expertMaster: { en: 'Expert Master', ar: 'سيد الخبراء' },
  expertMasterDesc: { en: 'Win 10 games on Expert difficulty', ar: 'فز بـ 10 ألعاب على مستوى الخبير' },
  noHintsNeeded: { en: 'No Hints Needed', ar: 'لا حاجة للتلميحات' },
  noHintsNeededDesc: { en: 'Win without using any hints', ar: 'فز دون استخدام أي تلميحات' },
  streakKing: { en: 'Streak King', ar: 'ملك السلسلة' },
  streakKingDesc: { en: 'Win 5 games in a row', ar: 'فز بـ 5 ألعاب متتالية' },
  
  // Categories
  frontend: { en: 'Frontend', ar: 'واجهات أمامية' },
  backend: { en: 'Backend', ar: 'خلفية' },
  language: { en: 'Language', ar: 'لغة برمجة' },
  general: { en: 'General', ar: 'عام' },
  tools: { en: 'Tools', ar: 'أدوات' },
  csTheory: { en: 'CS Theory', ar: 'نظرية الحاسوب' },
  development: { en: 'Development', ar: 'تطوير' },
  oop: { en: 'OOP', ar: 'برمجة كائنية' },
  programming: { en: 'Programming', ar: 'برمجة' },
  algorithms: { en: 'Algorithms', ar: 'خوارزميات' },
  devops: { en: 'DevOps', ar: 'DevOps' },
  architecture: { en: 'Architecture', ar: 'هندسة معمارية' },
  technology: { en: 'Technology', ar: 'تكنولوجيا' },
  security: { en: 'Security', ar: 'أمان' },
  infrastructure: { en: 'Infrastructure', ar: 'بنية تحتية' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', language);
    document.body.setAttribute('dir', dir);
  }, [language, dir]);

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) return key;
    return translation[language] || translation.en || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
