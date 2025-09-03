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
  const { theme, setTheme } = useTheme();
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
  const keyboardShortcutsRef = useRef();
  const welcomeTooltipRef = useRef();

  // Define keyboard shortcuts
  const shortcuts = {
    'ctrl+m': () => {
      if (taskListRef.current) {
        taskListRef.current.openNewTaskModal();
        window.showShortcutNotification?.('Ctrl+M', 'Nova tarefa');
      }
    },
    'ctrl+s': () => {
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
    },
    'escape': () => {
      // Fechar todos os modais possíveis quando ESC for pressionado
      let modalFechado = false;
      
      if (taskListRef.current && taskListRef.current.closeModals) {
        modalFechado = taskListRef.current.closeModals() || modalFechado;
      }
      
      if (actionButtonsRef.current && actionButtonsRef.current.closeModals) {
        modalFechado = actionButtonsRef.current.closeModals() || modalFechado;
      }
      
      if (keyboardShortcutsRef.current && keyboardShortcutsRef.current.closeModal) {
        modalFechado = keyboardShortcutsRef.current.closeModal() || modalFechado;
      }
      
      if (welcomeTooltipRef.current && welcomeTooltipRef.current.closeModal) {
        modalFechado = welcomeTooltipRef.current.closeModal() || modalFechado;
      }
      
      if (modalFechado) {
        window.showShortcutNotification?.('Esc', 'Modal fechado');
      }
    }
  };

  // Initialize keyboard shortcuts
  useKeyboardShortcuts(shortcuts);

  const alternarTema = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="max-w-4xl mx-auto p-4 min-h-screen">
      <Header alternarTema={alternarTema} />
      
      <TaskFilters
        view={view}
        setView={setView}
        formatarPeriodo={formatarPeriodo}
        navegarData={navegarData}
      />
      
      <TaskStats
        horasUsadas={horasUsadas}
        horasDisponiveis={horasDisponiveis}
        view={view}
        dataSelecionada={dataSelecionada}
        weekStart={weekStart}
        monthStart={monthStart}
      />
      
      <ActionButtons 
        ref={actionButtonsRef}
        resetFiltros={resetFiltros}
      />
      
      <TaskList
        ref={taskListRef}
        view={view}
        dataSelecionada={dataSelecionada}
        weekStart={weekStart}
        monthStart={monthStart}
      />
      
      {/* Keyboard shortcuts help */}
      <KeyboardShortcuts ref={keyboardShortcutsRef} />
      
      {/* Shortcut notification */}
      <ShortcutNotification />
      
      {/* Welcome tooltip for keyboard shortcuts */}
      <WelcomeTooltip ref={welcomeTooltipRef} />
    </div>
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