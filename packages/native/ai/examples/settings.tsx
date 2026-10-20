/**
 * Gold example: settings
 * Target: a profile header, sections of settings rows with one control
 * each, a picker that opens a sheet, an edit sheet with a form, and a
 * confirmed sign-out at the end.
 */

import {
  Avatar,
  Button,
  Column,
  Dialog,
  Feedback,
  Heading,
  Input,
  Line,
  Row,
  Select,
  Switch,
  Text,
  useToast,
} from "@once-ui-system/native";
import { type ReactNode, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Column gap="8">
      <Text textVariant="label-default-s" onBackground="neutral-weak">
        {title}
      </Text>
      <Column background="surface" border="neutral-alpha-weak" radius="l" paddingX="16">
        {children}
      </Column>
    </Column>
  );
}

export function SettingsScreen() {
  const { addToast } = useToast();
  const [name, setName] = useState("Anna Kovács");
  const [draft, setDraft] = useState(name);
  const [editing, setEditing] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [push, setPush] = useState(true);
  const [email, setEmail] = useState(false);
  const [language, setLanguage] = useState("en");

  return (
    <Column fill background="page" safeArea={["top"]}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Column paddingX="20" paddingY="24" gap="24">
          <Heading textVariant="heading-strong-xl">Account</Heading>

          <Row gap="16" vertical="center">
            <Avatar value="AK" size="l" />
            <Column flex={1} gap="2">
              <Text textVariant="heading-strong-s">{name}</Text>
              <Text textVariant="body-default-s" onBackground="neutral-weak">
                Member since March
              </Text>
            </Column>
            <Button
              variant="secondary"
              size="s"
              label="Edit"
              onPress={() => {
                setDraft(name);
                setEditing(true);
              }}
            />
          </Row>

          <Section title="Notifications">
            <Column paddingY="12">
              <Switch
                reverse
                label="Push notifications"
                description="When your order is ready"
                checked={push}
                onCheckedChange={setPush}
              />
            </Column>
            <Line />
            <Column paddingY="12">
              <Switch
                reverse
                label="Offers by email"
                description="At most one a week"
                checked={email}
                onCheckedChange={setEmail}
              />
            </Column>
          </Section>

          <Section title="Preferences">
            <Column paddingY="12">
              <Select
                label="Language"
                value={language}
                onValueChange={(value) => setLanguage(value as string)}
                options={[
                  { value: "en", label: "English" },
                  { value: "hu", label: "Magyar" },
                  { value: "de", label: "Deutsch" },
                ]}
              />
            </Column>
          </Section>

          {!push && (
            <Feedback
              tone="warning"
              title="Notifications are off"
              description="You will not hear when an order is ready."
            />
          )}

          <Button
            variant="secondary"
            tone="danger"
            label="Sign out"
            prefixIcon="logout"
            fillWidth
            onPress={() => setSigningOut(true)}
          />
        </Column>
      </ScrollView>

      <Dialog
        open={editing}
        onClose={() => setEditing(false)}
        title="Edit profile"
        footer={
          <Row gap="12" fillWidth>
            <Button
              variant="secondary"
              label="Cancel"
              fillWidth
              onPress={() => setEditing(false)}
            />
            <Button
              label="Save"
              fillWidth
              disabled={!draft.trim()}
              onPress={() => {
                setName(draft.trim());
                setEditing(false);
                addToast({ tone: "success", message: "Profile saved" });
              }}
            />
          </Row>
        }
      >
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <Column gap="16" paddingY="8">
            <Input
              label="Name"
              value={draft}
              onValueChange={setDraft}
              error={!draft.trim()}
              errorMessage="Enter your name"
            />
            <Input label="Email" type="email" defaultValue="anna@example.com" />
          </Column>
        </KeyboardAvoidingView>
      </Dialog>

      <Dialog
        open={signingOut}
        onClose={() => setSigningOut(false)}
        title="Sign out?"
        description="Your stamps stay on your card."
        footer={
          <Row gap="12" fillWidth>
            <Button
              variant="secondary"
              label="Cancel"
              fillWidth
              onPress={() => setSigningOut(false)}
            />
            <Button tone="danger" label="Sign out" fillWidth onPress={() => setSigningOut(false)} />
          </Row>
        }
      />
    </Column>
  );
}
