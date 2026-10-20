import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { LayoutProvider } from "../contexts/LayoutProvider";
import {
  ChatComposer,
  ChatMessage,
  ChatMessageList,
  ConversationItem,
  TypingIndicator,
} from "../modules/chat";
import { formatChatTime, renderChatTime } from "../modules/chat/chatTime";
import { expectNoAxeViolations } from "../test/axe";

const wrapper = ({ children }: { children: ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const field = () => screen.getByRole("textbox", { name: "Message" }) as HTMLTextAreaElement;
const sendButton = () => screen.getByRole("button", { name: "Send" });

/**
 * The composer's keyboard and busy states, on top of chat.test.tsx: Tab
 * order, a send in flight blocks a second one, `loading`/`disabled` stop
 * sending without losing the draft, and `sendOnEnter={false}` makes Enter a
 * newline.
 */
describe("ChatComposer interaction", () => {
  it("tabs from attach to the field to send", async () => {
    const user = userEvent.setup();
    render(<ChatComposer onSend={vi.fn()} attach defaultValue="hi" />, { wrapper });
    await user.tab();
    expect(screen.getByRole("button", { name: "Attach files" })).toHaveFocus();
    await user.tab();
    expect(field()).toHaveFocus();
    await user.tab();
    expect(sendButton()).toHaveFocus();
  });

  it("starts from defaultValue and reports every edit", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<ChatComposer onSend={vi.fn()} defaultValue="Hey" onValueChange={onValueChange} />, {
      wrapper,
    });
    expect(field().value).toBe("Hey");
    await user.type(field(), "!");
    expect(onValueChange).toHaveBeenLastCalledWith("Hey!");
    expect(sendButton()).toBeEnabled();
  });

  it("sends once while a send is in flight, then clears", async () => {
    const user = userEvent.setup();
    let resolve: () => void = () => {};
    const onSend = vi.fn(
      () =>
        new Promise<void>((r) => {
          resolve = r;
        }),
    );
    render(<ChatComposer onSend={onSend} />, { wrapper });
    await user.type(field(), "hello{Enter}{Enter}");
    expect(onSend).toHaveBeenCalledTimes(1);
    expect(sendButton()).toBeDisabled();
    expect(field().value).toBe("hello");
    await act(async () => resolve());
    expect(field().value).toBe("");
  });

  it("clears a controlled draft through onValueChange after sending", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<ChatComposer onSend={vi.fn()} value="hi" onValueChange={onValueChange} />, {
      wrapper,
    });
    field().focus();
    await user.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith("");
  });

  it("does not send while loading, and keeps the field editable", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<ChatComposer onSend={onSend} loading defaultValue="hi" />, { wrapper });
    expect(field()).toBeEnabled();
    await user.type(field(), "{Enter}");
    expect(onSend).not.toHaveBeenCalled();
    expect(sendButton()).toBeDisabled();
  });

  it("disables the field and send when disabled", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<ChatComposer onSend={onSend} disabled defaultValue="hi" attach />, { wrapper });
    expect(field()).toBeDisabled();
    expect(sendButton()).toBeDisabled();
    expect(screen.getByRole("button", { name: "Attach files" })).toBeDisabled();
    fireEvent.keyDown(field(), { key: "Enter" });
    await user.click(sendButton());
    expect(onSend).not.toHaveBeenCalled();
  });

  it("makes Enter a newline with sendOnEnter off", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<ChatComposer onSend={onSend} sendOnEnter={false} />, { wrapper });
    await user.type(field(), "a{Enter}b");
    expect(onSend).not.toHaveBeenCalled();
    expect(field().value).toBe("a\nb");
  });

  it("takes its names and placeholder from props", () => {
    render(
      <ChatComposer
        onSend={vi.fn()}
        ariaLabel="Reply to Ana"
        sendLabel="Post"
        attachLabel="Add"
        placeholder="Say something"
        attach
      />,
      { wrapper },
    );
    expect(screen.getByRole("textbox", { name: "Reply to Ana" })).toHaveAttribute(
      "placeholder",
      "Say something",
    );
    expect(screen.getByRole("button", { name: "Post" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
  });

  it("caps the draft at maxLength", async () => {
    const user = userEvent.setup();
    render(<ChatComposer onSend={vi.fn()} maxLength={3} />, { wrapper });
    await user.type(field(), "abcdef");
    expect(field().value).toBe("abc");
  });

  it("keeps only the newest file with multiple: false", async () => {
    const user = userEvent.setup();
    const { container } = render(<ChatComposer onSend={vi.fn()} attach={{ multiple: false }} />, {
      wrapper,
    });
    const input = container.querySelector("input[type='file']") as HTMLInputElement;
    await user.upload(input, new File(["a"], "a.txt"));
    await user.upload(input, new File(["b"], "b.txt"));
    expect(screen.queryByText("a.txt")).toBeNull();
    expect(screen.getByText("b.txt")).toBeInTheDocument();
  });

  it("attaches pasted files, and only with attach on", () => {
    const file = new File(["x"], "shot.png", { type: "image/png" });
    const { unmount } = render(<ChatComposer onSend={vi.fn()} attach />, { wrapper });
    fireEvent.paste(field(), { clipboardData: { files: [file] } });
    expect(screen.getByRole("button", { name: "Remove shot.png" })).toBeInTheDocument();
    unmount();
    render(<ChatComposer onSend={vi.fn()} />, { wrapper });
    fireEvent.paste(field(), { clipboardData: { files: [file] } });
    expect(screen.queryByText("shot.png")).toBeNull();
  });

  it("forwards its ref to the textarea", () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<ChatComposer ref={ref} onSend={vi.fn()} />, { wrapper });
    expect(ref.current).toBe(field());
  });
});

