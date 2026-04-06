interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    fullWidth?: boolean;
  }
  
  export default function Button({ fullWidth, children, ...rest }: ButtonProps) {
    const mergedClassName = [
      // Base
      "relative inline-flex items-center justify-center gap-2",
      "px-5 py-3 rounded-xl font-semibold tracking-wide",
      "text-white select-none",
      // Glass + gradient
      "bg-gradient-to-r from-purple-600/90 via-fuchsia-600/85 to-cyan-500/80",
      "backdrop-blur-md border border-white/10",
      "shadow-[0_18px_45px_-22px_rgba(168,85,247,0.75)]",
      // Interaction
      "cursor-pointer",
      "transition-all duration-200 ease-out",
      "hover:brightness-110 hover:shadow-[0_22px_55px_-24px_rgba(34,211,238,0.55)]",
      "active:scale-[0.98]",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0f]",
      // Disabled
      "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
      // Layout
      fullWidth ? "w-full" : "",
      rest.className || "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button
        {...rest}
        className={mergedClassName}
      >
        {children}
      </button>
    );
  }
  