import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

export default function PasswordStrengthIndicator({ password, className = '' }: PasswordStrengthIndicatorProps) {
  const requirements = [
    { key: 'minLength', label: 'Pelo menos 8 caracteres', test: (pwd: string) => pwd.length >= 8 },
    { key: 'hasUppercase', label: 'Uma letra maiúscula (A-Z)', test: (pwd: string) => /[A-Z]/.test(pwd) },
    { key: 'hasLowercase', label: 'Uma letra minúscula (a-z)', test: (pwd: string) => /[a-z]/.test(pwd) },
    { key: 'hasNumber', label: 'Um número (0-9)', test: (pwd: string) => /\d/.test(pwd) },
    { key: 'hasSpecialChar', label: 'Um caractere especial (!@#$%^&*)', test: (pwd: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd) }
  ];

  const getStrengthColor = () => {
    const metRequirements = requirements.filter(req => req.test(password)).length;
    if (metRequirements < 3) return 'bg-red-500';
    if (metRequirements < 5) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    const metRequirements = requirements.filter(req => req.test(password)).length;
    if (metRequirements < 3) return 'Fraca';
    if (metRequirements < 5) return 'Média';
    return 'Forte';
  };

  return (
    <div className={`mt-2 ${className}`}>
      {/* Password strength bar */}
      {password && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">Força da senha:</span>
            <span className={`text-sm font-medium ${
              getStrengthText() === 'Fraca' ? 'text-red-600' :
              getStrengthText() === 'Média' ? 'text-yellow-600' : 'text-green-600'
            }`}>
              {getStrengthText()}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`}
              style={{ width: `${(requirements.filter(req => req.test(password)).length / requirements.length) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Requirements list */}
      <div className="space-y-1">
        {requirements.map((req) => {
          const isMet = req.test(password);
          return (
            <div key={req.key} className="flex items-center text-sm">
              {isMet ? (
                <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
              ) : (
                <X className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />
              )}
              <span className={isMet ? 'text-green-700' : 'text-gray-600'}>
                {req.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
