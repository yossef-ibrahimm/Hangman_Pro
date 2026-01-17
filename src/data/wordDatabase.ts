export interface WordData {
  word: string;
  hint: {
    en: string;
    ar: string;
  };
  category: {
    en: string;
    ar: string;
  };
  funFact?: {
    en: string;
    ar: string;
  };
}

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export const WORD_DATABASE: Record<Difficulty, WordData[]> = {
  easy: [
    { 
      word: 'REACT', 
      hint: { en: 'JavaScript library for building UIs', ar: 'مكتبة جافاسكريبت لبناء الواجهات' },
      category: { en: 'Frontend', ar: 'واجهات أمامية' },
      funFact: { en: 'Created by Facebook in 2013', ar: 'أنشأتها فيسبوك عام 2013' }
    },
    { 
      word: 'PYTHON', 
      hint: { en: 'High-level programming language', ar: 'لغة برمجة عالية المستوى' },
      category: { en: 'Language', ar: 'لغة برمجة' },
      funFact: { en: 'Named after Monty Python', ar: 'سميت على اسم مونتي بايثون' }
    },
    { 
      word: 'DESIGN', 
      hint: { en: 'Visual planning process', ar: 'عملية التخطيط البصري' },
      category: { en: 'General', ar: 'عام' }
    },
    { 
      word: 'GITHUB', 
      hint: { en: 'Code hosting platform', ar: 'منصة استضافة الأكواد' },
      category: { en: 'Tools', ar: 'أدوات' }
    },
    { 
      word: 'CODING', 
      hint: { en: 'Writing computer programs', ar: 'كتابة برامج الكمبيوتر' },
      category: { en: 'General', ar: 'عام' }
    },
    { 
      word: 'APPLE', 
      hint: { en: 'A famous tech company', ar: 'شركة تقنية شهيرة' },
      category: { en: 'Technology', ar: 'تكنولوجيا' }
    },
    { 
      word: 'GOOGLE', 
      hint: { en: 'Search engine giant', ar: 'عملاق محركات البحث' },
      category: { en: 'Technology', ar: 'تكنولوجيا' }
    },
  ],
  medium: [
    { 
      word: 'TYPESCRIPT', 
      hint: { en: 'Superset of JavaScript with static types', ar: 'امتداد جافاسكريبت مع الأنواع الثابتة' },
      category: { en: 'Language', ar: 'لغة برمجة' },
      funFact: { en: 'Developed by Microsoft', ar: 'طورتها مايكروسوفت' }
    },
    { 
      word: 'ALGORITHM', 
      hint: { en: 'Step-by-step problem-solving procedure', ar: 'إجراء خطوة بخطوة لحل المشاكل' },
      category: { en: 'CS Theory', ar: 'نظرية الحاسوب' }
    },
    { 
      word: 'DATABASE', 
      hint: { en: 'Organized collection of data', ar: 'مجموعة منظمة من البيانات' },
      category: { en: 'Backend', ar: 'خلفية' }
    },
    { 
      word: 'FRAMEWORK', 
      hint: { en: 'Reusable code structure', ar: 'هيكل كود قابل لإعادة الاستخدام' },
      category: { en: 'Development', ar: 'تطوير' }
    },
    { 
      word: 'COMPILER', 
      hint: { en: 'Translates code to machine language', ar: 'يترجم الكود إلى لغة الآلة' },
      category: { en: 'CS Theory', ar: 'نظرية الحاسوب' }
    },
    { 
      word: 'DEBUGGING', 
      hint: { en: 'Finding and fixing errors', ar: 'إيجاد وإصلاح الأخطاء' },
      category: { en: 'Development', ar: 'تطوير' }
    },
  ],
  hard: [
    { 
      word: 'POLYMORPHISM', 
      hint: { en: 'OOP concept - objects taking many forms', ar: 'مفهوم برمجة كائنية - الكائنات تتخذ أشكالاً متعددة' },
      category: { en: 'OOP', ar: 'برمجة كائنية' },
      funFact: { en: 'Key to code flexibility', ar: 'مفتاح مرونة الكود' }
    },
    { 
      word: 'ASYNCHRONOUS', 
      hint: { en: 'Non-blocking execution pattern', ar: 'نمط تنفيذ غير متزامن' },
      category: { en: 'Programming', ar: 'برمجة' }
    },
    { 
      word: 'ENCAPSULATION', 
      hint: { en: 'Data hiding principle in OOP', ar: 'مبدأ إخفاء البيانات في البرمجة الكائنية' },
      category: { en: 'OOP', ar: 'برمجة كائنية' }
    },
    { 
      word: 'RECURSION', 
      hint: { en: 'Function calling itself', ar: 'دالة تستدعي نفسها' },
      category: { en: 'Algorithms', ar: 'خوارزميات' }
    },
    { 
      word: 'KUBERNETES', 
      hint: { en: 'Container orchestration platform', ar: 'منصة تنسيق الحاويات' },
      category: { en: 'DevOps', ar: 'DevOps' }
    },
  ],
  expert: [
    { 
      word: 'MICROSERVICES', 
      hint: { en: 'Architectural style for applications', ar: 'نمط معماري للتطبيقات' },
      category: { en: 'Architecture', ar: 'هندسة معمارية' }
    },
    { 
      word: 'BLOCKCHAIN', 
      hint: { en: 'Distributed ledger technology', ar: 'تقنية دفتر الأستاذ الموزع' },
      category: { en: 'Technology', ar: 'تكنولوجيا' }
    },
    { 
      word: 'CYBERSECURITY', 
      hint: { en: 'Protection of computer systems', ar: 'حماية أنظمة الكمبيوتر' },
      category: { en: 'Security', ar: 'أمان' }
    },
    { 
      word: 'VIRTUALIZATION', 
      hint: { en: 'Creating virtual versions of resources', ar: 'إنشاء نسخ افتراضية من الموارد' },
      category: { en: 'Infrastructure', ar: 'بنية تحتية' }
    },
    { 
      word: 'REFACTORING', 
      hint: { en: 'Improving code without changing behavior', ar: 'تحسين الكود دون تغيير السلوك' },
      category: { en: 'Development', ar: 'تطوير' }
    },
  ],
};

export const KEYBOARD_ROWS = [
  'QWERTYUIOP'.split(''),
  'ASDFGHJKL'.split(''),
  'ZXCVBNM'.split(''),
];
