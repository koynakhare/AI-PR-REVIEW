import React, { forwardRef, memo } from "react";

const Input = memo(
  forwardRef(function Input({ label, id, error, hint, className = "", ...props }, ref) {
    return (
      <div className="field">
        {label ? (
          <label className="field-label" htmlFor={id}>
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          id={id}
          className={`field-input ${error ? "is-invalid" : ""} ${className}`.trim()}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          {...props}
        />
        {hint && !error ? (
          <p id={`${id}-hint`} className="field-hint">
            {hint}
          </p>
        ) : null}
        {error ? (
          <p id={`${id}-error`} className="field-error" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  }),
);

export default Input;
