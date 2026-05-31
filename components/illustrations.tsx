import { cn } from '@/lib/utils';

type IllustrationProps = {
  className?: string;
};

export function HeroIllustration({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 400 360"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('w-full h-auto', className)}
      aria-hidden="true"
    >
      {/* Phone body */}
      <rect x="120" y="30" width="160" height="300" rx="24" fill="#1e1b4b" stroke="#6366f1" strokeWidth="2" />
      <rect x="132" y="56" width="136" height="248" rx="4" fill="#f8faff" />

      {/* Phone notch */}
      <rect x="170" y="38" width="60" height="8" rx="4" fill="#312e81" />

      {/* Calendar header on screen */}
      <rect x="140" y="64" width="120" height="28" rx="4" fill="#6366f1" />
      <text x="200" y="83" textAnchor="middle" fill="white" fontSize="11" fontWeight="600" fontFamily="system-ui">
        My Bookings
      </text>

      {/* Calendar time slots */}
      <rect x="140" y="100" width="120" height="24" rx="6" fill="#e0e7ff" />
      <circle cx="154" cy="112" r="5" fill="#6366f1" />
      <rect x="164" y="108" width="60" height="4" rx="2" fill="#6366f1" opacity="0.6" />
      <rect x="164" y="114" width="40" height="3" rx="1.5" fill="#a5b4fc" />

      <rect x="140" y="132" width="120" height="24" rx="6" fill="#ecfdf5" />
      <circle cx="154" cy="144" r="5" fill="#34d399" />
      <rect x="164" y="140" width="50" height="4" rx="2" fill="#047857" opacity="0.6" />
      <rect x="164" y="146" width="35" height="3" rx="1.5" fill="#6ee7b7" />

      <rect x="140" y="164" width="120" height="24" rx="6" fill="#e0e7ff" />
      <circle cx="154" cy="176" r="5" fill="#6366f1" />
      <rect x="164" y="172" width="55" height="4" rx="2" fill="#6366f1" opacity="0.6" />
      <rect x="164" y="178" width="45" height="3" rx="1.5" fill="#a5b4fc" />

      {/* Waitlist position card */}
      <rect x="140" y="200" width="120" height="44" rx="8" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="1" />
      <text x="200" y="218" textAnchor="middle" fill="#047857" fontSize="9" fontWeight="600" fontFamily="system-ui">
        Spot Available!
      </text>
      <rect x="168" y="226" width="64" height="10" rx="5" fill="#34d399" />
      <text x="200" y="234" textAnchor="middle" fill="white" fontSize="7" fontWeight="600" fontFamily="system-ui">
        Confirm
      </text>

      {/* Bottom nav dots */}
      <circle cx="182" cy="280" r="3" fill="#c7d2fe" />
      <circle cx="200" cy="280" r="3" fill="#6366f1" />
      <circle cx="218" cy="280" r="3" fill="#c7d2fe" />

      {/* Notification bell floating */}
      <g transform="translate(252, 48)">
        <circle cx="20" cy="20" r="20" fill="#6366f1" opacity="0.15" />
        <circle cx="20" cy="20" r="14" fill="#6366f1" />
        <path d="M20 12 C16 12 14 15 14 19 L14 22 L12 24 L28 24 L26 22 L26 19 C26 15 24 12 20 12Z" fill="white" />
        <circle cx="20" cy="26" r="2" fill="white" />
        <circle cx="28" cy="12" r="5" fill="#ef4444" />
        <text x="28" y="15" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold" fontFamily="system-ui">2</text>
      </g>

      {/* Checkmark floating */}
      <g transform="translate(80, 120)">
        <circle cx="18" cy="18" r="18" fill="#34d399" opacity="0.15" />
        <circle cx="18" cy="18" r="12" fill="#34d399" />
        <path d="M12 18 L16 22 L24 14" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* Clock floating */}
      <g transform="translate(88, 220)">
        <circle cx="14" cy="14" r="14" fill="#fde68a" opacity="0.2" />
        <circle cx="14" cy="14" r="10" fill="#fbbf24" />
        <path d="M14 9 L14 14 L18 16" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>

      {/* Search icon floating */}
      <g transform="translate(268, 180)">
        <circle cx="14" cy="14" r="14" fill="#93c5fd" opacity="0.2" />
        <circle cx="12" cy="12" r="7" stroke="#3b82f6" strokeWidth="2" fill="#dbeafe" />
        <line x1="17" y1="17" x2="22" y2="22" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* People dots */}
      <g transform="translate(90, 60)">
        <circle cx="8" cy="8" r="8" fill="#c4b5fd" opacity="0.3" />
        <circle cx="8" cy="6" r="3" fill="#8b5cf6" />
        <path d="M2 14 C2 11 5 9 8 9 C11 9 14 11 14 14" fill="#8b5cf6" opacity="0.6" />
      </g>
    </svg>
  );
}

