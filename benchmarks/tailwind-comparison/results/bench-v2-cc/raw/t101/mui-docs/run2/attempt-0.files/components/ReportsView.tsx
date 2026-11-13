"use client";

import Card from "@mui/material/Card";
import LinearProgress from "@mui/material/LinearProgress";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import PageHeader from "@/components/PageHeader";
import { projects, totalIssues } from "@/lib/data";

export default function ReportsView() {
  const ranked = [...projects].sort((a, b) => b.issues - a.issues);
  return (
    <>
      <PageHeader
        title="Reports"
        description={`Issues by project, ${totalIssues} in total.`}
      />
      <Card>
        <TableContainer>
          <Table aria-label="Issues by project" sx={{ minWidth: 480 }}>
            <TableHead>
              <TableRow>
                <TableCell>Project</TableCell>
                <TableCell align="right">Issues</TableCell>
                <TableCell align="right">Share</TableCell>
                <TableCell sx={{ width: "40%" }}>
                  <span style={{ position: "absolute", left: -9999 }}>Share as a bar</span>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ranked.map((project) => {
                const share = totalIssues === 0 ? 0 : Math.round((project.issues / totalIssues) * 100);
                return (
                  <TableRow key={project.key}>
                    <TableCell component="th" scope="row">
                      {project.name}
                    </TableCell>
                    <TableCell align="right">{project.issues}</TableCell>
                    <TableCell align="right">{share}%</TableCell>
                    <TableCell>
                      <LinearProgress
                        variant="determinate"
                        value={share}
                        aria-label={`${project.name} share of issues`}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </>
  );
}
