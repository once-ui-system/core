"use client";

import React from "react";
import { Table, Row, InlineCode, Text } from "@once-ui-system/core";
import { ReactNode } from "react";

type PropType = string | string[] | ReactNode;
type PropData = [string, PropType, string?];

interface PropsTableProps {
  content: PropData[];
}

function PropsTable({ content }: PropsTableProps) {
  const tableData = {
    headers: [
      { content: "Prop", key: "prop", sortable: true },
      { content: "Type", key: "type", sortable: false },
      { content: "Default", key: "default", sortable: false },
    ],
    rows: content.map((propData) => {
      // First item is always the prop name
      const propName = propData[0];
      
      // Second item is the type
      const propType = propData[1];
      
      // Third item (if exists) is the default value
      const defaultValue = propData.length > 2 ? propData[2] : "-";
      
      // Render type differently based on special props or data type
      let typeDisplay: ReactNode;
      
      // Special case for common props
      if (propName === "children") {
        typeDisplay = <InlineCode>React.ReactNode</InlineCode>;
      } else if (propName === "style") {
        typeDisplay = <InlineCode>React.CSSProperties</InlineCode>;
      } else if (propName === "className") {
        typeDisplay = <InlineCode>string</InlineCode>;
      } else if (propName === "...flex") {
        typeDisplay = <InlineCode>FlexProps</InlineCode>;
      } else if (propName === "...grid") {
        typeDisplay = <InlineCode>GridProps</InlineCode>;
      } else if (propName === "...input") {
        typeDisplay = <InlineCode>InputHTMLAttributes</InlineCode>;
      } else if (Array.isArray(propType)) {
        typeDisplay = (
          <Row gap="4" wrap>
            {(propType as string[]).map((value, index) => (
              <React.Fragment key={index}><InlineCode>{value}</InlineCode> {index < (propType as string[]).length - 1 && <Text onBackground="neutral-weak" marginX="2">•</Text>}</React.Fragment>
            ))}
          </Row>
        );
      } else {
        typeDisplay = <InlineCode>{propType}</InlineCode>;
      }
      
      const defaultDisplay = defaultValue === "-" ? <Text onBackground="neutral-weak">—</Text> : <InlineCode>{defaultValue}</InlineCode>;
      
      return [propName, typeDisplay, defaultDisplay];
    }),
  };

  return <Table marginTop="16" marginBottom="24" data={tableData} />;
}

export { PropsTable };
