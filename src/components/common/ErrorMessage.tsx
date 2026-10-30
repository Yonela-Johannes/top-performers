import { AlertTriangle } from "lucide-react";

interface ErrorMessageProps {
  title?: string;
  message?: string;
  className?: string;
}

export const ErrorMessage = ({
  title = "Something went wrong",
  message = "Please try again in a moment.",
  className = "",
}: ErrorMessageProps) => {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center border-2 border-destructive bg-card px-6 py-10 text-center shadow-[4px_4px_0_var(--ink)] ${className}`}
    >
      <div className="flex h-10 w-10 items-center justify-center border-2 border-destructive bg-destructive/10">
        <AlertTriangle
          className="h-5 w-5 text-destructive"
          aria-hidden="true"
        />
      </div>
      <p className="mt-3 text-base font-semibold text-foreground">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{message}</p>
    </div>
  );
};
