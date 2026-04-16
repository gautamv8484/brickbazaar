import React from 'react';
import { FiAlertCircle } from 'react-icons/fi';

const FormError = ({ error, show = true }) => {
  if (!error || !show) return null;

  return (
    <div className="form-error">
      <FiAlertCircle className="error-icon" />
      <span>{error}</span>
    </div>
  );
};

export default FormError;