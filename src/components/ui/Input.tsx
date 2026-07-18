import React from 'react';
import { ClientIcon } from '@/components/ui/ClientIcon';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> {
  inputType?: 'input' | 'textarea' | 'select';
  icon?: string;
  options?: { value: string; label: string }[];
  wrapperClassName?: string;
  rows?: number;
}

export function Input({
  inputType = 'input',
  icon,
  options,
  wrapperClassName = '',
  className = '',
  ...props
}: InputProps) {
  const baseClasses = `
    w-full bg-slate-50 dark:bg-[#131B2C]/50 
    border border-slate-200 dark:border-slate-800/80 
    rounded-2xl px-5 py-4 text-sm 
    text-slate-900 dark:text-white 
    placeholder-slate-400 dark:placeholder-slate-500 
    focus:outline-none focus:ring-1 focus:ring-[#00B4FF]/50 focus:border-[#00B4FF]/50
    transition-all shadow-sm
  `;

  const paddingWithIcon = icon ? 'pl-12' : '';
  const finalClassName = `${baseClasses} ${paddingWithIcon} ${className}`;

  return (
    <div className={`relative ${wrapperClassName}`}>
      {icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none z-10">
          <ClientIcon icon={icon} className="w-5 h-5" />
        </div>
      )}

      {inputType === 'textarea' ? (
        <textarea
          className={finalClassName}
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          // Textarea usually needs icon at top left instead of center if it's multiline,
          // but if we keep it simple, we just adjust padding.
        />
      ) : inputType === 'select' ? (
        <div className="relative">
          <select
            className={`${finalClassName} appearance-none cursor-pointer`}
            defaultValue=""
            {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
          >
            {/* If placeholder is passed and handled natively via first empty option */}
            {props.placeholder && (
              <option value="" disabled hidden>
                {props.placeholder}
              </option>
            )}
            {options?.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-100">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
            <ClientIcon icon="ph:caret-down-bold" className="w-4 h-4" />
          </div>
        </div>
      ) : (
        <input
          className={finalClassName}
          {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
    </div>
  );
}
