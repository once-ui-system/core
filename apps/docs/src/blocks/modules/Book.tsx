import { Column, ElementType, type Flex, Media, Row } from "@once-ui-system/core";
import styles from "./Book.module.css";

interface BookProps extends Omit<React.ComponentProps<typeof Flex>, "children"> {
  children?: React.ReactNode;
  src?: string;
  alt?: string;
  sizes?: string;
  href?: string;
}

export const Book: React.FC<BookProps> = ({ children, src, alt, sizes, href, ...flex }) => {
  return (
    <Row maxWidth={12} aspectRatio="3/4" {...flex}>
      <ElementType style={{ isolation: "isolate", height: "100%", width: "100%" }} href={href}>
        <Row fill className={styles.bookWrapper}>
          <Row fill className={styles.book}>
            <Row
              fill
              className={styles.bookCover}
              borderY="neutral-medium"
              borderLeft="neutral-medium"
              background="page"
              leftRadius="xs"
              rightRadius="s"
              overflow="hidden"
            >
              {src && (
                <Media
                  sizes={sizes || "(max-width: 768px) 100vw, 480px"}
                  src={src}
                  alt={alt || "Book cover"}
                  stretch
                />
              )}
              <Column fill position="absolute" zIndex={1}>
                {children}
              </Column>
              <Row
                zIndex={2}
                position="absolute"
                left="0"
                top="0"
                fillHeight
                width="8"
                background="overlay"
                style={{ filter: "blur(0.125rem)" }}
              />
            </Row>
            <Row
              data-theme="dark"
              rightRadius="s"
              borderY="neutral-medium"
              borderRight="neutral-medium"
              overflow="hidden"
              position="absolute"
              right="0"
              top="8"
              bottom="8"
              width="24"
              background="page"
              paddingY="8"
              paddingRight="12"
              className={styles.bookPages}
            >
              <Row fill rightRadius="xs" style={{ background: "var(--static-white)" }} />
            </Row>
          </Row>
        </Row>
      </ElementType>
    </Row>
  );
};
