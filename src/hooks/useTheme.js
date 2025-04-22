import { useState, useEffect } from 'react';

export const useTheme = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const temaSalvo = localStorage.getItem('darkMode');
    if (temaSalvo !== null) {
      return temaSalvo === 'true';
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  const alternarTema = () => {
    setDarkMode(!darkMode);
  };

  return { darkMode, alternarTema };
}; 