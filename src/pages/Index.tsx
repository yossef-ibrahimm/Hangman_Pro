import HangmanGame from "@/components/HangmanGame";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

const Index = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <HangmanGame />
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default Index;
