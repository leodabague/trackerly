import React, { useState, useEffect } from 'react';
import { X, Keyboard } from 'lucide-react';

const WelcomeTooltip = ({ darkMode }) => {
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    // Check if user has seen the welcome tooltip before
    const hasSeenWelcome = localStorage.getItem('trackerly-keyboard-shortcuts-welcome');
    
    if (!hasSeenWelcome) {
      // Show welcome tooltip after a short delay
      const timer = setTimeout(() => {
        setShowWelcome(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const dismissWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem('trackerly-keyboard-shortcuts-welcome', 'true');
  };

  if (!showWelcome) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className={`relative max-w-sm mx-4 p-6 rounded-lg shadow-xl animate-pulse ${
        darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'
      }`}>
        <button
          onClick={dismissWelcome}
          className={`absolute top-2 right-2 p-1 rounded ${
            darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <X size={16} />
        </button>
        
        <div className="flex items-center gap-3 mb-3">
          <Keyboard size={24} className="text-blue-500" />
          <h3 className="font-semibold">Novidade: Atalhos de Teclado!</h3>
        </div>
        
        <p className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Agora você pode usar atalhos de teclado para ser mais produtivo:
        </p>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span>Nova tarefa</span>
            <kbd className={`px-2 py-1 text-xs font-mono rounded ${
              darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
            }`}>
              Ctrl+N
            </kbd>
          </div>
          <div className="flex items-center justify-between">
            <span>Exportar dados</span>
            <kbd className={`px-2 py-1 text-xs font-mono rounded ${
              darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
            }`}>
              Ctrl+S
            </kbd>
          </div>
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Clique no ícone 🎹 no canto inferior direito para ver todos os atalhos.
          </p>
        </div>
        
        <button
          onClick={dismissWelcome}
          className="w-full mt-3 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Entendi!
        </button>
      </div>
    </div>
  );
};

export default WelcomeTooltip;