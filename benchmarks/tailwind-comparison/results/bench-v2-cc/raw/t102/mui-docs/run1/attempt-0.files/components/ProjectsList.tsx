"use client";

import { Fragment, useState } from "react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import {
  formatDate,
  issueLabel,
  projects,
  type ProjectStatus,
} from "@/lib/data";

type Filter = "All" | ProjectStatus;

const filters: Filter[] = ["All", "Active", "Paused", "Archived"];

const statusColor: Record<ProjectStatus, "success" | "warning" | "default"> = {
  Active: "success",
  Paused: "warning",
  Archived: "default",
};

export default function ProjectsList() {
  const [filter, setFilter] = useState<Filter>("All");
  const visible =
    filter === "All"
      ? projects
      : projects.filter((project) => project.status === filter);

  return (
    <>
      <Box sx={{ overflowX: "auto", pb: 0.5, mb: 2 }}>
        <ToggleButtonGroup
          exclusive
          value={filter}
          onChange={(_, value: Filter | null) => {
            if (value) setFilter(value);
          }}
          aria-label="Filter projects by status"
        >
          {filters.map((item) => (
            <ToggleButton key={item} value={item}>
              {item}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      <Typography
        variant="body2"
        color="text.secondary"
        aria-live="polite"
        sx={{ mb: 2 }}
      >
        Showing {visible.length} of {projects.length} projects
      </Typography>

      <Card component="section" aria-label="Projects">
        <List disablePadding>
          {visible.map((project, index) => (
            <Fragment key={project.key}>
              {index > 0 ? <Divider component="li" /> : null}
              <ListItem
                sx={{
                  py: 2.5,
                  px: { xs: 2, sm: 3 },
                  gap: 2,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <ListItemAvatar sx={{ minWidth: 0 }}>
                  <Avatar
                    variant="rounded"
                    sx={{
                      width: 56,
                      height: 56,
                      fontSize: "0.875rem",
                      bgcolor: "action.selected",
                      color: "text.primary",
                    }}
                  >
                    {project.key}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  sx={{ flex: "1 1 180px", minWidth: 0, m: 0 }}
                  primary={project.name}
                  secondary={`Updated ${formatDate(project.updated)}`}
                  slotProps={{ primary: { variant: "subtitle1" } }}
                />
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    flexWrap: "wrap",
                  }}
                >
                  <Chip
                    label={project.status}
                    color={statusColor[project.status]}
                    variant="outlined"
                  />
                  <Typography variant="body2" color="text.secondary">
                    {issueLabel(project.issues)}
                  </Typography>
                </Box>
              </ListItem>
            </Fragment>
          ))}
        </List>
      </Card>
    </>
  );
}
