import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
      className={`min-w-[40px] min-h-[40px] p-2 rounded-lg border transition-colors flex items-center justify-center text-zinc-600 dark:text-zinc-300 bg-white dark:bg-dark-elevated hover:bg-zinc-100 dark:hover:bg-dark-hover border-zinc-200 dark:border-dark-borderStrong ${className}`}
    >
      {theme === 'light' ? (
        <Moon className="w-4 h-4 text-zinc-700" />
      ) : (
        <Sun className="w-4 h-4 text-amber-400" />
      )}
    </button>
  );
};
