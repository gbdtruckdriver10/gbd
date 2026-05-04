import Image from "next/image";

interface GBDLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function GBDLogo({ className = "", size = "md", showText = true }: GBDLogoProps) {
  const sizeClasses: Record<NonNullable<GBDLogoProps["size"]>, string> = {
    sm: "h-8 w-auto",
    md: "h-12 w-auto",
    lg: "h-16 w-auto",
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Image
        src="/gbd-logo.png"
        alt="GBD - Gifted & Beyond Daycare"
        width={120}
        height={120}
        className={sizeClasses[size]}
        priority
      />
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className="font-bold text-[#002040] tracking-wide text-lg">GBD</span>
          <span className="text-xs text-gray-600">Gifted & Beyond</span>
        </div>
      )}
    </div>
  );
}