/**
 * ChatMessage's interactive parts: the retry button on a failed message is
 * reachable and works from the keyboard, actions render beside the bubble, and
 * an avatar is decorative unless given a name of its own.
 */
describe("ChatMessage interaction", () => {
  it("retries from the keyboard and announces the failure", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(
      <ChatMessage status="failed" onRetry={onRetry} retryLabel="Send again">
        Hi
      </ChatMessage>,
      { wrapper },
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Not sent");
    await user.tab();
    expect(screen.getByRole("button", { name: "Send again" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("shows no retry without onRetry, or when not failed", () => {
    const { rerender } = render(<ChatMessage status="failed">Hi</ChatMessage>, { wrapper });
    expect(screen.queryByRole("button")).toBeNull();
    rerender(
      <ChatMessage status="sent" onRetry={vi.fn()}>
        Hi
      </ChatMessage>,
    );
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByText("Sent")).toBeInTheDocument();
  });

  it("renders actions, attachments and footer", async () => {
    const { container } = render(
      <ChatMessage
        name="Ana"
        actions={
          <button type="button" aria-label="Reply">
            ↩
          </button>
        }
        attachments={<svg role="img" aria-label="Screenshot" />}
        footer={<span>2 reactions</span>}
      >
        Look
      </ChatMessage>,
      { wrapper },
    );
    expect(screen.getByRole("button", { name: "Reply" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Screenshot" })).toBeInTheDocument();
    expect(screen.getByText("2 reactions")).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("hides an unnamed avatar and exposes a named one", () => {
    const { container, rerender } = render(
      <ChatMessage name="Ana" avatarProps={{ value: "A" }}>
        Hi
      </ChatMessage>,
      { wrapper },
    );
    const avatar = () => (container.firstElementChild as HTMLElement).firstElementChild;
    expect(avatar()).toHaveAttribute("aria-hidden", "true");
    rerender(
      <ChatMessage name="Ana" avatarProps={{ value: "A", "aria-label": "Ana Silva" }}>
        Hi
      </ChatMessage>,
    );
    expect(avatar()).not.toHaveAttribute("aria-hidden");
  });

  it("renders no bubble without children", () => {
    render(<ChatMessage name="Ana" attachments={<span>file.pdf</span>} />, { wrapper });
    expect(screen.getByText("file.pdf")).toBeInTheDocument();
  });
});

/**
 * ChatMessageList is a focusable, named log: keyboard users can scroll it,
 * a caller's onScroll still runs, and stickToBottom={false} leaves the scroll
 * position to the reader.
 */
describe("ChatMessageList interaction", () => {
  it("takes focus with Tab so the keyboard can scroll it", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <ChatMessageList ariaLabel="Chat with Ana">
        <ChatMessage>Hi</ChatMessage>
      </ChatMessageList>,
      { wrapper },
    );
    await user.tab();
    const log = screen.getByRole("log", { name: "Chat with Ana" });
    expect(log).toHaveFocus();
    expect(log).toHaveAttribute("aria-live", "polite");
    await expectNoAxeViolations(container);
  });

  it("prefers a native aria-label and still calls onScroll", () => {
    const onScroll = vi.fn();
    render(
      <ChatMessageList aria-label="Native" ariaLabel="Prop" onScroll={onScroll}>
        <ChatMessage>Hi</ChatMessage>
      </ChatMessageList>,
      { wrapper },
    );
    const log = screen.getByRole("log", { name: "Native" });
    fireEvent.scroll(log);
    expect(onScroll).toHaveBeenCalledTimes(1);
  });

  it("leaves the scroll position alone with stickToBottom off", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <ChatMessageList ref={ref} stickToBottom={false}>
        <ChatMessage>Hi</ChatMessage>
      </ChatMessageList>,
      { wrapper },
    );
    expect(ref.current?.scrollTop).toBe(0);
    expect(ref.current).toBe(screen.getByRole("log"));
  });
});

/**
 * ConversationItem is one control: a button (Enter and Space open it) or a
 * link, current when selected, with the dots/avatars decorative.
 */
describe("ConversationItem interaction", () => {
  it("opens from Enter and Space", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<ConversationItem name="Ana" preview="See you" onClick={onClick} />, { wrapper });
    await user.tab();
    expect(screen.getByRole("button")).toHaveFocus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("is named by its content, unread count included", () => {
    render(
      <ConversationItem
        name="Ana"
        preview="See you"
        time="9:05"
        unread={2}
        avatarProps={{ value: "A" }}
        onClick={vi.fn()}
      />,
      { wrapper },
    );
    expect(screen.getByRole("button")).toHaveAccessibleName(
      expect.stringContaining("2 unread messages"),
    );
    expect(screen.getByRole("button")).toHaveAccessibleName(expect.stringContaining("Ana"));
  });

  it("marks a selected button as current", () => {
    render(<ConversationItem name="Ana" selected onClick={vi.fn()} />, { wrapper });
    expect(screen.getByRole("button")).toHaveAttribute("aria-current", "true");
  });

  it("uses a custom unread label and typing label", () => {
    render(
      <ConversationItem
        name="Ana"
        unread
        unreadLabel={() => "Neu"}
        typing
        typingLabel="schreibt…"
        onClick={vi.fn()}
      />,
      { wrapper },
    );
    expect(screen.getByText("Neu")).toBeInTheDocument();
    expect(screen.getByText("schreibt…")).toBeInTheDocument();
  });
});

describe("TypingIndicator interaction", () => {
  it("hides the dots and passes the axe check", async () => {
    const { container } = render(<TypingIndicator label="Ana is typing" />, { wrapper });
    const status = screen.getByRole("status");
    expect(status.firstElementChild).toHaveAttribute("aria-hidden", "true");
    await expectNoAxeViolations(container);
  });

  it("forwards its ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<TypingIndicator ref={ref} />, { wrapper });
    expect(ref.current).toBe(screen.getByRole("status"));
  });
});

describe("chatTime", () => {
  it("shows the time, not a date, for a message", () => {
    const date = new Date(2026, 0, 1, 14, 30);
    expect(formatChatTime(date)).toBe(
      date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
    );
  });

  it("shows a date for a future time in a list", () => {
    const now = new Date(2026, 9, 17, 18, 0);
    const later = new Date(2026, 9, 20, 9, 0);
    expect(formatChatTime(later, true, now)).toBe(
      later.toLocaleDateString([], { month: "short", day: "numeric" }),
    );
  });

  it("renders non-dates as given", () => {
    expect(renderChatTime("Just now")).toBe("Just now");
  });
});
