"use client";

import { Column, Row, Heading, Input, Text, Button, PasswordInput, Icon, IconButton } from "@once-ui-system/core";
import { MediaUpload } from "@once-ui-system/core/media";
import { useState } from "react";

function General() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("lorant@once-ui.com");
  const [password, setPassword] = useState("password");
  const [avatar, setAvatar] = useState("/images/lorant.jpg");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  return (
    <Column fillWidth gap="-1">
      <Row fillWidth gap="20" paddingY="24" paddingLeft="16" paddingRight="24" topRadius="l" border="neutral-alpha-medium" background="surface" s={{direction: "column"}}>
        <Column fillWidth gap="2" vertical="center" paddingLeft="12">
          <Heading as="h2" variant="heading-strong-xs">
            Avatar
          </Heading>
          <Text variant="label-default-s" onBackground="neutral-weak">
            Upload your public avatar
          </Text>
        </Column>
        <MediaUpload minWidth={4} maxWidth={4} minHeight={4} maxHeight={4} radius="full"
          initialPreviewImage={avatar}
          emptyState={
            <Row gap="4" vertical="center">
              <Icon size="xs" name="plus" />
              <Text variant="label-default-s">Add</Text>
            </Row>
          } />
      </Row>
      <Row fillWidth gap="20" paddingY="24" paddingLeft="16" paddingRight="24" border="neutral-alpha-medium" background="surface" s={{direction: "column"}}>
        <Column fillWidth gap="2" vertical="center" paddingLeft="12">
          <Heading as="h2" variant="heading-strong-xs">
            Name
          </Heading>
          <Text variant="label-default-s" onBackground="neutral-weak">
            Change your name
          </Text>
        </Column>
        {isEditingName ? (
          <Row maxWidth={20} vertical="center" gap="8">
            <Input
              id="name" size="s"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
            />
            <Button size="s" label="Save" onClick={() => setIsEditingName(false)} />
          </Row>
        ) : (
          <Row vertical="center" gap="24" minHeight="48">
            <Text variant="label-default-s" onBackground="neutral-weak" wrap="nowrap">{name}</Text>
            <IconButton variant="secondary" icon="edit" onClick={() => setIsEditingName(true)} />
          </Row>
        )}
      </Row>
      <Row fillWidth gap="20" paddingY="24" paddingLeft="16" paddingRight="24" border="neutral-alpha-medium" background="surface" s={{direction: "column"}}>
        <Column fillWidth gap="2" vertical="center" paddingLeft="12">
          <Heading as="h2" variant="heading-strong-xs">
            Email
          </Heading>
          <Text variant="label-default-s" onBackground="neutral-weak">
            Change your email address
          </Text>
        </Column>
        {isEditingEmail ? (
          <Row maxWidth={20} vertical="center" gap="8">
            <Input
              id="email" size="s"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={64}
            />
            <Button size="s" label="Save" onClick={() => setIsEditingEmail(false)} />
          </Row>
        ) : (
          <Row vertical="center" gap="24" minHeight="48">
            <Text variant="label-default-s" onBackground="neutral-weak" wrap="nowrap">{email}</Text>
            <IconButton variant="secondary" icon="edit" onClick={() => setIsEditingEmail(true)} />
          </Row>
        )}
      </Row>
      <Row fillWidth gap="20" paddingY="24" paddingLeft="16" paddingRight="24" border="neutral-alpha-medium" background="surface" s={{direction: "column"}}>
        <Column fillWidth gap="2" vertical="center" paddingLeft="12">
          <Heading as="h2" variant="heading-strong-xs">
            Password
          </Heading>
          <Text variant="label-default-s" onBackground="neutral-weak">
            Change your password
          </Text>
        </Column>
        {isEditingPassword ? (
          <Row maxWidth={20} vertical="center" gap="8">
            <PasswordInput
              id="password" size="s"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              maxLength={64}
            />
            <Button size="s" label="Save" onClick={() => setIsEditingPassword(false)} />
          </Row>
        ) : (
          <Row minHeight="48">
            <IconButton variant="secondary" icon="edit" onClick={() => setIsEditingPassword(true)} />
          </Row>
        )}
      </Row>
      <Row fillWidth gap="20" paddingY="24" paddingLeft="16" paddingRight="24" bottomRadius="l" border="danger-alpha-medium" background="danger-medium" s={{direction: "column"}}>
        <Column fillWidth gap="2" vertical="center" paddingLeft="12">
          <Heading as="h2" variant="heading-strong-xs">
            Delete account
          </Heading>
          <Text variant="label-default-s" onBackground="danger-weak">
            Permanently delete your account
          </Text>
        </Column>
        <Button size="s" label="Delete" variant="danger"/>
      </Row>
    </Column>
  );
}

export { General };
