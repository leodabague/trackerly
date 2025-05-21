import React from 'react';
import { Moon, Sun } from 'lucide-react';

const Header = ({ darkMode, alternarTema }) => {
  return (
    <header className="mb-8 text-center relative">
      <button
        onClick={alternarTema}
        className={`absolute top-0 right-0 p-2 rounded-full ${
          darkMode ? 'bg-gray-800 text-yellow-300' : 'bg-gray-200 text-blue-700'
        }`}
      >
        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>
      <h1 className={`text-3xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
        Tracker de Tempo
      </h1>
      <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>por Leo Dabague</p>
    </header>
  );
};

export default Header; 