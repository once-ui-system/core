import { useState } from "react";
import { ScrollView } from "react-native";
import {
  Column,
  Field,
  Fieldset,
  Form,
  FormErrorSummary,
  Heading,
  Input,
  Select,
  SubmitButton,
  Switch,
  Text,
  Textarea,
  useTheme,
} from "../src";

/** A booking form: Form, Field, Fieldset, SubmitButton and FormErrorSummary. */
export function Booking({ errors: showErrors = false }: { errors?: boolean }) {
  const theme = useTheme();
  const [party, setParty] = useState("2");
  const [errors, setErrors] = useState<Record<string, string>>(
    showErrors ? { email: "Enter an email so we can confirm" } : {},
  );
  return (
    <ScrollView style={{ backgroundColor: theme.color("page-background") }}>
      <Column padding="20" gap="24" safeArea={["top"]}>
        <Column gap="4">
          <Heading variant="heading-strong-l">Book a table</Heading>
          <Text variant="body-default-s" onBackground="neutral-weak">
            Morning Coffee, Kazinczy utca 14
          </Text>
        </Column>
        <Form
          as="form"
          density="spacious"
          onSubmit={async () => {
            await new Promise((done) => setTimeout(done, 1200));
            setErrors({ email: "Enter an email so we can confirm" });
          }}
        >
          <FormErrorSummary errors={errors} />
          <Fieldset legend="Your details" density="stacked">
            <Input label="Name" defaultValue="Anna Kovács" />
            <Input label="Phone" defaultValue="+36 30 123 4567" />
            <Field error={errors.email} hint="We send the confirmation here." required>
              <Input label="Email" />
            </Field>
          </Fieldset>
          <Fieldset legend="Visit" columns={2}>
            <Select
              label="Party"
              value={party}
              onSelect={(v) => setParty(String(v))}
              options={["1", "2", "3", "4", "5", "6"].map((n) => ({ value: n, label: n }))}
            />
            <Input label="Time" defaultValue="19:30" />
            <Field span={2}>
              <Textarea label="Notes" placeholder="Allergies, high chair, a window seat…" />
            </Field>
          </Fieldset>
          <Switch label="Remind me the day before" defaultChecked />
          <SubmitButton label="Book table" pendingLabel="Booking…" fillWidth size="l" />
        </Form>
      </Column>
    </ScrollView>
  );
}
