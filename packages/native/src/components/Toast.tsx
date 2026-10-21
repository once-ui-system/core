import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { View, type ViewStyle } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import type { Tone } from "../types";
import { Row } from "./Flex";
import { Icon, type IconName } from "./Icon";
import { IconButton } from "./IconButton";
import { Text } from "./Text";

export interface ToastProps {
  /** The palette and its icon; `danger` also interrupts the screen reader. 2.x called it `variant`. */
  tone: Tone;
  children: ReactNode;
  showIcon?: boolean;
  /** Shows a close button, called when the toast hides itself or is closed. */
  onClose?: () => void;
  action?: ReactNode;
  /** Milliseconds before the toast hides itself. Defaults to 6000, as in core; `Infinity` keeps it. */
  duration?: number;
  style?: ViewStyle;
}

const ICONS: Partial<Record<Tone, IconName>> = {
  success: "check",
  danger: "danger",
  warning: "warning",
  info: "info",
};

/** Core's `Toast`: a short message on a surface card that hides itself. */
export function Toast({
  tone,
  children,
  showIcon = true,
  onClose,
  action,
  duration = 6000,
  style,
}: ToastProps) {
  const [visible, setVisible] = useState(true);
  const closed = useRef(onClose);
  closed.current = onClose;

  useEffect(() => {
    if (!Number.isFinite(duration)) return;
    const timer = setTimeout(() => {
      setVisible(false);
      closed.current?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration]);

  if (!visible) return null;

  return (
    <Row
      fillWidth
      vertical="center"
      gap="8"
      background="surface"
      border="neutral-medium"
      radius="l"
      shadow="l"
      paddingY="12"
      paddingX="20"
      // Only a danger toast interrupts, as in core.
      accessibilityRole={tone === "danger" ? "alert" : "summary"}
      accessibilityLiveRegion={tone === "danger" ? "assertive" : "polite"}
      style={style}
    >
      {showIcon && <Icon size="s" onBackground={`${tone}-medium`} name={ICONS[tone] ?? "info"} />}
      <View style={{ flex: 1 }}>
        <Text textVariant="body-default-s">{children}</Text>
      </View>
      {action}
      {onClose && (
        <IconButton variant="ghost" icon="close" size="m" tooltip="Hide" onPress={onClose} />
      )}
    </Row>
  );
}

export interface ToastOptions {
  /** The palette and its icon, as core 3.0's `addToast({ tone, message })`. */
  tone: Tone;
  message: ReactNode;
  action?: ReactNode;
  duration?: number;
}

interface ToastContextValue {
  toasts: (ToastOptions & { id: string })[];
  addToast: (toast: ToastOptions) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/** Core's `useToast`: `addToast({ tone, message })` from anywhere under `ToastProvider`. */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
}

/** Core's `ToastProvider`: shows toasts stacked at the bottom of the screen, newest last. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastContextValue["toasts"]>([]);
  const next = useRef(0);
  const addToast = useCallback((toast: ToastOptions) => {
    next.current += 1;
    const id = `toast-${next.current}`;
    setToasts((list) => [...list, { ...toast, id }]);
  }, []);
  const removeToast = useCallback((id: string) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);
  const value = useMemo(() => ({ toasts, addToast, removeToast }), [toasts, addToast, removeToast]);
  const theme = useTheme();

  return (
    <ToastContext.Provider value={value}>
      {children}
      <View
        pointerEvents="box-none"
        style={{
          position: "absolute",
          left: theme.space("16"),
          right: theme.space("16"),
          // Above the home indicator, as core's `calc(space + --safe-area-bottom)`.
          bottom: theme.space("32") + theme.insets.bottom,
          gap: theme.space("8"),
        }}
      >
        {toasts.map((t) => (
          <Toast
            key={t.id}
            tone={t.tone}
            action={t.action}
            duration={t.duration}
            onClose={() => removeToast(t.id)}
          >
            {t.message}
          </Toast>
        ))}
      </View>
    </ToastContext.Provider>
  );
}
