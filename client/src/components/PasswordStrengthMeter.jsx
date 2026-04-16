import React from 'react';
import { getPasswordStrength } from '../utils/validators';
import { FiCheck, FiX } from 'react-icons/fi';

const PasswordStrengthMeter = ({ password }) => {
  const strength = getPasswordStrength(password);

  if (!password) return null;

  const requirements = [
    { text: 'At least 8 characters', met: password.length >= 8 },
    { text: 'Uppercase letter (A-Z)', met: /[A-Z]/.test(password) },
    { text: 'Lowercase letter (a-z)', met: /[a-z]/.test(password) },
    { text: 'Number (0-9)', met: /[0-9]/.test(password) },
    { text: 'Special character (!@#$%)', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];

  return (
    <div className="password-strength">
      {/* Strength Bar */}
      <div className="strength-bar-container">
        <div className="strength-bars">
          {[1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={`strength-bar ${strength.level >= level ? 'active' : ''}`}
              style={{
                backgroundColor: strength.level >= level ? strength.color : '#e5e7eb'
              }}
            />
          ))}
        </div>
        <span 
          className="strength-text"
          style={{ color: strength.color }}
        >
          {strength.text}
        </span>
      </div>

      {/* Requirements Checklist */}
      <div className="strength-requirements">
        {requirements.map((req, i) => (
          <div 
            key={i} 
            className={`requirement ${req.met ? 'met' : 'unmet'}`}
          >
            {req.met ? (
              <FiCheck className="req-icon met" />
            ) : (
              <FiX className="req-icon unmet" />
            )}
            <span>{req.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;