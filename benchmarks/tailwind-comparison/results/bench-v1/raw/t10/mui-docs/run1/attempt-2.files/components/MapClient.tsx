"use client";

import dynamic from "next/dynamic";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <Box sx={{ width: "100%", height: "100%" }}>
      <Skeleton variant="rectangular" width="100%" height="100%" />
    </Box>
  ),
});

export default MapView;
