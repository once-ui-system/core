import { Screen } from "../../../components/Screen";

// A screen inside the Settings group of src/resources/app.ts. `back` adds the
// button that returns to the Settings list.
export default function ProfileScreen() {
  return <Screen title="Profile" description="Your name and email." back />;
}
