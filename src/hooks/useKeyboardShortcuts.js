import { useEffect, useCallback } from 'react';

export const useKeyboardShortcuts = (shortcuts = {}) => {
  const handleKeyDown = useCallback((event) => {
    // Special handling for Escape key - always allow it
    if (event.key === 'Escape') {
      if (shortcuts['escape']) {
        event.preventDefault();
        event.stopPropagation();
        shortcuts['escape']();
        return;
      }
    }

    // Don't trigger other shortcuts when user is typing in input fields
    if (
      event.target.tagName === 'INPUT' ||
      event.target.tagName === 'TEXTAREA' ||
      event.target.tagName === 'SELECT' ||
      event.target.contentEditable === 'true'
    ) {
      return;
    }

    const key = event.key.toLowerCase();
    const ctrl = event.ctrlKey || event.metaKey; // Support both Ctrl and Cmd
    const alt = event.altKey;
    const shift = event.shiftKey;

    // Special aggressive handling for Ctrl+M for new task
    if (ctrl && key === 'm' && !alt && !shift) {
      if (shortcuts['ctrl+m']) {
        // Extra aggressive prevention for any conflicts
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        
        try {
          shortcuts['ctrl+m'](event);
        } catch (error) {
          console.error('Erro ao executar atalho Ctrl+M:', error);
        }
        return;
      }
    }

    // Build shortcut string
    let shortcutKey = '';
    if (ctrl) shortcutKey += 'ctrl+';
    if (alt) shortcutKey += 'alt+';
    if (shift) shortcutKey += 'shift+';
    shortcutKey += key;

    // Check if we have this shortcut defined and prevent default browser behavior immediately
    if (shortcuts[shortcutKey]) {
      // Prevent default browser behavior FIRST
      event.preventDefault();
      event.stopPropagation();
      
      // Then execute our custom action
      try {
        shortcuts[shortcutKey](event);
      } catch (error) {
        console.error('Erro ao executar atalho:', shortcutKey, error);
      }
    }
  }, [shortcuts]);

  useEffect(() => {
    // Use capture phase to ensure we intercept events before the browser
    document.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => {
      document.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [handleKeyDown]);

  return null;
};

// Hook for showing keyboard shortcut hints
export const useShortcutHints = () => {
  const getShortcutText = (shortcut) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    return shortcut.replace('ctrl+', isMac ? '⌘' : 'Ctrl+').replace('alt+', isMac ? '⌥' : 'Alt+').replace('shift+', '⇧');
  };

  return { getShortcutText };
};