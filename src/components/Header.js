import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const Header = ({ alternarTema }) => {
  const { theme } = useTheme();

  return (
    <header className="mb-8 text-center relative">
      <button
        onClick={alternarTema}
        className="absolute top-0 right-0 p-2 rounded-full bg-secondary text-secondary-foreground"
      >
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      </button>
      <h1 className="text-3xl font-bold text-foreground">
        Tracker de Tempo
      </h1>
      <p className="text-muted-foreground">por Leo Dabague</p>
    </header>
  );
};

export default Header;