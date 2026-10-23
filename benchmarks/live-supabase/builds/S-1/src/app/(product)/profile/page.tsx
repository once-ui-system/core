"use client";

import { Column, Text, Button, Spinner, Row, Icon, Dialog, Input, Textarea } from "@once-ui-system/core";
import { MediaUpload } from "@once-ui-system/core/media";
import { useUser } from "@/components/UserProvider";
import { apiErrorMessage } from "@/lib/api-error-message";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { validation } from "@/resources/validation";

export default function Profile() {
  const { loading, error, profile, userEmail, refresh, roleRank, roleId } = useUser();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editField, setEditField] = useState<null | "username" | "bio">(null);
  const [formValue, setFormValue] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const hasRetriedRef = useRef(false);

  // One-time silent retry to avoid transient error right after login redirect
  useEffect(() => {
    if (!loading && !profile && error && !hasRetriedRef.current) {
      hasRetriedRef.current = true;
      setRetrying(true);
      const t = setTimeout(async () => {
        try {
          await refresh();
        } finally {
          setRetrying(false);
        }
      }, 250);
      return () => clearTimeout(t);
    }
  }, [loading, profile, error, refresh]);

  const openEditor = useCallback((field: "username" | "bio") => {
    setEditField(field);
    setFormValue(field === "username" ? (profile?.username ?? "") : (profile?.bio ?? ""));
    setSaveError(null);
    setIsDialogOpen(true);
  }, [profile?.bio, profile?.username]);

  const title = useMemo(() => {
    if (editField === "username") return "Edit username";
    if (editField === "bio") return "Edit bio";
    return "Edit";
  }, [editField]);

  const handleAvatarFile = useCallback(async (file: File) => {
    try {
      setUploadingAvatar(true);
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/profile/avatar", { method: "POST", body: fd, credentials: "include" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(apiErrorMessage(body, `Upload failed (${res.status})`));
      }
      await refresh();
    } catch (e) {
      // surface minimal error feedback in helper text area
      console.error("Avatar upload failed", e);
    } finally {
      setUploadingAvatar(false);
    }
  }, [refresh]);


  const handleSave = useCallback(async () => {
    if (!editField) return;
    try {
      setSaving(true);
      setSaveError(null);
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [editField]: formValue }),
        credentials: "include",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(apiErrorMessage(body, `Failed to update (${res.status})`));
      }
      await refresh();
      setIsDialogOpen(false);
      setEditField(null);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  }, [editField, formValue, refresh]);

  return (
    <>
      <Column fill horizontal="center" paddingX="l" paddingTop="64">
        <Column maxWidth="s" radius="xl" border="neutral-medium">
          {(loading || retrying) && <Spinner fill center padding="xl" />}
          {error && !loading && !retrying && (
            <Row fillWidth horizontal="center" textVariant="label-default-s" onBackground="danger-weak" align="center" padding="xl">{error}</Row>
          )}

          {!loading && !error && profile && (
            <Column fillWidth>
              <Column fillWidth horizontal="center" gap="12" padding="l">
                <MediaUpload
                  radius="full"
                  minHeight="64"
                  minWidth="64"
                  maxHeight="64"
                  maxWidth="64"
                  resizeMaxWidth={160}
                  resizeMaxHeight={160}
                  initialPreviewImage={profile?.avatar_url || undefined}
                  emptyState={<Row fill center><Icon name="plus" size="l" /></Row>}
                  onFileUpload={handleAvatarFile}
                />
                <Text variant="label-default-s" onBackground="neutral-weak">
                  Edit avatar
                </Text>
              </Column>
              <Column fillWidth padding="4">
                <Column fillWidth padding="l" gap="24" radius="l" border>
                  <Column fillWidth vertical="center">
                    <Text variant="label-default-s" onBackground="neutral-weak">
                      Email
                    </Text>
                    <Row minHeight="32" vertical="center" textVariant="label-default-s">
                      {userEmail}
                    </Row>
                  </Column>
                  <Column fillWidth vertical="center">
                    <Text variant="label-default-s" onBackground="neutral-weak">
                      Role
                    </Text>
                    <Row minHeight="32" vertical="center" textVariant="label-default-s">
                      {roleId} <Text onBackground="neutral-weak" marginLeft="4">({roleRank})</Text>
                    </Row>
                  </Column>
                  <Column fillWidth vertical="center" gap="8">
                    <Text variant="label-default-s" onBackground="neutral-weak">
                      Username
                    </Text>
                    <Row fillWidth horizontal="between" gap="16" s={{direction: "column"}}>
                      {profile.username ? (
                        <Row maxWidth={24} textVariant="label-default-s">
                          {profile.username}
                        </Row>
                      ) : (
                        <Row minHeight="32" vertical="center" textVariant="label-default-s" onBackground="neutral-weak">Not set</Row>
                      )}
                      <Row minWidth="56">
                        <Button fillWidth size="s" label={profile.username ? "Edit" : "Add"} variant="secondary" onClick={() => openEditor("username")} />
                      </Row>
                    </Row>
                  </Column>
                  <Column fillWidth vertical="center" gap="8">
                    <Text variant="label-default-s" onBackground="neutral-weak">
                      Bio
                    </Text>
                    <Row fillWidth horizontal="between" gap="16" s={{direction: "column"}}>
                      {profile.bio ? (
                        <Row maxWidth={24} textVariant="label-default-s">
                          {profile.bio}
                        </Row>
                      ) : (
                        <Row textVariant="label-default-s" onBackground="neutral-weak">Not set</Row>
                      )}
                      <Row minWidth="56">
                        <Button fillWidth size="s" label={profile.bio ? "Edit" : "Add"} variant="secondary" onClick={() => openEditor("bio")} />
                      </Row>
                    </Row>
                  </Column>
                </Column>
              </Column>
            </Column>
          )}
        </Column>
        <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} title={title}
          footer={
            <Row fillWidth horizontal="end" gap="8">
              <Button size="s" disabled={saving} label="Cancel" variant="secondary" onClick={() => setIsDialogOpen(false)} />
              <Button size="s" disabled={saving} onClick={() => void handleSave()}>
                {saving ? <Spinner size="s" /> : "Save"}
              </Button>
            </Row>
          }
        >
          {editField === "username" && (
            <Input id="username" type="text" placeholder="Username" required
              minLength={validation.username.minLength}
              maxLength={validation.username.maxLength}
              value={formValue}
              onChange={(e) => setFormValue(e.target.value)} error={!!saveError} errorMessage={saveError || undefined} />
          )}
          {editField === "bio" && (
            <Textarea
              id="bio" placeholder="Bio" required lines="auto" value={formValue}
              maxLength={validation.bio.maxLength}
              onChange={(e) => setFormValue(e.target.value)} error={!!saveError} errorMessage={saveError || undefined}>
              {validation.bio.maxLength - formValue.length < 100 && (
                <Row
                  paddingX="16"
                  paddingBottom="8"
                  textVariant="label-default-s"
                  onBackground={validation.bio.maxLength - formValue.length < 10 ? "danger-weak" : validation.bio.maxLength - formValue.length < 25 ? "warning-weak" : "neutral-weak"}
                  paddingRight="4">
                  {validation.bio.maxLength - formValue.length}
                </Row>
              )}
            </Textarea>
          )}
        </Dialog>
      </Column>
    </>
  );
}