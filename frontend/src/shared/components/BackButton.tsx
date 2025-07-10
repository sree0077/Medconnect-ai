import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const BackButton: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="flex items-center justify-start px-6">
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors duration-200 group"
      >
        <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors duration-200">
          <ArrowLeft size={20} />
        </div>
        <span className="font-medium">Back to Home</span>
      </button>
    </div>
  );
};

export default BackButton;