import {
  Row,
  Icon,
  IconButton,
  Button,
  Text,
  AvatarGroup,
  Column,
  Card,
} from "@once-ui-system/core";
import { Sidebar2 } from "./Sidebar2";

const issues = [
  {
    title: "To do",
    tasks: [
      {
        title: "Fix login bug",
        description: "Implement new authentication flow with OAuth2",
        assignee: { avatars: ["/images/avatars/07.png"] },
        project: "Frontend",
        issuetype: "Bug",
        issueColor: "danger-strong",
      },
      {
        title: "Design new UI",
        description: "Add responsive layouts and improve mobile experience",
        assignee: { avatars: ["/images/avatars/08.png"] },
        project: "Frontend",
        issuetype: "Feature",
        issueColor: "brand-strong",
      },
      {
        title: "Update database schema",
        description: "Create comprehensive test suite for authentication system",
        assignee: {
          avatars: ["/images/avatars/05.png", "/images/avatars/04.png"],
        },
        project: "Backend",
        issuetype: "Feature",
        issueColor: "brand-strong",
      },
    ],
  },
  {
    title: "In progress",
    tasks: [
      {
        title: "Write unit tests",
        description: "Integrate and test Stripe payment processing",
        assignee: { avatars: ["/images/avatars/05.png"] },
        project: "Backend",
        issuetype: "Tech",
        issueColor: "accent-strong",
      },
      {
        title: "Test payment gateway",
        description: "Implement code splitting and lazy loading",
        assignee: { avatars: ["/images/avatars/02.png"] },
        project: "Frontend",
        issuetype: "Bug",
        issueColor: "danger-strong",
      },
      {
        title: "Optimize performance",
        description: "Configure 2FA and update password policies",
        assignee: { avatars: ["/images/avatars/01.png"] },
        project: "Frontend",
        issuetype: "Feature",
        issueColor: "brand-strong",
      },
      {
        title: "Update security settings",
        description: "Design and implement user onboarding wizard",
        assignee: {
          avatars: ["/images/avatars/06.png", "/images/avatars/05.png"],
        },
        project: "Backend",
        issuetype: "Feature",
        issueColor: "brand-strong",
      },
      {
        title: "Complete onboarding flow",
        description: "Fix responsive layout issues on mobile devices",
        assignee: { avatars: ["/images/avatars/04.png"] },
        project: "Website",
        issuetype: "Feature",
        issueColor: "brand-strong",
      },
      {
        title: "Fix CSS issues",
        description: "Set up AWS infrastructure and deploy application",
        assignee: {
          avatars: ["/images/avatars/03.png", "/images/avatars/02.png"],
        },
        project: "Frontend",
        issuetype: "Bug",
        issueColor: "danger-strong",
      },
    ],
  },
  {
    title: "Done",
    tasks: [
      {
        title: "Deploy to production",
        description: "Update API documentation and usage examples",
        assignee: { avatars: ["/images/avatars/02.png"] },
        project: "Backend",
        issuetype: "Feature",
        issueColor: "brand-strong",
      },
      {
        title: "Update documentation",
        description: "Set up automated testing and deployment workflow",
        assignee: { avatars: ["/images/avatars/03.png"] },
        project: "Frontend",
        issuetype: "Bug",
        issueColor: "danger-strong",
      },
      {
        title: "Implement CI/CD pipeline",
        description: "Configure Jenkins pipeline with automated testing",
        assignee: {
          avatars: ["/images/avatars/02.png", "/images/avatars/07.png"],
        },
        project: "Platform",
        issuetype: "Tech",
        issueColor: "accent-strong",
      },
      {
        title: "Implement CI/CD pipeline",
        description: "Configure Jenkins pipeline with automated testing",
        assignee: {
          avatars: ["/images/avatars/02.png", "/images/avatars/07.png"],
        },
        project: "Platform",
        issuetype: "Tech",
        issueColor: "accent-strong",
      },
    ],
  },
];