export function EmptyWaitlistIllustration({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('w-full h-auto', className)}
      aria-hidden="true"
    >
      {/* Clipboard */}
      <rect x="55" y="24" width="90" height="120" rx="10" fill="#e0e7ff" stroke="#c7d2fe" strokeWidth="1.5" />
      <rect x="80" y="16" width="40" height="16" rx="8" fill="#6366f1" />

      {/* Empty lines */}
      <rect x="70" y="56" width="60" height="6" rx="3" fill="#c7d2fe" />
      <rect x="70" y="72" width="45" height="6" rx="3" fill="#c7d2fe" opacity="0.6" />
      <rect x="70" y="88" width="55" height="6" rx="3" fill="#c7d2fe" opacity="0.4" />
      <rect x="70" y="104" width="35" height="6" rx="3" fill="#c7d2fe" opacity="0.3" />

      {/* Decorative circles */}
      <circle cx="160" cy="40" r="12" fill="#fde68a" opacity="0.3" />
      <circle cx="38" cy="80" r="8" fill="#93c5fd" opacity="0.3" />
      <circle cx="165" cy="110" r="6" fill="#c4b5fd" opacity="0.3" />

      {/* Magnifying glass */}
      <g transform="translate(140, 64)">
        <circle cx="14" cy="14" r="10" stroke="#a5b4fc" strokeWidth="2" fill="none" />
        <line x1="21" y1="21" x2="28" y2="28" stroke="#a5b4fc" strokeWidth="2.5" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export function EmptyNotificationsIllustration({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('w-full h-auto', className)}
      aria-hidden="true"
    >
      {/* Bell */}
      <g transform="translate(60, 20)">
        <path
          d="M40 10 C30 10 20 22 20 40 L20 60 L10 72 L70 72 L60 60 L60 40 C60 22 50 10 40 10Z"
          fill="#e0e7ff"
          stroke="#c7d2fe"
          strokeWidth="1.5"
        />
        <circle cx="40" cy="80" r="6" fill="#6366f1" opacity="0.4" />
        <rect x="36" y="2" width="8" height="10" rx="4" fill="#6366f1" opacity="0.5" />
      </g>

      {/* Sparkles */}
      <g transform="translate(130, 28)">
        <path d="M8 0 L10 6 L16 8 L10 10 L8 16 L6 10 L0 8 L6 6Z" fill="#fde68a" opacity="0.6" />
      </g>
      <g transform="translate(40, 50)">
        <path d="M5 0 L6.5 4 L10 5 L6.5 6.5 L5 10 L3.5 6.5 L0 5 L3.5 4Z" fill="#93c5fd" opacity="0.5" />
      </g>
      <g transform="translate(150, 80)">
        <path d="M5 0 L6.5 4 L10 5 L6.5 6.5 L5 10 L3.5 6.5 L0 5 L3.5 4Z" fill="#c4b5fd" opacity="0.5" />
      </g>

      {/* Zzz */}
      <text x="140" y="50" fill="#a5b4fc" fontSize="16" fontWeight="bold" fontFamily="system-ui" opacity="0.5">z</text>
      <text x="148" y="40" fill="#a5b4fc" fontSize="12" fontWeight="bold" fontFamily="system-ui" opacity="0.35">z</text>
      <text x="154" y="33" fill="#a5b4fc" fontSize="9" fontWeight="bold" fontFamily="system-ui" opacity="0.25">z</text>

      {/* Checkmark badge */}
      <g transform="translate(52, 105)">
        <circle cx="14" cy="14" r="14" fill="#ecfdf5" stroke="#bbf7d0" strokeWidth="1" />
        <path d="M8 14 L12 18 L20 10" stroke="#34d399" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <text x="100" y="128" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="system-ui">All caught up!</text>
    </svg>
  );
}

