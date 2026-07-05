import { Card, Column, Heading, Row, Schemes, StatusIndicator, Text, User } from "@once-ui-system/core";
import { roadmap, task } from "./content/roadmap1content";

export interface Task {
  title: string;
  description?: string;
  user?: {
    name?: string;
    avatar?: string;
  };
  href?: string;
  type?: keyof typeof task;
}

const RoadmapTask = ({ task: taskItem }: { task: Task }) => (
  <Column gap="8" fillWidth>
    <Text align="left" onBackground="neutral-strong" variant="body-strong-m">
      {taskItem.title}
    </Text>
    
    {taskItem.description && (
      <Text align="left" variant="body-default-s" onBackground="neutral-weak">
        {taskItem.description}
      </Text>
    )}
    
    {(taskItem.user || taskItem.type) && (
        <Row marginTop="8" fillWidth vertical="center" horizontal="between">
          {taskItem.user && (
            <User
              avatarProps={{ 
                size: "s",
                src: taskItem.user.avatar,
                empty: !taskItem.user.avatar
            }}
          >
            <Row paddingLeft="4" textVariant="label-default-s">
              {taskItem.user.name}
            </Row>
          </User>
        )}
        {taskItem.type && (
          <Row vertical="center" gap="8">
            <StatusIndicator 
              color={task[taskItem.type].color as Schemes}
            />
            <Text onBackground="neutral-weak" variant="label-default-s">{task[taskItem.type].label}</Text>
          </Row>
        )}
      </Row>
    )}
  </Column>
);

export function Roadmap1() {
  return (
    <Column maxWidth="l" as="main">
      <Column fillWidth gap="12" paddingBottom="l" paddingX="8">
        <Heading variant="display-strong-s">
          Roadmap
        </Heading>
        <Text wrap="balance" onBackground="neutral-weak" variant="body-default-xl" marginBottom="20">
          List of features planned for Q4 2025
        </Text>
      </Column>

      {roadmap.map((product, productIndex) => (
        <Column key={productIndex} gap="24" marginTop={productIndex > 0 ? "48" : "0"} fillWidth>
          {product.product && (
            <Row gap="16" marginBottom="16" vertical="center" fillWidth>
              <Row minWidth="40" width="40" height="40" padding="8" vertical="center">
                <Row radius="full" fillWidth minHeight="4" solid="brand-medium" data-brand={product.brand as Schemes} data-solid="inverse"/>
              </Row>
              <Heading as="h2" variant="display-default-xs">
                {product.product}
              </Heading>
            </Row>
          )}
          
          <Row gap="4" fillWidth overflowX="auto" paddingBottom="16">
            {product.columns.map((column, columnIndex) => (
              <Column key={columnIndex} padding="4" gap="4" radius="s-4" border="neutral-alpha-weak" background="overlay" fillWidth minWidth={20}>
                <Row fillWidth vertical="center" gap="8" paddingY="8" paddingX="16">
                  <Text variant="label-default-m">
                    {column.title}
                  </Text>
                  <Text variant="label-default-s" onBackground="neutral-weak">
                    {column.tasks.length}
                  </Text>
                </Row>
                
                <Column gap="4" fillWidth>
                  {column.tasks.map((taskItem, taskIndex) => {
                    const typedTask: Task = {
                      ...taskItem,
                      type: taskItem.type as keyof typeof task
                    };
                    
                    return typedTask.href ? (
                      <Card
                        onBackground="neutral-strong"
                        border="neutral-alpha-weak"
                        fillWidth
                        radius="s"
                        key={taskIndex} 
                        href={typedTask.href}
                        padding="16"
                      >
                        <RoadmapTask task={typedTask} />
                      </Card>
                    ) : (
                      <Column
                        onBackground="neutral-strong"
                        border="neutral-alpha-weak"
                        fillWidth
                        radius="s"
                        key={taskIndex}
                        padding="16"
                        gap="8"
                      >
                        <RoadmapTask task={typedTask} />
                      </Column>
                    );
                  })}
                </Column>
              </Column>
            ))}
          </Row>
        </Column>
      ))}
    </Column>
  );
}