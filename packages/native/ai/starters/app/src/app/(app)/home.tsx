import { Screen } from "../../components/Screen";

// A screen inside the shell: Screen draws the header and scrolls, so a screen
// is just its content, passed as children.
export default function HomeScreen() {
  return <Screen title="Home" description="What this screen is for, in one line." />;
}