export function SearchIllustration({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 240 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('w-full h-auto', className)}
      aria-hidden="true"
    >
      {/* Location pin */}
      <g transform="translate(20, 10)">
        <path d="M20 0 C30 0 38 8 38 18 C38 32 20 50 20 50 C20 50 2 32 2 18 C2 8 10 0 20 0Z" fill="#e0e7ff" stroke="#c7d2fe" strokeWidth="1" />
        <circle cx="20" cy="18" r="7" fill="#6366f1" />
      </g>

      {/* Calendar */}
      <g transform="translate(90, 14)">
        <rect width="56" height="48" rx="8" fill="#e0e7ff" stroke="#c7d2fe" strokeWidth="1" />
        <rect x="0" y="0" width="56" height="14" rx="8" fill="#6366f1" />
        <rect x="8" y="22" width="8" height="6" rx="1.5" fill="#c7d2fe" />
        <rect x="20" y="22" width="8" height="6" rx="1.5" fill="#c7d2fe" />
        <rect x="32" y="22" width="8" height="6" rx="1.5" fill="#34d399" />
        <rect x="8" y="34" width="8" height="6" rx="1.5" fill="#c7d2fe" />
        <rect x="20" y="34" width="8" height="6" rx="1.5" fill="#c7d2fe" />
        <rect x="32" y="34" width="8" height="6" rx="1.5" fill="#c7d2fe" />
      </g>

      {/* People */}
      <g transform="translate(170, 16)">
        <circle cx="18" cy="10" r="10" fill="#e0e7ff" />
        <circle cx="18" cy="8" r="5" fill="#a5b4fc" />
        <path d="M6 26 C6 20 11 16 18 16 C25 16 30 20 30 26" fill="#a5b4fc" opacity="0.5" />

        <circle cx="38" cy="14" r="8" fill="#ecfdf5" />
        <circle cx="38" cy="12" r="4" fill="#6ee7b7" />
        <path d="M28 26 C28 21 32 18 38 18 C44 18 48 21 48 26" fill="#6ee7b7" opacity="0.5" />
      </g>

      {/* Connecting dots */}
      <circle cx="70" cy="40" r="2.5" fill="#a5b4fc" opacity="0.5" />
      <circle cx="82" cy="40" r="2" fill="#a5b4fc" opacity="0.3" />
      <circle cx="156" cy="40" r="2.5" fill="#a5b4fc" opacity="0.5" />
      <circle cx="166" cy="40" r="2" fill="#a5b4fc" opacity="0.3" />

      {/* Sparkle */}
      <g transform="translate(206, 6)">
        <path d="M5 0 L6.5 4 L10 5 L6.5 6.5 L5 10 L3.5 6.5 L0 5 L3.5 4Z" fill="#fde68a" opacity="0.5" />
      </g>
    </svg>
  );
}

export function NoResultsIllustration({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('w-full h-auto', className)}
      aria-hidden="true"
    >
      {/* Map/location card */}
      <rect x="40" y="20" width="120" height="90" rx="12" fill="#f0f4ff" stroke="#c7d2fe" strokeWidth="1.5" />

      {/* Map lines */}
      <path d="M55 55 L80 45 L110 60 L145 50" stroke="#c7d2fe" strokeWidth="1.5" fill="none" />
      <path d="M55 75 L90 65 L120 80 L145 70" stroke="#c7d2fe" strokeWidth="1.5" fill="none" />

      {/* Location pin */}
      <g transform="translate(85, 30)">
        <path d="M15 0 C22 0 28 6 28 14 C28 24 15 38 15 38 C15 38 2 24 2 14 C2 6 8 0 15 0Z" fill="#6366f1" opacity="0.2" />
        <circle cx="15" cy="14" r="5" fill="#6366f1" opacity="0.5" />
      </g>

      {/* Question mark */}
      <g transform="translate(140, 80)">
        <circle cx="16" cy="16" r="16" fill="#fef3c7" />
        <text x="16" y="22" textAnchor="middle" fill="#d97706" fontSize="18" fontWeight="bold" fontFamily="system-ui">?</text>
      </g>

      {/* Text placeholder */}
      <rect x="60" y="125" width="80" height="5" rx="2.5" fill="#c7d2fe" opacity="0.5" />
      <rect x="70" y="136" width="60" height="4" rx="2" fill="#c7d2fe" opacity="0.3" />
    </svg>
  );
}
