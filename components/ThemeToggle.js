import { useEffect, useState } from 'react';
import Icon from './Icon';

export default function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('wm_theme');
    const isDark = saved !== 'light';
    setDark(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('wm_theme', next ? 'dark' : 'light');
  };

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={toggle}
      className="p-2 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
    >
      <Icon name={dark ? 'dark_mode' : 'light_mode'} className="text-[20px]" />
    </button>
  );
}
