"use client";

import React from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";

interface BaseProps {
  label: string;
  error?: string;
  icon?: string;
}

interface InputProps extends BaseProps, Omit<React.InputHTMLAttributes<HTMLInputElement>, "className"> {
  as?: "input";
}

interface TextareaProps extends BaseProps, Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> {
  as: "textarea";
}

interface SelectProps extends BaseProps {
  as: "select";
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: readonly string[];
  placeholder?: string;
  name?: string;
}

type Props = InputProps | TextareaProps | SelectProps;

const fieldClass =
  "w-full bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-[13px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00B4FF]/40 focus:border-[#00B4FF] transition-all disabled:opacity-60";

export function OnboardingField(props: Props) {
  const { label, error, icon } = props;

  return (
    <div className="space-y-1.5">
      <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 ml-0.5">{label}</label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
            <ClientIcon icon={icon} className="w-4 h-4 text-slate-400" />
          </div>
        )}
        {props.as === "textarea" ? (
          <textarea rows={3} {...props} className={`${fieldClass} resize-none`} />
        ) : props.as === "select" ? (
          <>
            <select
              name={props.name}
              value={props.value}
              onChange={props.onChange}
              className={`${fieldClass} pr-10 appearance-none cursor-pointer`}
            >
              <option value="" disabled>
                {props.placeholder || `Select ${label.toLowerCase()}`}
              </option>
              {props.options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
              <ClientIcon icon="ph:caret-down-bold" className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </>
        ) : (
          <input {...(props as InputProps)} className={fieldClass} />
        )}
      </div>
      {error && <span className="text-xs font-medium text-red-500 ml-0.5">{error}</span>}
    </div>
  );
}
