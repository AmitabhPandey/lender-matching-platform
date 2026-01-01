import React from 'react';
import styles from './Input.module.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

/**
 * Input component with label and error message
 */
export const Input: React.FC<InputProps> = ({
  label,
  error,
  fullWidth = false,
  className,
  ...props
}) => {
  const inputClasses = [
    styles.input,
    error ? styles.error : '',
    fullWidth ? styles.fullWidth : '',
    className || '',
  ].filter(Boolean).join(' ');

  return (
    <div className={fullWidth ? styles.fullWidth : styles.container}>
      {label && (
        <label className={styles.label}>
          {label}
          {props.required && <span className={styles.required}>*</span>}
        </label>
      )}
      <input className={inputClasses} {...props} />
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
};
