import { forwardRef } from 'react';
import './Input.css';

const Input = forwardRef(({
  label,
  error,
  type = 'text',
  icon: Icon,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="input-container">
      {label && (
        <label className="input-label">
          {label}
        </label>
      )}
      <div className="input-wrapper">
        {Icon && (
          <div className="input-icon">
            <Icon />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={`input-field ${Icon ? 'has-icon' : ''} ${error ? 'error' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="input-error">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
