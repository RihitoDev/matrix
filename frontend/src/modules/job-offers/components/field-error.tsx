interface FieldErrorProps {
  fieldId: string;
  message?: string;
}

export function FieldError({ fieldId, message }: FieldErrorProps) {
  if (!message) return null;

  return (
    <p id={`${fieldId}-error`} role="alert" className="mt-1.5 text-[12px] font-medium text-danger">
      {message}
    </p>
  );
}
