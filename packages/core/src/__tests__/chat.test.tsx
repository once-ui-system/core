import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { LayoutProvider } from "../contexts/LayoutProvider";
import {
  ChatComposer,
  ChatMessage,
  ChatMessageList,
  ConversationItem,
  TypingIndicator,
} from "../modules/chat";
import { formatChatTime } from "../modules/chat/chatTime";
import { expectNoAxeViolations } from "../test/axe";

// The send and attach buttons have tooltips, which read the layout context.
const wrapper = ({ children }: { children: ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

describe("ChatMessage", () => {
  it("puts the user's own message on the right and others on the left", () => {
    const { container } = render(
      <>
        <ChatMessage from="self">Mine</ChatMessage>
        <ChatMessage>Theirs</ChatMessage>
      </>,
    );
    const [self, other] = Array.from(container.querySelectorAll("[data-from]"));
    expect(self.getAttribute("data-from")).toBe("self");
    expect(self.className).toContain("row-reverse");
    expect(other.className).not.toContain("row-reverse");
  });

  it("keeps a plain message in reading order on either side", () => {
    const { container } = render(
      <ChatMessage from="self" variant="plain">
        Mine
      </ChatMessage>,
    );
    expect(container.firstElementChild?.className).not.toContain("row-reverse");
  });

  it("puts the time beside the name on a plain message", () => {
    render(
      <ChatMessage variant="plain" name="Ana" time="9:05">
        Hi
      </ChatMessage>,
    );
    expect(screen.getByText("Ana").parentElement?.textContent).toBe("Ana9:05");
  });

  it("renders a Date as a <time> with an ISO dateTime", () => {
    const sent = new Date("2026-10-17T09:05:00Z");
    const { container } = render(<ChatMessage time={sent}>Hi</ChatMessage>);
    expect(container.querySelector("time")?.getAttribute("dateTime")).toBe(sent.toISOString());
  });

  it("renders any other time as given", () => {
    render(<ChatMessage time="Just now">Hi</ChatMessage>);
    expect(screen.getByText("Just now")).toBeTruthy();
  });

  it("drops the name and hides the avatar on a grouped follow-up", () => {
    const { container } = render(
      <ChatMessage name="Ana" grouped avatarProps={{ value: "A" }}>
        Again
      </ChatMessage>,
    );
    expect(screen.queryByText("Ana")).toBeNull();
    expect(container.querySelector("[aria-hidden='true']")).not.toBeNull();
  });

  it("names the delivery state, in another language when asked", () => {
    const { rerender } = render(<ChatMessage status="read">Hi</ChatMessage>);
    expect(screen.getByText("Read")).toBeTruthy();
    rerender(
      <ChatMessage status="read" statusLabels={{ read: "Gelesen" }}>
        Hi
      </ChatMessage>,
    );
    expect(screen.getByText("Gelesen")).toBeTruthy();
  });

  it("offers a retry on a failed message", async () => {
    const onRetry = vi.fn();
    render(
      <ChatMessage status="failed" onRetry={onRetry}>
        Hi
      </ChatMessage>,
    );
    expect(screen.getByRole("alert").textContent).toBe("Not sent");
    await userEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <ChatMessageList>
        <ChatMessage name="Ana" avatarProps={{ value: "A" }} time="9:05">
          Morning
        </ChatMessage>
        <ChatMessage from="self" status="delivered" time="9:06">
          Hi Ana
        </ChatMessage>
        <TypingIndicator label="Ana is typing" />
      </ChatMessageList>,
    );
    await expectNoAxeViolations(container);
  });
});

/** jsdom has no layout, so the scroll metrics the list reads are set by hand. */
function setMetrics(el: HTMLElement, { scrollHeight = 1000, clientHeight = 200 } = {}) {
  Object.defineProperty(el, "scrollHeight", { configurable: true, value: scrollHeight });
  Object.defineProperty(el, "clientHeight", { configurable: true, value: clientHeight });
}

describe("ChatMessageList", () => {
  it("is a named log region", () => {
    render(<ChatMessageList aria-label="Chat with Ana" />);
    const log = screen.getByRole("log", { name: "Chat with Ana" });
    expect(log.getAttribute("aria-live")).toBe("polite");
  });

  it("follows new messages while the reader is at the bottom, and not after they scroll up", async () => {
    const Harness = ({ count }: { count: number }) => (
      <ChatMessageList>
        {Array.from({ length: count }, (_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static test list
          <ChatMessage key={i}>Message {i}</ChatMessage>
        ))}
      </ChatMessageList>
    );
    const { rerender } = render(<Harness count={2} />);
    const log = screen.getByRole("log");
    setMetrics(log);

    rerender(<Harness count={3} />);
    await waitFor(() => expect(log.scrollTop).toBe(1000));

    log.scrollTop = 100;
    fireEvent.scroll(log);
    setMetrics(log, { scrollHeight: 1200 });
    rerender(<Harness count={4} />);
    await act(async () => {});
    expect(log.scrollTop).toBe(100);
  });

  it("calls onReachStart once each time the reader reaches the top", () => {
    const onReachStart = vi.fn();
    render(<ChatMessageList onReachStart={onReachStart} stickToBottom={false} />);
    const log = screen.getByRole("log");
    setMetrics(log);
    log.scrollTop = 500;
    fireEvent.scroll(log);
    log.scrollTop = 10;
    fireEvent.scroll(log);
    log.scrollTop = 0;
    fireEvent.scroll(log);
    expect(onReachStart).toHaveBeenCalledTimes(1);
    log.scrollTop = 500;
    fireEvent.scroll(log);
    log.scrollTop = 0;
    fireEvent.scroll(log);
    expect(onReachStart).toHaveBeenCalledTimes(2);
  });
});

describe("ChatComposer", () => {
  it("sends the trimmed draft on Enter and clears it", async () => {
    const onSend = vi.fn();
    render(<ChatComposer onSend={onSend} />, { wrapper });
    const field = screen.getByRole("textbox", { name: "Message" });
    await userEvent.type(field, "  hello  {Enter}");
    expect(onSend).toHaveBeenCalledWith({ text: "hello", files: [] });
    expect((field as HTMLTextAreaElement).value).toBe("");
  });

  it("starts a new line on Shift+Enter", async () => {
    const onSend = vi.fn();
    render(<ChatComposer onSend={onSend} />, { wrapper });
    const field = screen.getByRole("textbox");
    await userEvent.type(field, "one{Shift>}{Enter}{/Shift}two");
    expect(onSend).not.toHaveBeenCalled();
    expect((field as HTMLTextAreaElement).value).toBe("one\ntwo");
  });

  it("does not send the Enter that confirms an IME composition", () => {
    const onSend = vi.fn();
    render(<ChatComposer onSend={onSend} defaultValue="にほん" />, { wrapper });
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter", isComposing: true });
    expect(onSend).not.toHaveBeenCalled();
  });

  it("does not send an empty draft", async () => {
    const onSend = vi.fn();
    render(<ChatComposer onSend={onSend} />, { wrapper });
    await userEvent.type(screen.getByRole("textbox"), "   {Enter}");
    expect(onSend).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Send" }).hasAttribute("disabled")).toBe(true);
  });

  it("keeps the draft when the send fails", async () => {
    const onSend = vi.fn().mockRejectedValue(new Error("offline"));
    render(<ChatComposer onSend={onSend} />, { wrapper });
    const field = screen.getByRole("textbox") as HTMLTextAreaElement;
    await userEvent.type(field, "hello{Enter}");
    await waitFor(() => expect(onSend).toHaveBeenCalled());
    expect(field.value).toBe("hello");
  });

  it("sends with the send button", async () => {
    const onSend = vi.fn();
    render(<ChatComposer onSend={onSend} />, { wrapper });
    await userEvent.type(screen.getByRole("textbox"), "hi");
    await userEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(onSend).toHaveBeenCalledWith({ text: "hi", files: [] });
  });

  it("attaches files, lists them, removes one and sends the rest", async () => {
    const onSend = vi.fn();
    const { container } = render(<ChatComposer onSend={onSend} attach />, { wrapper });
    const input = container.querySelector("input[type='file']") as HTMLInputElement;
    const a = new File(["a"], "a.png", { type: "image/png" });
    const b = new File(["b"], "b.pdf", { type: "application/pdf" });
    await userEvent.upload(input, [a, b]);
    expect(screen.getByText("a.png")).toBeTruthy();
    await userEvent.click(screen.getByRole("button", { name: "Remove a.png" }));
    expect(screen.queryByText("a.png")).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(onSend).toHaveBeenCalledWith({ text: "", files: [b] });
    expect(screen.queryByText("b.pdf")).toBeNull();
  });

  it("has no attach button unless asked", () => {
    render(<ChatComposer onSend={() => {}} />, { wrapper });
    expect(screen.queryByRole("button", { name: "Attach files" })).toBeNull();
  });

  it("follows a controlled value", async () => {
    const onValueChange = vi.fn();
    const { rerender } = render(
      <ChatComposer onSend={() => {}} value="draft" onValueChange={onValueChange} />,
    );
    const field = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(field.value).toBe("draft");
    await userEvent.type(field, "!");
    expect(onValueChange).toHaveBeenLastCalledWith("draft!");
    rerender(<ChatComposer onSend={() => {}} value="reset" onValueChange={onValueChange} />);
    expect(field.value).toBe("reset");
  });

  it("has no axe violations", async () => {
    const { container } = render(<ChatComposer onSend={() => {}} attach />, { wrapper });
    await expectNoAxeViolations(container);
  });
});

describe("TypingIndicator", () => {
  it("is a status with a visible label", () => {
    render(<TypingIndicator label="Ana is typing" />);
    expect(screen.getByRole("status").textContent).toBe("Ana is typing");
  });

  it("falls back to a screen-reader label", () => {
    render(<TypingIndicator aria-label="Assistant is replying" />);
    expect(screen.getByRole("status").textContent).toBe("Assistant is replying");
  });
});

describe("ConversationItem", () => {
  it("is a button that opens the conversation", async () => {
    const onClick = vi.fn();
    render(<ConversationItem name="Ana" preview="See you" onClick={onClick} />);
    const button = screen.getByRole("button");
    expect(button.getAttribute("type")).toBe("button");
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("is a link with href, marked current when selected", () => {
    render(<ConversationItem name="Ana" href="/chat/ana" selected />);
    expect(screen.getByRole("link").getAttribute("aria-current")).toBe("page");
  });

  it("announces the unread count and caps what it shows", () => {
    const { rerender } = render(<ConversationItem name="Ana" unread={3} onClick={() => {}} />);
    expect(screen.getByText("3 unread messages")).toBeTruthy();
    rerender(<ConversationItem name="Ana" unread={150} onClick={() => {}} />);
    expect(screen.getByText("99+")).toBeTruthy();
    rerender(<ConversationItem name="Ana" unread onClick={() => {}} />);
    expect(screen.getByText("Unread")).toBeTruthy();
    rerender(<ConversationItem name="Ana" unread={0} onClick={() => {}} />);
    expect(screen.queryByText(/unread/i)).toBeNull();
  });

  it("shows typing in place of the preview", () => {
    render(<ConversationItem name="Ana" preview="See you" typing onClick={() => {}} />);
    expect(screen.getByText("typing…")).toBeTruthy();
    expect(screen.queryByText("See you")).toBeNull();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <ConversationItem
        name="Ana"
        preview="See you"
        time="9:05"
        unread={2}
        avatarProps={{ value: "A" }}
        onClick={() => {}}
      />,
    );
    await expectNoAxeViolations(container);
  });
});

describe("formatChatTime", () => {
  const now = new Date(2026, 9, 17, 18, 0);

  it("shows the time for today", () => {
    expect(formatChatTime(new Date(2026, 9, 17, 9, 5), true, now)).toMatch(/9.05/);
  });

  it("shows the weekday within the week and the date before that", () => {
    const weekday = new Date(2026, 9, 15, 9, 5);
    expect(formatChatTime(weekday, true, now)).toBe(
      weekday.toLocaleDateString([], { weekday: "short" }),
    );
    const older = new Date(2026, 8, 1, 9, 5);
    expect(formatChatTime(older, true, now)).toBe(
      older.toLocaleDateString([], { month: "short", day: "numeric" }),
    );
  });
});
