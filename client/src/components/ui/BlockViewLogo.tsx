interface BlockViewLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  showSubtext?: boolean;
}

export function BlockViewLogo({ size = 'md', showText = true, showSubtext = false }: BlockViewLogoProps) {
  const dimensions = {
    sm: { icon: 24, text: 'text-sm', subtext: 'text-[9px]' },
    md: { icon: 36, text: 'text-xl', subtext: 'text-[10px]' },
    lg: { icon: 48, text: 'text-2xl', subtext: 'text-xs' },
  };
  const d = dimensions[size];

  return (
    <div className="flex items-center gap-2.5">
      {/* Icon - Stylized BV with shield + chart arrow */}
      <svg
        width={d.icon}
        height={d.icon}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="bv-shield" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C0C0C0" />
            <stop offset="50%" stopColor="#E8E8E8" />
            <stop offset="100%" stopColor="#808080" />
          </linearGradient>
          <linearGradient id="bv-arrow" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#9CA3AF" />
            <stop offset="100%" stopColor="#F3F4F6" />
          </linearGradient>
        </defs>
        {/* Shield hexagon shape */}
        <path
          d="M32 4L56 16V38L32 60L8 38V16L32 4Z"
          stroke="url(#bv-shield)"
          strokeWidth="2.5"
          fill="none"
          opacity="0.8"
        />
        {/* B letter */}
        <path
          d="M18 18H28C31 18 33 20 33 23C33 25 31.5 26.5 30 27C32 27.5 34 29 34 32C34 35 31.5 37 28.5 37H18V18ZM23 25H27C28.5 25 29.5 24 29.5 23C29.5 21.5 28.5 21 27 21H23V25ZM23 34H28C29.5 34 30.5 33 30.5 31.5C30.5 30 29.5 29 28 29H23V34Z"
          fill="url(#bv-shield)"
        />
        {/* Chart arrow going up-right */}
        <path
          d="M30 40L38 28L44 32L52 16"
          stroke="url(#bv-arrow)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Arrow head */}
        <path
          d="M48 14L54 15L51 20Z"
          fill="url(#bv-arrow)"
        />
      </svg>

      {showText && (
        <div className="flex flex-col">
          <span
            className={`${d.text} font-bold tracking-wider bg-gradient-to-r from-gray-100 via-gray-300 to-gray-400 bg-clip-text text-transparent`}
            style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}
          >
            BLOCKVIEW
          </span>
          {showSubtext && (
            <span className={`${d.subtext} tracking-[0.25em] text-gray-500 uppercase -mt-0.5`}>
              Crypto Insights & Analysis
            </span>
          )}
        </div>
      )}
    </div>
  );
}
