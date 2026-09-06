import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthMeterProps {
  password: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  const hasMinLength = password.length >= 8;
  const hasLetters = /[a-zA-Z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSymbols = /[^a-zA-Z0-9]/.test(password);

  const passedCount = [hasMinLength, hasLetters, hasNumbers, hasSymbols].filter(Boolean).length;

  let strengthLabel = 'Very Weak';
  let strengthColor = 'bg-rose-500';
  let widthPercent = '20%';

  if (password.length === 0) {
    strengthLabel = 'Empty';
    strengthColor = 'bg-slate-300 dark:bg-zinc-700';
    widthPercent = '0%';
  } else if (passedCount === 1) {
    strengthLabel = 'Weak';
    strengthColor = 'bg-rose-500';
    widthPercent = '25%';
  } else if (passedCount === 2) {
    strengthLabel = 'Fair';
    strengthColor = 'bg-amber-500';
    widthPercent = '50%';
  } else if (passedCount === 3) {
    strengthLabel = 'Good';
    strengthColor = 'bg-blue-500';
    widthPercent = '75%';
  } else if (passedCount === 4) {
    strengthLabel = 'Strong';
    strengthColor = 'bg-emerald-500';
    widthPercent = '100%';
  }

  return (
    <div className="space-y-2 mt-2">
      <div className="flex items-center justify-between text-[11px] font-sans">
        <span className="text-slate-500 dark:text-zinc-400">Password Strength:</span>
        <span className="font-bold text-slate-700 dark:text-zinc-300">{strengthLabel}</span>
      </div>

      <div className="h-1.5 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${strengthColor}`}
          style={{ width: widthPercent }}
        />
      </div>

      <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px] font-sans">
        <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-zinc-600'}`}>
          {hasMinLength ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
          <span>8+ Characters</span>
        </div>
        <div className={`flex items-center gap-1.5 ${hasLetters ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-zinc-600'}`}>
          {hasLetters ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
          <span>Letters (a-z, A-Z)</span>
        </div>
        <div className={`flex items-center gap-1.5 ${hasNumbers ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-zinc-600'}`}>
          {hasNumbers ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
          <span>Numbers (0-9)</span>
        </div>
        <div className={`flex items-center gap-1.5 ${hasSymbols ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-zinc-600'}`}>
          {hasSymbols ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
          <span>Special Symbols (!@#$)</span>
        </div>
      </div>
    </div>
  );
};
