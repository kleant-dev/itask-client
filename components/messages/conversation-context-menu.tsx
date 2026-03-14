// components/messages/conversation-context-menu.tsx
"use client";
import {
  MessageCircle,
  Archive,
  Volume2,
  UserCircle,
  Upload,
  X,
  Trash2,
  ChevronRight,
} from "lucide-react";

interface ConversationContextMenuProps {
  onClose: () => void;
}

const menuItems = [
  { icon: MessageCircle, label: "Mark as unread", danger: false },
  { icon: Archive, label: "Archive", danger: false },
  { icon: Volume2, label: "Mute", danger: false, hasArrow: true },
  { icon: UserCircle, label: "Contact info", danger: false },
  { icon: Upload, label: "Export chat", danger: false },
  { icon: X, label: "Clear chat", danger: false },
  { icon: Trash2, label: "Delete chat", danger: true },
];

export function ConversationContextMenu({
  onClose,
}: ConversationContextMenuProps) {
  return (
    <div
      className="absolute right-0 top-full mt-1 bg-white shadow-lg z-50"
      style={{
        width: 200,
        borderRadius: 16,
        padding: "12px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col gap-0">
        {menuItems.map(({ icon: Icon, label, danger, hasArrow }) => (
          <button
            key={label}
            onClick={onClose}
            className="flex items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors hover:bg-[#f7f9fb]"
            style={{ minHeight: 32 }}
          >
            <Icon
              style={{ width: 16, height: 16, flexShrink: 0 }}
              strokeWidth={1.5}
              className={danger ? "text-[#df1c41]" : "text-[#596881]"}
            />
            <span
              className="flex-1 text-[14px] font-medium"
              style={{ color: danger ? "#df1c41" : "#111625" }}
            >
              {label}
            </span>
            {hasArrow && (
              <ChevronRight
                style={{ width: 16, height: 16 }}
                strokeWidth={1.5}
                className="text-[#8796af]"
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
