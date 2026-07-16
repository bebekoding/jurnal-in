export function LogoMark({
  className = "",
  size = 32,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 34"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* left page */}
      <path
        d="M20 9C15.5 6 9 5.6 3.5 7.6V27C9 25 15.5 25.4 20 28.4"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* right page */}
      <path
        d="M20 9C24.5 6 31 5.6 36.5 7.6V27C31 25 24.5 25.4 20 28.4"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* spine */}
      <path
        d="M20 9V28.4"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
      {/* left page text lines */}
      <path
        d="M7.5 12.5L15 11.6M7.5 16L14.5 15.2M7.5 19.5L13.5 18.9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* pencil over right page */}
      <path
        d="M33.4 8.6L25.2 18.4"
        stroke="currentColor"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <path
        d="M25.2 18.4L24 21.4L27 20.4"
        fill="currentColor"
      />
      {/* bookmark ribbon */}
      <path
        d="M17 25V32.5L20 30L23 32.5V25"
        fill="#c53a20"
        stroke="#c53a20"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-baseline font-display text-ink ${className}`}
    >
      Jurnal<span className="text-accent">.in</span>
    </span>
  );
}

export function LogoLockup({
  markSize = 30,
  className = "",
  textClassName = "text-xl",
}: {
  markSize?: number;
  className?: string;
  textClassName?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark size={markSize} className="text-ink" />
      <Wordmark className={textClassName} />
    </span>
  );
}
