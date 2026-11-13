import { LayoutProvider, ToastProvider } from "@once-ui-system/core";
import { render, screen, waitFor, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import type React from "react";
import { describe, expect, it, vi } from "vitest";
import {
  type AccountAdapter,
  AccountSettings,
  createDemoAccountAdapter,
  createDemoOrganizationAdapter,
  OrganizationSettings,
  SecuritySettings,
  SettingsLayout,
  settingsLabelsHu,
} from "../index.js";
import { expectNoAxeViolations } from "../test/axe.js";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>
    <ToastProvider>{children}</ToastProvider>
  </LayoutProvider>
);

const demo = (overrides: Partial<AccountAdapter> = {}) => ({
  ...createDemoAccountAdapter({ latency: 0 }),
  ...overrides,
});

/**
 * The settings blocks read and write through an adapter. A row shows only
 * when the adapter can do what it needs; each change saves on its own; and a
 * sensitive change asks for the current password first.
 */
describe("AccountSettings", () => {
  it("shows the account's values at rest, with no fields open", async () => {
    const { container } = render(<AccountSettings adapter={demo()} />, { wrapper: wrap });
    expect(await screen.findByText("Mira Kovács")).toBeInTheDocument();
    expect(screen.getByText("mira@halden.example")).toBeInTheDocument();
    expect(screen.getByText("Verified")).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).toBeNull();
    await expectNoAxeViolations(container);
  });

  it("edits one field inline: Enter saves through the adapter, Escape puts it back", async () => {
    const user = userEvent.setup();
    const adapter = demo();
    const updateProfile = vi.spyOn(adapter, "updateProfile");
    render(<AccountSettings adapter={adapter} />, { wrapper: wrap });
    await screen.findByText("Mira Kovács");

    await user.click(screen.getAllByRole("button", { name: "Edit" })[0]);
    const field = screen.getByRole("textbox");
    expect(field).toHaveValue("Mira Kovács");
    await user.type(field, "{Escape}");
    expect(screen.queryByRole("textbox")).toBeNull();
    expect(updateProfile).not.toHaveBeenCalled();

    await user.click(screen.getAllByRole("button", { name: "Edit" })[0]);
    await user.clear(screen.getByRole("textbox"));
    await user.type(screen.getByRole("textbox"), "Mira K.{Enter}");
    await waitFor(() => expect(updateProfile).toHaveBeenCalledWith({ name: "Mira K." }));
    expect(await screen.findByText("Mira K.")).toBeInTheDocument();
  });

  it("hides what the adapter cannot do", async () => {
    const adapter: AccountAdapter = {
      getAccount: async () => ({ id: "1", email: "a@b.example", name: "Ada" }),
    };
    render(<AccountSettings adapter={adapter} />, { wrapper: wrap });
    await screen.findByText("Ada");
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("changes the email only with the current password, and shows it pending", async () => {
    const user = userEvent.setup();
    const adapter = demo();
    const changeEmail = vi.spyOn(adapter, "changeEmail");
    render(<AccountSettings adapter={adapter} />, { wrapper: wrap });
    await screen.findByText("Mira Kovács");
    await user.click(screen.getByRole("button", { name: "Change" }));

    const dialog = await screen.findByRole("dialog");
    const send = within(dialog).getByRole("button", { name: "Send link" });
    await user.type(within(dialog).getByLabelText("New email"), "mira@new.example");
    expect(send).toBeDisabled();
    await user.type(within(dialog).getByLabelText("Current password"), "secret-pass");
    await user.click(send);
    await waitFor(() =>
      expect(changeEmail).toHaveBeenCalledWith("mira@new.example", { password: "secret-pass" }),
    );
    expect(
      await screen.findByText("Waiting for confirmation from mira@new.example"),
    ).toBeInTheDocument();
  });
});

describe("SecuritySettings", () => {
  it("sets up two-step verification in three steps and shows the backup codes", async () => {
    const user = userEvent.setup();
    render(<SecuritySettings adapter={demo()} />, { wrapper: wrap });
    await user.click(await screen.findByRole("button", { name: "Set up" }));

    let dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Step 1 of 3")).toBeInTheDocument();
    await user.type(within(dialog).getByLabelText("Current password"), "secret-pass");
    await user.click(within(dialog).getByRole("button", { name: "Next" }));
    expect(await within(dialog).findByText("JBSW Y3DP EHPK 3PXP")).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: "Next" }));

    dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Step 2 of 3")).toBeInTheDocument();
    await user.keyboard("123456");

    dialog = await screen.findByRole("dialog", { name: "Save your backup codes" });
    expect(within(dialog).getByText("7Q2K-9XRM")).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: "Done" }));
    expect(await screen.findByText("On")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Turn off" })).toBeInTheDocument();
  });

  it("lists signed-in devices and signs out the others", async () => {
    const user = userEvent.setup();
    render(<SecuritySettings adapter={demo()} />, { wrapper: wrap });
    expect(await screen.findByText("Safari on iPhone")).toBeInTheDocument();
    expect(screen.getByText("This device")).toBeInTheDocument();
    const buttons = screen.getAllByRole("button", { name: /sign out/i });
    await user.click(buttons[buttons.length - 1]);
    await waitFor(() => expect(screen.queryByText("Safari on iPhone")).toBeNull());
  });

  it("keeps the only way in connected", async () => {
    render(
      <SecuritySettings
        adapter={demo({
          getAccount: async () => ({ id: "1", email: "a@b.example", hasPassword: false }),
        })}
      />,
      { wrapper: wrap },
    );
    expect(await screen.findByRole("button", { name: "Disconnect" })).toBeDisabled();
  });

  it("shows only 'sign out everywhere else' when sessions cannot be listed", async () => {
    render(<SecuritySettings adapter={demo({ sessions: { revokeOthers: async () => {} } })} />, {
      wrapper: wrap,
    });
    expect(await screen.findByText("Sign out everywhere else")).toBeInTheDocument();
    expect(screen.queryByText("This device")).toBeNull();
  });
});

