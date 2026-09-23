import { Column, IconButton } from "@once-ui-system/core";

export const Sidebar3: React.FC<React.ComponentProps<typeof Column>> = ({ ...flex }) => {
  return (
    <Column data-scaling="105" paddingY="12" center as="nav" gap="12" {...flex}>
      <IconButton size="l" tooltipPosition="right" tooltip="Home" icon="home" />
      <IconButton size="l" variant="ghost" tooltipPosition="right" tooltip="Search" icon="search" />
      <IconButton
        size="l"
        variant="ghost"
        tooltipPosition="right"
        tooltip="Explore"
        icon="europe"
      />
      <IconButton
        size="l"
        variant="ghost"
        tooltipPosition="right"
        tooltip="Profile"
        icon="person"
      />
      <IconButton
        size="l"
        variant="ghost"
        tooltipPosition="right"
        tooltip="Conversation"
        icon="chat"
      />
      <IconButton
        size="l"
        variant="ghost"
        tooltipPosition="right"
        tooltip="Notifications"
        icon="bell"
      />
    </Column>
  );
};
