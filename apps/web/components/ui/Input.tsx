
import * as React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  leftAdornment?: React.ReactNode;
  rightAdornment?: React.ReactNode;
}

/**
 * Accessible form input with label, error, and hint text.
 * - Always uses an explicit <label> linked via htmlFor (never placeholder-only)
 * - Error state announced via aria-describedby + aria-invalid
 * - Meets WCAG 2.1 AA contrast requirements
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, hint, leftAdornment, rightAdornment, id, className = '', ...props },
    ref
  ) => {
    const inputId = id ?? `input-${label.toLowerCase().replace(/\s+/g, '-')}`;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;
    const describedBy = [error ? errorId : null, hint ? hintId : null]
      .filter(Boolean)
      .join(' ');

    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={inputId}
          className="text-sm font-semibold text-gray-700 dark:text-gray-200"
        >
          {label}
          {props.required && (
            <span className="text-red-500 ml-1" aria-label="required">
              *
            </span>
          )}
        </label>

        <div className="relative flex items-center">
          {leftAdornment && (
            <span className="absolute left-3 text-gray-400 pointer-events-none" aria-hidden="true">
              {leftAdornment}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            aria-describedby={describedBy || undefined}
            className={[
              'w-full rounded-xl border bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100',
              'placeholder:text-gray-400',
              'transition-colors duration-150',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
              error
                ? 'border-red-400 focus-visible:ring-red-400'
                : 'border-gray-300 dark:border-gray-600 focus-visible:border-primary',
              leftAdornment ? 'pl-10' : '',
              rightAdornment ? 'pr-10' : '',
              className,
            ]
              .filter(Boolean)
              .join(' ')}
            {...props}
          />
          {rightAdornment && (
            <span className="absolute right-3 text-gray-400 pointer-events-none" aria-hidden="true">
              {rightAdornment}
            </span>
          )}
        </div>

        {error && (
          <p id={errorId} role="alert" className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
            <svg
              className="h-3.5 w-3.5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}

        {hint && !error && (
          <p id={hintId} className="text-xs text-gray-500 dark:text-gray-400">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

