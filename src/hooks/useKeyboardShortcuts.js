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

    // Build shortcut string
    let shortcutKey = '';
    if (ctrl) shortcutKey += 'ctrl+';
    if (alt) shortcutKey += 'alt+';
    if (shift) shortcutKey += 'shift+';
    shortcutKey += key;

    // Execute the corresponding action
    if (shortcuts[shortcutKey]) {
      event.preventDefault();
      event.stopPropagation();
      shortcuts[shortcutKey]();
    }
  }, [shortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
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