export const Productivity1 = () => {
  return (
    <Row fillWidth paddingX="8" gap="m">
      <Sidebar2 position="sticky"/>
      <Column fillWidth>
        <Row
          as="header"
          paddingY="12"
          paddingLeft="16"
          paddingRight="8"
          fillWidth
          vertical="center"
          horizontal="between"
        >
          <Row fillWidth>
            <Text variant="body-strong-m" onBackground="neutral-strong">
              Platform Squad
            </Text>
          </Row>
          <Row gap="12" vertical="center" horizontal="end" fillWidth zIndex={1}>
            <IconButton
              data-border="rounded"
              variant="ghost"
              tooltip="Search"
              tooltipPosition="bottom"
              icon="search"
            />
            <Row>
              <IconButton
                data-border="rounded"
                variant="ghost"
                tooltip="Notifications"
                tooltipPosition="bottom"
                icon="bell"
              />
              <Row
                position="absolute"
                style={{
                  top: "0.15rem",
                  right: "0.15rem",
                }}
              >
                <Row
                  style={{ borderColor: "var(--page-background)" }}
                  height="12"
                  width="12"
                  solid="brand-strong"
                  radius="full"
                />
              </Row>
            </Row>
            <div
              style={{
                width: "1px",
                margin: "0 var(--static-space-8)",
                height: "1.5rem",
                backgroundColor: "var(--neutral-border-medium",
              }}
            ></div>
            <Button size="s" variant="secondary" label="New project" prefixIcon="plus" />
          </Row>
        </Row>
        <Row
          fillWidth
          paddingBottom="12"
          paddingRight="8"
          paddingLeft="16"
          horizontal="between"
        >
          <AvatarGroup
            avatars={[
              { src: "/images/avatars/01.png", size: "s" },
              { src: "/images/avatars/02.png", size: "s" },
              { src: "/images/avatars/03.png", size: "s" },
              { src: "/images/avatars/04.png", size: "s" },
              { src: "/images/avatars/05.png", size: "s" },
              { value: "3", size: "s" },
            ]}
            reverse
          />
          <Row gap="8" s={{hide: true}}>
            <Button variant="tertiary" size="s" label="Filter" prefixIcon="trend" />
            <Button
              variant="tertiary"
              size="s"
              label="Display"
              prefixIcon="adjustments"
            />
          </Row>
        </Row>
        <Row fillWidth gap="8" overflowX="auto">
          {issues.map((column, index) => (
            <Column
              key={index}
              minWidth={20}
              border="neutral-alpha-weak"
              fillWidth
              paddingX="4"
              radius="m-4"
              background="overlay"
            >
              <Row paddingY="8" paddingX="12" fillWidth horizontal="between">
                <Row textVariant="body-default-s" gap="8" vertical="center">
                  <Text>{column.title}</Text>
                  <Text onBackground="neutral-weak">{column.tasks.length}</Text>
                </Row>
                <Row gap="4">
                  <IconButton
                    data-border="rounded"
                    variant="ghost"
                    tooltip="More actions"
                    size="s"
                    tooltipPosition="left"
                    icon="moreHorizontal"
                  />
                  <IconButton
                    data-border="rounded"
                    variant="ghost"
                    tooltip="Add task"
                    size="s"
                    tooltipPosition="left"
                    icon="plus"
                  />
                </Row>
              </Row>
              {column.tasks.map((task, index) => (
                <Card
                  key={index}
                  fillWidth
                  direction="column"
                  radius="m"
                  padding="12"
                  gap="8"
                  marginBottom="4"
                >
                  <Row horizontal="between" vertical="center">
                    <Text variant="label-default-s">{task.title}</Text>
                    <AvatarGroup
                      avatars={task.assignee.avatars.map((src) => ({ src, size: "xs" }))}
                    />
                  </Row>
                  <Text onBackground="neutral-weak" variant="label-default-s">
                    {task.description}
                  </Text>
                  <Row gap="4" paddingTop="8" vertical="center" horizontal="between">
                    <Row vertical="center" fillWidth gap="8">
                      <Icon name="code" size="xs" />
                      <Text variant="body-default-xs" onBackground="neutral-weak">
                        {task.project}
                      </Text>
                    </Row>
                    <Row vertical="center" gap="8" paddingRight="4">
                      <Text variant="body-default-xs" onBackground="neutral-weak">
                        {task.issuetype}
                      </Text>
                      <Row
                        radius="full"
                        height="8"
                        width="8"
                        solid={
                          task.issueColor as "brand-strong" | "accent-strong" | "danger-strong"
                        }
                      />
                    </Row>
                  </Row>
                </Card>
              ))}
            </Column>
          ))}
        </Row>
      </Column>
    </Row>
  );
};