'use client';

import { useState, useRef, useEffect } from 'react';

interface CustomSelectProps {
  id: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Array<{ value: string | number; label: string }>;
  className?: string;
  error?: boolean;
  errorColor?: string;
  searchable?: boolean;
  disableMobileSearch?: boolean;
}

export function CustomSelect({
  id,
  name,
  value,
  onChange,
  options,
  className = '',
  error = false,
  errorColor = 'border-red-300 focus:ring-red-500',
  searchable = false,
  disableMobileSearch = false
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: Event) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    if (isOpen && searchable && (!disableMobileSearch || !isMobile) && searchInputRef.current) {
      searchInputRef.current.focus();
    }

    if (isOpen && dropdownRef.current && buttonRef.current) {
      const dropdown = dropdownRef.current;
      const button = buttonRef.current;
      const rect = button.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropdownHeight = Math.min(240, options.length * 40);

      if (spaceBelow < dropdownHeight + 20 && spaceAbove > spaceBelow) {
        dropdown.style.bottom = '100%';
        dropdown.style.top = 'auto';
        dropdown.style.marginBottom = '0.25rem';
        dropdown.style.marginTop = '0';
      } else {
        dropdown.style.top = '100%';
        dropdown.style.bottom = 'auto';
        dropdown.style.marginTop = '0.25rem';
        dropdown.style.marginBottom = '0';
      }
    }
  }, [isOpen, searchable, options.length, disableMobileSearch]);

  const handleSelectOption = (optionValue: string | number) => {
    const event = {
      target: {
        name,
        value: optionValue.toString(),
        type: 'select-one'
      }
    } as unknown as React.ChangeEvent<HTMLSelectElement>;

    onChange(event);
    setIsOpen(false);
    setSearchTerm('');
  };

  const selectedLabel = options.find(opt => String(opt.value) === String(value))?.label || 'Selecione uma opção';

  const baseClass = error ? errorColor : 'border-gray-200 focus:ring-blue-100 focus:border-blue-400';

  const filteredOptions = searchable && searchTerm
    ? options.filter(opt =>
      opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : options;

  return (
    <div ref={containerRef} className="relative w-full min-w-0">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-11 px-4 py-2 border rounded-xl shadow-sm text-left bg-white focus:outline-none focus:ring-4 flex justify-between items-center transition-all text-base md:text-sm ${baseClass} ${className}`}
      >
        <span className="truncate text-gray-700">{selectedLabel}</span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full bg-white border border-gray-200 rounded-xl shadow-xl mt-2 max-h-[min(15rem,40vh)] overflow-y-auto animate-in fade-in zoom-in duration-200"
        >
          {searchable && (
            <div className={`sticky top-0 bg-white border-b border-gray-100 p-2 ${disableMobileSearch ? 'hidden md:block' : ''}`}>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <button
                key={`${option.value}-${index}`}
                type="button"
                onClick={() => handleSelectOption(option.value)}
                className={`w-full px-4 py-3 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors border-b border-gray-50 last:border-0 ${String(value) === String(option.value) ? 'bg-blue-50/50 text-blue-600 font-medium' : 'text-gray-600'
                  }`}
              >
                <span className="block whitespace-normal break-words">{option.label}</span>
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-gray-600">
              Nenhuma opção encontrada
            </div>
          )}
        </div>
      )}

      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        className="hidden"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
