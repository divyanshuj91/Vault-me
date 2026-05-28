import React from 'react';
import { analyzePassword } from '../utils/passwordStrength.js';

export default function StrengthMeter({ password, showFeedback = true }) {
  const analysis = analyzePassword(password);
  const { score, label, feedback } = analysis;

  // Width percentage per score level
  const widthMap = [20, 40, 60, 80, 100];
  const fillWidth = password ? widthMap[score] || 20 : 0;

  // Label color - monochromatic grayscale only
  const getLabelColor = (score) => {
    if (!password) return 'text-[#444748]';
    if (score <= 1) return 'text-[#8e9192]';
    if (score === 2) return 'text-[#c4c7c8]';
    return 'text-white';
  };

  return (
    <div className="w-full space-y-1.5 mt-1">
      {/* Label row */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-[#8e9192]">Password Strength:</span>
        <span className={`font-semibold ${getLabelColor(score)}`}>
          {password ? label : 'None'}
        </span>
      </div>

      {/* 2px single bar */}
      <div className="strength-bar">
        <div
          className="strength-fill"
          style={{ width: `${fillWidth}%` }}
        />
      </div>

      {/* Entropy value */}
      {password && (
        <div className="text-[10px] text-[#444748] text-right">
          Estimated Entropy: {analysis.entropy} bits
        </div>
      )}

      {/* Feedback tips */}
      {showFeedback && password && feedback.length > 0 && (
        <ul className="text-xs space-y-1 text-[#8e9192] pt-1 list-disc pl-4">
          {feedback.map((tip, idx) => (
            <li key={idx} className="leading-tight">{tip}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
