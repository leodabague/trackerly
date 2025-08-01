import React, { useRef } from 'react';
import { TaskProvider } from './contexts/TaskContext';
import { useTheme } from './hooks/useTheme';
import { useTaskFilters } from './hooks/useTaskFilters';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import Header from './components/Header';
import TaskFilters from './components/TaskFilters';
import TaskStats from './components/TaskStats';
import TaskList from './components/TaskList';
import ActionButtons from './components/ActionButtons';
import KeyboardShortcuts from './components/KeyboardShortcuts';
import ShortcutNotification from './components/ShortcutNotification';
import WelcomeTooltip from './components/WelcomeTooltip';

const AppContent = () => {
  const { darkMode, alternarTema } = useTheme();
  const {
    view,
    setView,
    dataSelecionada,
    weekStart,
    monthStart,
    horasUsadas,
    horasDisponiveis,
    navegarData,
    formatarPeriodo,
    resetFiltros
  } = useTaskFilters();

  // Refs for accessing child component methods
  const taskListRef = useRef();
  const actionButtonsRef = useRef();

  // Define keyboard shortcuts
  const shortcuts = {
    'ctrl+n': () => {
      if (taskListRef.current) {
        taskListRef.current.openNewTaskModal();
        window.showShortcutNotification?.('Ctrl+N', 'Nova tarefa');
      }
    },
    'ctrl+s': (e) => {
      e?.preventDefault();
      if (actionButtonsRef.current) {
        actionButtonsRef.current.quickExport();
        window.showShortcutNotification?.('Ctrl+S', 'Exportando dados...');
      }
    },
    'ctrl+e': () => {
      if (actionButtonsRef.current) {
        actionButtonsRef.current.openExportModal();
        window.showShortcutNotification?.('Ctrl+E', 'Exportar/Importar');
      }
    },
    'ctrl+,': () => {
      if (actionButtonsRef.current) {
        actionButtonsRef.current.openConfigModal();
        window.showShortcutNotification?.('Ctrl+,', 'Configurações');
      }
    }
  };

  // Initialize keyboard shortcuts
  useKeyboardShortcuts(shortcuts);

  return (
    <>
      <div className={`fixed inset-0 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`} />
      <div className={`relative max-w-4xl mx-auto p-4 min-h-screen transition-colors duration-300 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
        <Header darkMode={darkMode} alternarTema={alternarTema} />
        
        <TaskFilters
          darkMode={darkMode}
          view={view}
          setView={setView}
          formatarPeriodo={formatarPeriodo}
          navegarData={navegarData}
        />
        
        <TaskStats
          darkMode={darkMode}
          horasUsadas={horasUsadas}
          horasDisponiveis={horasDisponiveis}
          view={view}
          dataSelecionada={dataSelecionada}
          weekStart={weekStart}
          monthStart={monthStart}
        />
        
        <ActionButtons 
          ref={actionButtonsRef}
          darkMode={darkMode} 
          resetFiltros={resetFiltros}
        />
        
        <TaskList
          ref={taskListRef}
          darkMode={darkMode}
          view={view}
          dataSelecionada={dataSelecionada}
          weekStart={weekStart}
          monthStart={monthStart}
        />
        
        {/* Keyboard shortcuts help */}
        <KeyboardShortcuts darkMode={darkMode} />
        
        {/* Shortcut notification */}
        <ShortcutNotification darkMode={darkMode} />
        
        {/* Welcome tooltip for keyboard shortcuts */}
        <WelcomeTooltip darkMode={darkMode} />
      </div>
    </>
  );
};

const App = () => {
  return (
    <TaskProvider>
      <AppContent />
    </TaskProvider>
  );
};

export default App;