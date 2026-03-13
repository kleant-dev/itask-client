// components/messages/empty-message-state.tsx

export function EmptyMessageState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-white text-center">
      {/* Illustration matching Figma design */}
      <svg
        viewBox="0 0 120 120"
        fill="none"
        className="h-32 w-32 opacity-70"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Chat bubbles illustration */}
        <rect x="10" y="30" width="70" height="44" rx="12" fill="#e9f0fe" />
        <rect
          x="10"
          y="30"
          width="70"
          height="44"
          rx="12"
          stroke="#266df0"
          strokeWidth="1.5"
          strokeOpacity="0.3"
        />
        <rect
          x="18"
          y="42"
          width="40"
          height="7"
          rx="3.5"
          fill="#266df0"
          fillOpacity="0.3"
        />
        <rect
          x="18"
          y="55"
          width="28"
          height="7"
          rx="3.5"
          fill="#266df0"
          fillOpacity="0.2"
        />
        <path
          d="M20 74L16 86L30 78"
          fill="#e9f0fe"
          stroke="#266df0"
          strokeWidth="1.5"
          strokeOpacity="0.3"
          strokeLinejoin="round"
        />

        <rect x="45" y="58" width="64" height="40" rx="12" fill="#f7f9fb" />
        <rect
          x="45"
          y="58"
          width="64"
          height="40"
          rx="12"
          stroke="#c5cfdd"
          strokeWidth="1.5"
        />
        <rect x="53" y="70" width="36" height="7" rx="3.5" fill="#c5cfdd" />
        <rect x="53" y="81" width="24" height="7" rx="3.5" fill="#dee4ee" />
        <path
          d="M95 98L100 110L86 103"
          fill="#f7f9fb"
          stroke="#c5cfdd"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>

      <div>
        <h3 className="text-[24px] font-semibold text-neutral-900">
          Sprintly Message
        </h3>
        <p className="mt-1 text-[14px] text-neutral-500">
          Select a message to view.
        </p>
      </div>
    </div>
  );
}
