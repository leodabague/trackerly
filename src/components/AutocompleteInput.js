import React, { useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const AutocompleteInput = ({
  value,
  onChange,
  onSelect,
  suggestions = [],
  showSuggestions = false,
  onFocus,
  onBlur,
  placeholder = '',
  className = '',
  required = false,
  autoFocus = false
}) => {
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const firstSuggestion = suggestionsRef.current?.querySelector('[data-suggestion]');
      firstSuggestion?.focus();
    } else if (e.key === 'Escape') {
      onBlur?.();
    }
  };

  const handleSuggestionKeyDown = (e, suggestion, index) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(suggestion);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextSuggestion = suggestionsRef.current?.querySelector(`[data-suggestion-index="${index + 1}"]`);
      if (nextSuggestion) {
        nextSuggestion.focus();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (index === 0) {
        inputRef.current?.focus();
      } else {
        const prevSuggestion = suggestionsRef.current?.querySelector(`[data-suggestion-index="${index - 1}"]`);
        prevSuggestion?.focus();
      }
    } else if (e.key === 'Escape') {
      onBlur?.();
      inputRef.current?.focus();
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={(e) => {
            // Delay para permitir clique nas sugestões
            setTimeout(() => {
              if (!suggestionsRef.current?.contains(document.activeElement)) {
                onBlur?.();
              }
            }, 150);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          className={`${className} pr-8`}
        />
        {suggestions.length > 0 && (
          <ChevronDown 
            size={16} 
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none transition-transform duration-200 ${
              showSuggestions ? 'rotate-180' : ''
            } text-muted-foreground`}
          />
        )}
      </div>
      
      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 max-h-40 overflow-y-auto rounded-md border shadow-lg bg-card border-border"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion}-${index}`}
              type="button"
              data-suggestion
              data-suggestion-index={index}
              onClick={() => onSelect(suggestion)}
              onKeyDown={(e) => handleSuggestionKeyDown(e, suggestion, index)}
              className={`w-full text-left px-3 py-2 text-sm transition-colors duration-150 focus:outline-none text-foreground hover:bg-accent focus:bg-accent ${index === 0 ? 'rounded-t-md' : ''} ${
                index === suggestions.length - 1 ? 'rounded-b-md' : ''
              }`}
            >
              <span className="block truncate">{suggestion}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AutocompleteInput;