"use client";

import dynamic from "next/dynamic";
import Skeleton from "@mui/material/Skeleton";

const DetailMap = dynamic(() => import("./DetailMap"), {
  ssr: false,
  loading: () => <Skeleton variant="rectangular" width="100%" height="100%" />,
});

export default DetailMap;
