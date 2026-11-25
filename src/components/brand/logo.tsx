/** 딱맞춤 monogram: a price tag with a check cut out of it. */
export function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <svg aria-hidden="true" className="logo-mark" height={size} viewBox="0 0 32 32" width={size}>
      <path
        className="logo-mark__body"
        d="M6 7h14.2c.8 0 1.5.3 2.1.9l6.4 6.4a2.4 2.4 0 0 1 0 3.4l-6.4 6.4c-.6.6-1.3.9-2.1.9H6a3 3 0 0 1-3-3V10a3 3 0 0 1 3-3z"
      />
      <circle className="logo-mark__cut" cx="23" cy="16" r="1.9" />
      <path className="logo-mark__check" d="M8 16.4l3.1 3.1 6-6.6" />
    </svg>
  );
}
