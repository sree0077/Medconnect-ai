import React, { useEffect, useState } from 'react';

interface PasswordStrengthProps {
  password: string;
}

const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password }) => {
  const [strength, setStrength] = useState<'weak' | 'medium' | 'strong' | 'none'>('none');
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!password) {
      setStrength('none');
      setScore(0);
      return;
    }

    // Check password strength
    let newScore = 0;
    
    // Length check
    if (password.length >= 8) newScore += 1;
    if (password.length >= 12) newScore += 1;
    
    // Complexity checks
    if (/[A-Z]/.test(password)) newScore += 1; // Has uppercase
    if (/[a-z]/.test(password)) newScore += 1; // Has lowercase
    if (/[0-9]/.test(password)) newScore += 1; // Has number
    if (/[^A-Za-z0-9]/.test(password)) newScore += 1; // Has special char
    
    setScore(newScore);
    
    // Set strength based on score
    if (newScore <= 2) setStrength('weak');
    else if (newScore <= 4) setStrength('medium');
    else setStrength('strong');
    
  }, [password]);

  if (strength === 'none') return null;
  
  const getColor = () => {
    switch (strength) {
      case 'weak': return 'bg-red-500 dark:bg-red-600';
      case 'medium': return 'bg-yellow-500 dark:bg-yellow-600';
      case 'strong': return 'bg-green-500 dark:bg-green-600';
      default: return 'bg-slate-200 dark:bg-slate-700';
    }
  };
  
  const getLabel = () => {
    switch (strength) {
      case 'weak': return 'Weak password';
      case 'medium': return 'Medium password';
      case 'strong': return 'Strong password';
      default: return '';
    }
  };

  const getWidth = () => {
    return `${Math.min(100, (score / 6) * 100)}%`;
  };

  return (
    <div className="mt-2">
      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${getColor()} transition-all duration-300 ease-out`}
          style={{ width: getWidth() }}
        />
      </div>
      <p className={`text-xs mt-1 ${
        strength === 'weak' ? 'text-red-500 dark:text-red-400' :
        strength === 'medium' ? 'text-yellow-600 dark:text-yellow-500' :
        'text-green-600 dark:text-green-500'
      }`}>
        {getLabel()}
      </p>
    </div>
  );
};

export default PasswordStrength;
