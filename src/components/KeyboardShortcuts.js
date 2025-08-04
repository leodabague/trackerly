import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Keyboard, X } from 'lucide-react';

const KeyboardShortcuts = forwardRef(({ darkMode }, ref) => {
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    closeModal: () => {
      if (showShortcuts) {
        setShowShortcuts(false);
        return true;
      }
      return false;
    }
  }));

  const shortcuts = [
    { key: 'Ctrl+M', description: 'Criar nova tarefa', icon: '📝' },
    { key: 'Ctrl+S', description: 'Exportar dados rapidamente', icon: '💾' },
    { key: 'Ctrl+E', description: 'Abrir modal de exportação', icon: '📤' },
    { key: 'Ctrl+,', description: 'Abrir configurações', icon: '⚙️' },
    { key: 'Esc', description: 'Fechar modais', icon: '❌' }
  ];

  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  
  const formatShortcut = (shortcut) => {
    if (isMac) {
      return shortcut.replace('Ctrl', '⌘');
    }
    return shortcut;
  };

  return (
    <>
      {/* Keyboard shortcuts help button */}
      <button
        onClick={() => setShowShortcuts(true)}
        className={`fixed bottom-4 right-4 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 z-40 ${
          darkMode 
            ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
            : 'bg-white hover:bg-gray-50 text-gray-700'
        }`}
        title="Atalhos de teclado (?)"
      >
        <Keyboard size={20} />
      </button>

      {/* Keyboard shortcuts modal */}
      {showShortcuts && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-md mx-4`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                Atalhos de Teclado
              </h3>
              <button 
                onClick={() => setShowShortcuts(false)}
                className={`${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-3">
              {shortcuts.map((shortcut, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{shortcut.icon}</span>
                    <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {shortcut.description}
                    </span>
                  </div>
                  <kbd className={`px-2 py-1 text-xs font-mono rounded ${
                    darkMode 
                      ? 'bg-gray-700 text-gray-300 border border-gray-600' 
                      : 'bg-gray-100 text-gray-700 border border-gray-300'
                  }`}>
                    {formatShortcut(shortcut.key)}
                  </kbd>
                </div>
              ))}
            </div>
            
            <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                💡 Dica: Os atalhos funcionam quando você não está digitando em campos de texto.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

KeyboardShortcuts.displayName = 'KeyboardShortcuts';

export default KeyboardShortcuts;