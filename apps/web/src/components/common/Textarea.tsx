import { TextareaHTMLAttributes } from 'react';

type LimitVariant = 'name' | 'short' | 'description' | 'email';

const DEFAULT_LIMITS: Record<LimitVariant, number> = {
  name: 100,
  short: 200,
  description: 500,
  email: 254
};

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  /**
   * Preferred way to enforce text limits consistently.
   * If both `limitVariant` and `maxLength` are provided, `maxLength` wins.
   */
  limitVariant?: LimitVariant;
  /**
   * Show `current/max` counter when a max length is enforced.
   * Defaults to true.
   */
  showCounter?: boolean;
}

export const Textarea = ({
  label,
  error,
  className = '',
  limitVariant = 'description',
  showCounter = true,
  ...props
}: TextareaProps) => {
  const effectiveMaxLength =
    typeof props.maxLength === 'number' ? props.maxLength : DEFAULT_LIMITS[limitVariant];

  const currentValue =
    typeof props.value === 'string' ? props.value : props.value != null ? String(props.value) : '';

  const shouldShowCounter =
    showCounter && typeof effectiveMaxLength === 'number' && effectiveMaxLength > 0;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-black text-gray-600 mb-2 uppercase tracking-tight">
          {label}
        </label>
      )}
      <textarea
        className={`w-full bg-white border border-[#EBE3D5] rounded-xl px-4 py-3 outline-none focus:ring-2 ring-[#6F4E37]/10 text-sm ${error ? 'border-red-300' : ''} ${className}`}
        {...props}
        maxLength={effectiveMaxLength}
      />
      {shouldShowCounter && (
        <p className="mt-1 text-[11px] text-gray-400 font-bold text-right">
          {currentValue.length}/{effectiveMaxLength}
        </p>
      )}
      {error && (
        <p className="mt-1 text-xs text-red-600 font-bold">{error}</p>
      )}
    </div>
  );
};

