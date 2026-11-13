"use client";

import * as React from "react";
import IconButton from "@mui/material/IconButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ManageAccountsIcon from "@mui/icons-material/ManageAccountsOutlined";
import SendIcon from "@mui/icons-material/SendOutlined";
import PersonRemoveIcon from "@mui/icons-material/PersonRemoveOutlined";
import type { Member } from "@/lib/data";

interface Props {
  member: Member;
  onChangeRole: (member: Member) => void;
  onResend: (member: Member) => void;
  onRemove: (member: Member) => void;
}

export default function MemberActionsMenu({ member, onChangeRole, onResend, onRemove }: Props) {
  const id = React.useId();
  const buttonId = `${id}-button`;
  const menuId = `${id}-menu`;
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const close = () => setAnchorEl(null);

  return (
    <>
      <IconButton
        id={buttonId}
        aria-label={`Actions for ${member.name}`}
        aria-controls={open ? menuId : undefined}
        aria-haspopup="menu"
        aria-expanded={open ? "true" : undefined}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        size="small"
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id={menuId}
        anchorEl={anchorEl}
        open={open}
        onClose={close}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ list: { "aria-labelledby": buttonId } }}
      >
        <MenuItem
          onClick={() => {
            close();
            onChangeRole(member);
          }}
        >
          <ListItemIcon>
            <ManageAccountsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Change role</ListItemText>
        </MenuItem>
        {member.status === "Invited" && (
          <MenuItem
            onClick={() => {
              close();
              onResend(member);
            }}
          >
            <ListItemIcon>
              <SendIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Resend invite</ListItemText>
          </MenuItem>
        )}
        <Divider />
        <MenuItem
          onClick={() => {
            close();
            onRemove(member);
          }}
          sx={{ color: "error.main" }}
        >
          <ListItemIcon sx={{ color: "inherit" }}>
            <PersonRemoveIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Remove</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
