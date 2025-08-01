import React, { useState, useEffect } from 'react';

const ShortcutNotification = ({ darkMode }) => {
  const [notification, setNotification] = useState(null);

  // Show notification for keyboard shortcut usage
  const showNotification = (shortcut, action) => {
    setNotification({ shortcut, action });
    setTimeout(() => setNotification(null), 2000);
  };

  // Export function to be used by other components
  window.showShortcutNotification = showNotification;

  if (!notification) return null;

  return (
    <div className={`fixed top-4 right-4 px-4 py-2 rounded-md shadow-lg z-50 transition-all duration-300 ${
      darkMode 
        ? 'bg-gray-800 text-gray-100 border border-gray-700' 
        : 'bg-white text-gray-900 border border-gray-200'
    }`}>
      <div className="flex items-center gap-2">
        <kbd className={`px-2 py-1 text-xs font-mono rounded ${
          darkMode 
            ? 'bg-gray-700 text-gray-300' 
            : 'bg-gray-100 text-gray-700'
        }`}>
          {notification.shortcut}
        </kbd>
        <span className="text-sm">{notification.action}</span>
      </div>
    </div>
  );
};

export default ShortcutNotification;