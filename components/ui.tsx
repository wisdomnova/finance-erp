"use client";

import React, { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { IconChevronDown } from "@tabler/icons-react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const CustomInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, className = "", ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-900 focus:border-brand focus:bg-white focus:outline-none focus:ring-0 rounded-xl transition-colors ${className}`}
          {...props}
        />
      </div>
    );
  }
);
CustomInput.displayName = "CustomInput";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const CustomTextArea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, className = "", ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`w-full border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-900 focus:border-brand focus:bg-white focus:outline-none focus:ring-0 rounded-xl transition-colors min-h-[100px] ${className}`}
          {...props}
        />
      </div>
    );
  }
);
CustomTextArea.displayName = "CustomTextArea";

interface DropdownProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export const CustomDropdown = React.forwardRef<HTMLSelectElement, DropdownProps>(
  ({ label, options, className = "", ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            {label}
          </label>
        )}
        <div className="relative w-full">
          <select
            ref={ref}
            className={`w-full border border-zinc-200 bg-zinc-50 pl-3.5 pr-10 py-2.5 text-sm text-zinc-900 focus:border-brand focus:bg-white focus:outline-none focus:ring-0 rounded-xl appearance-none transition-colors cursor-pointer ${className}`}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <IconChevronDown
            size={16}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
          />
        </div>
      </div>
    );
  }
);
CustomDropdown.displayName = "CustomDropdown";

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  label?: string;
  className?: string;
}

export const CustomCheckbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  label,
  className = "",
}) => {
  return (
    <label className={`flex items-center gap-2.5 cursor-pointer select-none ${className}`}>
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={onChange}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
          checked
            ? "border-brand bg-brand text-white"
            : "border-zinc-200 bg-white text-transparent hover:border-zinc-350"
        }`}
      >
        {checked && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="3.5"
            stroke="currentColor"
            className="h-3 w-3"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        )}
      </button>
      {label && <span className="text-sm font-medium text-zinc-700">{label}</span>}
    </label>
  );
};

export const PageHeader: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div className="pb-6 mb-8 border-b border-zinc-200">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900">{title}</h1>
    </div>
  );
};

