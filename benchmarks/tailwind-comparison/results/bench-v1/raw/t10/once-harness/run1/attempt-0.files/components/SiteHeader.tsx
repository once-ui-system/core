import Link from "next/link";
import { Row, Text } from "@once-ui-system/core";
import { SITE } from "@/lib/data";
import styles from "./haven.module.css";

export function SiteHeader() {
  return (
    <Row as="header" fillWidth paddingY="16" paddingX="16" horizontal="center" borderBottom>
      <div className={styles.siteHeader} style={{ width: "100%", maxWidth: "90rem" }}>
        <Link href="/" className={styles.brand} aria-label={`${SITE.name} home`}>
          <span className={styles.brandMark} aria-hidden="true" />
          {SITE.name}
        </Link>
        <Text textVariant="body-default-s" onBackground="neutral-weak">
          Homes in {SITE.city}
        </Text>
      </div>
    </Row>
  );
}
