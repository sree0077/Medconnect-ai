import React, { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface FormSelectProps {
  label: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Option[];
  placeholder?: string;
  required?: boolean;
  icon?: ReactNode;
  error?: string;
}

const FormSelect: React.FC<FormSelectProps> = ({
  label,
  id,
  value,
  onChange,
  options,
  placeholder,
  required = false,
  icon,
  error,
}) => {
  return (
    <div>
      <label htmlFor={id} className="form-label text-gray-700 dark:text-text-primary">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-text-muted">
            {icon}
          </div>
        )}
        
        <div className="relative">
          <select
            id={id}
            value={value}
            onChange={onChange}
            required={required}
            className={`
              form-input appearance-none pr-10
              ${icon ? 'pl-10' : ''}
              ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-200 dark:border-red-600 dark:focus:border-red-500 dark:focus:ring-red-800' : ''}
            `}
          >
            <option value="" disabled selected={!value}>
              {placeholder || 'Select an option'}
            </option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 dark:text-text-muted">
            <ChevronDown size={16} />
          </div>
        </div>
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-500 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default FormSelect;