describe("OrganizationSettings", () => {
  it("deletes only after the address is typed", async () => {
    const user = userEvent.setup();
    const adapter = createDemoOrganizationAdapter({ latency: 0 });
    const remove = vi.spyOn(adapter, "delete");
    const onGone = vi.fn();
    render(<OrganizationSettings adapter={adapter} onGone={onGone} />, { wrapper: wrap });
    await user.click(await screen.findByRole("button", { name: "Delete organization" }));
    const dialog = await screen.findByRole("dialog");
    const confirm = within(dialog).getByRole("button", { name: "Delete organization" });
    expect(confirm).toBeDisabled();
    await user.type(within(dialog).getByLabelText("Type halden to confirm"), "halden");
    await user.click(confirm);
    await waitFor(() => expect(remove).toHaveBeenCalled());
    expect(onGone).toHaveBeenCalled();
  });

  it("is read only for members, who may leave but not delete", async () => {
    render(
      <OrganizationSettings
        adapter={createDemoOrganizationAdapter({ latency: 0, organization: { role: "member" } })}
      />,
      { wrapper: wrap },
    );
    expect(await screen.findByText("Halden & Co")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Edit" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Upload" })).toBeNull();
    expect(screen.getByRole("button", { name: "Leave organization" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Delete organization" })).toBeNull();
  });
});

describe("SettingsLayout", () => {
  it("puts the sections in a vertical tab list and passes its labels to every block", async () => {
    const user = userEvent.setup();
    const account = demo();
    render(
      <SettingsLayout
        labels={settingsLabelsHu}
        sections={[
          {
            value: "profile",
            label: "Profil",
            icon: "person",
            content: <AccountSettings adapter={account} />,
          },
          {
            value: "security",
            label: "Biztonság",
            icon: "security",
            content: <SecuritySettings adapter={account} />,
          },
        ]}
      />,
      { wrapper: wrap },
    );
    const list = screen.getByRole("tablist", { name: "Beállítások" });
    expect(list).toHaveAttribute("aria-orientation", "vertical");
    expect(await screen.findByText("Megerősítve")).toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: "Biztonság" }));
    expect(await screen.findByRole("button", { name: "Beállítás" })).toBeVisible();
  });
});
