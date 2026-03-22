// components/messages/empty-message-state.tsx
// Figma screen 50 "Message" — message-box shows centered illustration + text
// Illustration: compose-email style SVG (blue envelope/document)
// Title: "Sprintly Message" 24px semibold
// Subtitle: "Select a message to view." 14px regular #596881
export function EmptyMessageState() {
  return (
    <div
      className="flex flex-1 flex-col items-center justify-center gap-4 bg-white text-center"
      style={{ borderRadius: 24 }}
    >
      {/* Illustration — matches the compose-email graphic in the Figma */}
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: 120, height: 120 }}
      >
        {/* Background circle */}
        <circle cx="60" cy="60" r="52" fill="#eaf0fe" />
        {/* Envelope body */}
        <rect
          x="22"
          y="38"
          width="76"
          height="52"
          rx="8"
          fill="#266df0"
          fillOpacity="0.12"
        />
        <rect
          x="22"
          y="38"
          width="76"
          height="52"
          rx="8"
          stroke="#266df0"
          strokeWidth="1.5"
          strokeOpacity="0.3"
        />
        {/* Envelope flap */}
        <path
          d="M22 46l38 26 38-26"
          stroke="#266df0"
          strokeWidth="1.5"
          strokeOpacity="0.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Inner lines (document preview) */}
        <rect
          x="36"
          y="62"
          width="28"
          height="4"
          rx="2"
          fill="#266df0"
          fillOpacity="0.25"
        />
        <rect
          x="36"
          y="70"
          width="20"
          height="4"
          rx="2"
          fill="#266df0"
          fillOpacity="0.18"
        />
        {/* Sparkle dots */}
        <circle cx="96" cy="34" r="4" fill="#eaf0fe" />
        <circle cx="26" cy="32" r="2.5" fill="#eaf0fe" />
        <circle cx="100" cy="56" r="2" fill="#eaf0fe" />
      </svg>

      {/* Text */}
      <div>
        <h3
          className="font-semibold text-[#111625]"
          style={{
            fontSize: 24,
            lineHeight: "32px",
            fontFamily: "'Inter Display', Inter, sans-serif",
          }}
        >
          Sprintly Message
        </h3>
        <p className="mt-1 text-[14px] text-[#596881]">
          Select a message to view.
        </p>
      </div>
    </div>
  );
}
