import React from 'react';

interface CheckboxProps {
  id: string;
  checked: boolean;
  onChange: () => void;
  label: string;
  disabled?: boolean;
}

const Checkbox: React.FC<CheckboxProps> = ({
  id,
  checked,
  onChange,
  label,
  disabled = false,
}) => {
  return (
    <div className="flex items-center">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="h-4 w-4 rounded border-slate-300 dark:border-border text-primary dark:text-primary-500 focus:ring-primary/30 dark:focus:ring-primary-500/30 bg-white dark:bg-surface"
      />
      <label htmlFor={id} className="checkbox-label text-slate-600 dark:text-text-secondary">
        {label}
      </label>
    </div>
  );
};

export default Checkbox;
