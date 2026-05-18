interface FlagProps {
  code: string; // ISO 3166-1 alpha-2, or "gb-sct" / "gb-eng"
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASS = {
  sm: "w-5 h-3.5",
  md: "w-6 h-4",
  lg: "w-8 h-6",
};

export function Flag({ code, size = "md", className = "" }: FlagProps) {
  if (!code) return null;
  return (
    <span
      className={`fi fi-${code.toLowerCase()} inline-block rounded-sm flex-shrink-0 ${SIZE_CLASS[size]} ${className}`}
      style={{ backgroundSize: "cover" }}
      title={code.toUpperCase()}
    />
  );
}
