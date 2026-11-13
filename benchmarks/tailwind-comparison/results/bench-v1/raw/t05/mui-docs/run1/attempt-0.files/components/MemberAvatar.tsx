import Avatar from "@mui/material/Avatar";
import { getInitials } from "@/lib/data";

const PALETTE = [
  "#5E35B1",
  "#00897B",
  "#C2185B",
  "#1E88E5",
  "#EF6C00",
  "#546E7A",
  "#6D4C41",
  "#3949AB",
];

function colorFor(id: string): string {
  let hash = 0;
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) % 997;
  return PALETTE[hash % PALETTE.length];
}

export default function MemberAvatar({
  id,
  name,
  size = 40,
}: {
  id: string;
  name: string;
  size?: number;
}) {
  return (
    <Avatar
      aria-hidden
      sx={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        fontWeight: 600,
        bgcolor: colorFor(id),
        color: "#fff",
      }}
    >
      {getInitials(name)}
    </Avatar>
  );
}
