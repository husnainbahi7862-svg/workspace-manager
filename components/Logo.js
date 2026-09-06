export default function Logo({ className = 'h-8 w-8' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect width="64" height="64" rx="16" fill="url(#wm-logo-grad)" />
      <rect x="14" y="14" width="16" height="16" rx="5" fill="white" fillOpacity="0.95" />
      <rect x="34" y="14" width="16" height="26" rx="5" fill="white" fillOpacity="0.75" />
      <rect x="14" y="34" width="16" height="16" rx="5" fill="white" fillOpacity="0.75" />
      <rect x="34" y="44" width="16" height="6" rx="3" fill="#A5B4FC" />
      <defs>
        <linearGradient id="wm-logo-grad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8083ff" />
          <stop offset="1" stopColor="#494bd6" />
        </linearGradient>
      </defs>
    </svg>
  );
}
