import React from 'react';
import { analyzePassword } from '../utils/passwordStrength.js';

export default function StrengthMeter({ password, showFeedback = true }) {
  const analysis = analyzePassword(password);
  const { score, label, feedback } = analysis;

  // Segment colors mapping
  const colors = [
    'bg-red-500',     // 0: Weak
    'bg-orange-500',  // 1: Fair
    'bg-yellow-500',  // 2: Good
    'bg-green-500',   // 3: Strong
    'bg-emerald-500'  // 4: Very Strong
  ];

  return (
    <div className="w-full space-y-2 mt-1">
      {/* Strength indicator labels */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-text-secondary">Password Strength:</span>
        <span className={`font-semibold ${
          score === 0 ? 'text-red-400' :
          score === 1 ? 'text-orange-400' :
          score === 2 ? 'text-yellow-400' :
          score === 3 ? 'text-green-400' : 'text-emerald-400'
        }`}>
          {password ? label : 'None'}
        </span>
      </div>

      {/* Segments progress bar */}
      <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
        {[0, 1, 2, 3].map((index) => {
          // If password empty, show empty bars
          if (!password) {
            return <div key={index} className="bg-slate-800 rounded-full transition-all duration-300" />;
          }

          // A segment is filled if its index is less than or equal to score-1 (unless score is 0, then we fill 1st bar as red)
          let isActive = false;
          if (score === 0 && index === 0) {
            // Fill first bar as red for score 0
            isActive = true;
          } else if (score > 0 && index < score) {
            isActive = true;
          }

          // Use the active color for all filled segments
          const colorClass = isActive ? colors[score] : 'bg-slate-800';

          return (
            <div
              key={index}
              className={`rounded-full transition-all duration-500 ${colorClass}`}
            />
          );
        })}
      </div>

      {/* Strength entropy value helper */}
      {password && (
        <div className="text-[10px] text-text-muted text-right">
          Estimated Entropy: {analysis.entropy} bits
        </div>
      )}

      {/* Displaying helper tips */}
      {showFeedback && password && feedback.length > 0 && (
        <ul className="text-xs space-y-1 text-text-secondary pt-1 list-disc pl-4">
          {feedback.map((tip, idx) => (
            <li key={idx} className="leading-tight">{tip}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
