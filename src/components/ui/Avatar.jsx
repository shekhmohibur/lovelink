import { cn, getInitials, generateAvatarColor } from "../../lib/utils";

export default function Avatar({ src, name, uid, size = "md", showOnline = false, isOnline = false, className }) {
  const sizes = {
    xs: "w-7 h-7 text-xs",
    sm: "w-9 h-9 text-xs",
    md: "w-11 h-11 text-sm",
    lg: "w-14 h-14 text-base",
    xl: "w-20 h-20 text-xl",
    "2xl": "w-28 h-28 text-2xl",
  };

  const dotSizes = {
    xs: "w-2 h-2 border",
    sm: "w-2.5 h-2.5 border",
    md: "w-3 h-3 border-2",
    lg: "w-3.5 h-3.5 border-2",
    xl: "w-4 h-4 border-2",
    "2xl": "w-4 h-4 border-2",
  };

  const gradientClass = generateAvatarColor(uid || name || "x");

  return (
    <div className={cn("relative flex-shrink-0", className)}>
      <div className={cn("rounded-full overflow-hidden flex items-center justify-center font-bold", sizes[size])}>
        {src ? (
          <img src={src} alt={name || "User"} className="w-full h-full object-cover" />
        ) : (
          <div className={cn("w-full h-full flex items-center justify-center bg-gradient-to-br text-white", gradientClass)}>
            {getInitials(name)}
          </div>
        )}
      </div>

      {showOnline && isOnline && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full bg-emerald-400 border-[#0a0a0f]",
            dotSizes[size]
          )}
          style={{ boxShadow: "0 0 6px rgba(52,211,153,0.8)" }}
        />
      )}
    </div>
  );
}
