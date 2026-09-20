import React from 'react';

interface JamsBoxLogoProps {
  size?: number;
  variant?: 'compact' | 'standard' | 'large';
  className?: string;
  transparentBg?: boolean;
}

/**
 * Original JamsBox 3D Isometric Puzzle Cube Vector Icon
 * Matches the official launcher foreground vector asset.
 */
export const JamsBoxOriginalIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 36,
  className = '',
}) => {
  return (
    <svg
      viewBox="0 0 108 108"
      width={size}
      height={size}
      className={`shrink-0 select-none ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Ground Contact Shadow */}
      <path
        fill="#1E293B"
        fillOpacity="0.25"
        d="M32 91C32 87 76 87 76 91C76 95 32 95 32 91Z"
      />

      {/* 1. LEFT ISOMETRIC FACE */}
      <path
        fill="#243C6E"
        d="M30 52L42 45C43 46 44 46 45 45L46 42V53C45 54 45 55 46 56V60L35 66C34 65 33 65 32 66L30 68V52Z"
      />
      <path
        fill="#F97316"
        d="M46 42L54 38V54C53 55 53 56 54 57V64L46 68V60C45 61 44 61 43 60C42 59 43 58 44 57L46 53V42Z"
      />
      <path
        fill="#EA580C"
        d="M30 68L32 66C33 65 34 65 35 66L46 60V68C45 69 45 70 46 71V75L36 81C35 80 34 80 33 81L30 85V68Z"
      />
      <path
        fill="#172554"
        d="M46 68L54 64V80L44 86C45 87 46 87 47 86V78C48 79 49 79 50 78L46 75V68Z"
      />
      <path
        fill="#0B1B38"
        d="M33 61L35 60V65C35 67 33 67 32 66L33 65C34 65 34 64 34 63V61ZM36 60L38 59L39 63L37 64L36 60ZM40 58L42 57L43 61L41 62L40 58ZM43 56L45 55V59L43 60V56Z"
      />

      {/* 2. RIGHT ISOMETRIC FACE */}
      <path
        fill="#254178"
        d="M54 38L62 42C63 41 64 41 65 42L67 45L78 39V55L67 61C66 60 65 60 64 61L61 63L54 60V38Z"
      />
      <path
        fill="#16274A"
        d="M54 60L61 63V72C62 73 63 73 64 72L67 70V74L54 82V60Z"
      />
      <path
        fill="#1B2E56"
        d="M67 61L78 55V71L67 77V61Z"
      />
      <path
        fill="#0B1B38"
        d="M56 60L58 61V66L56 65V60ZM69 54L74 51V53L72 54V60L70 61V55L69 56V54ZM73 56C74 55 76 54 77 55C78 56 78 59 77 60C76 61 74 62 73 61C72 60 72 57 73 56Z"
      />

      {/* 3. TOP ISOMETRIC FACE */}
      <path
        fill="#2D4D88"
        d="M54 25L43 31L48 34C49 33 50 33 51 34L54 37L57 34C58 33 59 33 60 34L65 31L54 25Z"
      />
      <path
        fill="#34599C"
        d="M43 31L32 37L43 43L48 40C47 39 47 38 48 37L54 34L48 34L43 31Z"
      />
      <path
        fill="#2D4D88"
        d="M65 31L60 34L54 34L60 37C61 38 61 39 60 40L65 43L76 37L65 31Z"
      />
      <path
        fill="#FFA200"
        fillOpacity="0.75"
        d="M48 40L54 37L60 40L54 44L48 40Z"
      />

      {/* 4. FLOATING PUZZLE PIECE WITH RADIANT GLOW */}
      <path
        fill="#FF9500"
        fillOpacity="0.4"
        d="M54 16C63 16 70 22 70 30C70 38 63 44 54 44C45 44 38 38 38 30C38 22 45 16 54 16Z"
      />
      <path
        fill="#C2410C"
        d="M46 31V34L54 39V36L46 31Z"
      />
      <path
        fill="#9A3412"
        d="M54 36V39L62 34V31L54 36Z"
      />
      <path
        fill="#FF8500"
        stroke="#FED7AA"
        strokeWidth="0.8"
        d="M54 23C55 22 56 23 56 24C57 24 58 23 59 22L60 23C61 23 62 24 62 25C63 26 62 27 61 28L62 31C63 30 64 30 64 32C64 33 63 34 62 33L60 34C59 35 58 35 57 34L54 36L51 34C50 35 49 35 48 34L46 33C45 34 44 33 44 32C44 30 45 30 46 31L47 28C46 27 45 26 46 25C46 24 47 23 48 23L49 22C50 23 51 24 52 24C52 23 53 22 54 23Z"
      />
      <path
        stroke="#FFFFFF"
        strokeWidth="0.8"
        strokeLinecap="round"
        strokeOpacity="0.75"
        d="M50 25L54 23L58 25"
      />
    </svg>
  );
};

/**
 * Official JamsBox QT Header Branding Component
 *
 * Header Layout:
 * [ ORIGINAL LOGO ]  JamsBox QT
 *                    EDUCATIONAL QUIZ PLATFORM
 *
 * Requirements:
 * - Keeps original logo on the LEFT.
 * - Places the new JamsBox QT typography on the RIGHT.
 * - "JamsBox" in dark navy blue #0b1a40.
 * - "QT" in bright orange #f97316.
 * - Montserrat ExtraBold / weight 800.
 * - Tagline: "EDUCATIONAL QUIZ PLATFORM", uppercase, dark navy blue #0b1a40,
 *   medium font weight (500), approx 3px letter spacing, positioned directly below "JamsBox QT".
 */
export const JamsBoxLogo: React.FC<JamsBoxLogoProps> = ({
  size,
  variant = size && size <= 40 ? 'compact' : 'standard',
  className = '',
  transparentBg = false,
}) => {
  if (variant === 'compact') {
    const iconDimension = size || 34;
    return (
      <div
        className={`inline-flex items-center gap-2.5 select-none ${
          transparentBg ? 'bg-transparent' : 'bg-[#F5F5F5] px-3 py-1.5 rounded-lg'
        } ${className}`}
        style={{ fontFamily: "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
      >
        {/* [ ORIGINAL LOGO ] on the LEFT */}
        <JamsBoxOriginalIcon size={iconDimension} />

        {/* Typography on the RIGHT */}
        <div className="flex flex-col text-left">
          <div className="font-extrabold text-[16px] leading-tight tracking-tight whitespace-nowrap">
            <span className="text-[#0b1a40]">JamsBox</span>{' '}
            <span className="text-[#f97316]">QT</span>
          </div>
          <div className="text-[#0b1a40] text-[7.5px] font-medium uppercase tracking-[2.2px] mt-0.5 whitespace-nowrap">
            EDUCATIONAL QUIZ PLATFORM
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'large') {
    const iconDimension = size || 56;
    return (
      <div
        className={`flex items-center gap-4 select-none ${
          transparentBg ? 'bg-transparent' : 'bg-[#F5F5F5] px-6 py-4 rounded-xl'
        } ${className}`}
        style={{ fontFamily: "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
      >
        {/* [ ORIGINAL LOGO ] on the LEFT */}
        <JamsBoxOriginalIcon size={iconDimension} />

        {/* Typography on the RIGHT */}
        <div className="flex flex-col text-left">
          <div className="font-extrabold text-2xl sm:text-3xl leading-tight tracking-tight whitespace-nowrap">
            <span className="text-[#0b1a40]">JamsBox</span>{' '}
            <span className="text-[#f97316]">QT</span>
          </div>
          <div className="text-[#0b1a40] text-[10px] sm:text-[11.5px] font-medium uppercase tracking-[3px] mt-1 whitespace-nowrap">
            EDUCATIONAL QUIZ PLATFORM
          </div>
        </div>
      </div>
    );
  }

  // Standard variant
  const iconDimension = size || 40;
  return (
    <div
      className={`inline-flex items-center gap-3 select-none ${
        transparentBg ? 'bg-transparent' : 'bg-[#F5F5F5] px-4 py-2 rounded-lg'
      } ${className}`}
      style={{ fontFamily: "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
    >
      {/* [ ORIGINAL LOGO ] on the LEFT */}
      <JamsBoxOriginalIcon size={iconDimension} />

      {/* Typography on the RIGHT */}
      <div className="flex flex-col text-left">
        <div className="font-extrabold text-lg sm:text-xl leading-tight tracking-tight whitespace-nowrap">
          <span className="text-[#0b1a40]">JamsBox</span>{' '}
          <span className="text-[#f97316]">QT</span>
        </div>
        <div className="text-[#0b1a40] text-[8.5px] sm:text-[9.5px] font-medium uppercase tracking-[2.8px] mt-0.5 whitespace-nowrap">
          EDUCATIONAL QUIZ PLATFORM
        </div>
      </div>
    </div>
  );
};
