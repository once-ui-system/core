import * as React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import MuiLink from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "@/components/Link";
import MemberAvatar from "@/components/MemberAvatar";
import { RoleBadge, StatusBadge } from "@/components/badges";
import { MEMBERS, formatDate, getActivity, getMember } from "@/lib/data";

export function generateStaticParams() {
  return MEMBERS.map((m) => ({ id: m.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const member = getMember(id);
  return { title: member ? `${member.name} · Lumen` : "Member not found · Lumen" };
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box>
      <Typography variant="overline" color="text.secondary" component="dt">
        {label}
      </Typography>
      <Box component="dd" sx={{ m: 0 }}>
        {children}
      </Box>
    </Box>
  );
}

export default async function MemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const member = getMember(id);
  if (!member) notFound();

  const activity = getActivity(member.id);

  return (
    <Container component="main" maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
      <Breadcrumbs aria-label="Breadcrumb" sx={{ mb: 3 }}>
        <MuiLink component={Link} href="/" underline="hover" color="inherit">
          Team
        </MuiLink>
        <Typography color="text.primary">{member.name}</Typography>
      </Breadcrumbs>

      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={3}
          sx={{ alignItems: { sm: "center" } }}
        >
          <MemberAvatar id={member.id} name={member.name} size={80} />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
              {member.name}
            </Typography>
            <Typography color="text.secondary" sx={{ overflowWrap: "anywhere" }}>
              {member.email}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
              <RoleBadge role={member.role} />
              <StatusBadge status={member.status} />
            </Stack>
          </Box>
        </Stack>

        <Divider sx={{ my: 3 }} />

        <Box
          component="dl"
          sx={{
            m: 0,
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
          }}
        >
          <Field label="Role">
            <Typography>{member.role}</Typography>
          </Field>
          <Field label="Status">
            <Typography>{member.status}</Typography>
          </Field>
          <Field label="Joined">
            <Typography>{formatDate(member.joined)}</Typography>
          </Field>
        </Box>
      </Paper>

      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
          Recent activity
        </Typography>
        {activity.length === 0 ? (
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            {member.status === "Invited"
              ? `${member.name} hasn't accepted the invitation yet, so there is no activity to show.`
              : "No recent activity."}
          </Typography>
        ) : (
          <List disablePadding sx={{ mt: 1 }}>
            {activity.map((item, index) => (
              <React.Fragment key={item.id}>
                {index > 0 && <Divider component="li" />}
                <ListItem disableGutters>
                  <ListItemText
                    primary={
                      <>
                        {item.action}{" "}
                        <Box component="span" sx={{ fontWeight: 600 }}>
                          {item.target}
                        </Box>
                      </>
                    }
                    secondary={item.when}
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
}
