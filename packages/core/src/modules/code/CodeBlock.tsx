"use client";

import React, {useState, useEffect, useRef, ReactNode, RefObject} from "react";
import ReactDOM from "react-dom";

// We'll import CSS files dynamically on the client side
const loadCssFiles = async () => {
  if (typeof window !== "undefined") {
    await Promise.all([import("./CodeHighlight.css"), import("./LineNumber.css")]);
    return true;
  }
  return false;
};

import styles from "./CodeBlock.module.scss";
import {
  Flex,
  IconButton,
  Scroller,
  Row,
  StyleOverlay,
  ToggleButton,
  Column,
  Text,
} from "../../components";

import Prism from "prismjs";

// We'll load these dynamically on the client side only
const loadPrismDependencies = async (...langs: string[]) => {
  if (typeof window !== "undefined") {
    // Only import these on the client side
    await Promise.all([
      import("prismjs/plugins/line-highlight/prism-line-highlight"),
      import("prismjs/plugins/line-numbers/prism-line-numbers"),
      import("prismjs/plugins/diff-highlight/prism-diff-highlight"),
      ...langs.map((lang) =>
        import(`prismjs/components/prism-${lang}`).catch(() => {
          // Fallback for languages that might not exist
          console.warn(`Language ${lang} not found in Prism.js components`);
          return null;
        }),
      ),
    ]);
    return true;
  }
  return false;
};
import classNames from "classnames";
import { Language, SpacingToken } from "../../types";

// GitHub-style diff parser
const parseDiff = (diffContent: string, startLineNumber?: number) => {
  const lines = diffContent.split("\n");
  const parsedLines: Array<{
    type: "file-header" | "hunk" | "added" | "deleted" | "context";
    oldLineNumber?: number;
    newLineNumber?: number;
    content: string;
  }> = [];

  let oldLineNumber = startLineNumber ? startLineNumber - 1 : 0;
  let newLineNumber = startLineNumber ? startLineNumber - 1 : 0;

  for (const line of lines) {
    if (
      line.startsWith("diff --git") ||
      line.startsWith("index ") ||
      line.startsWith("+++") ||
      line.startsWith("---")
    ) {
      parsedLines.push({
        type: "file-header",
        content: line,
      });
    } else if (line.startsWith("@@")) {
      // Parse hunk header to get line numbers
      const match = line.match(/@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
      if (match) {
        oldLineNumber = parseInt(match[1]) - 1;
        newLineNumber = parseInt(match[2]) - 1;
      }
      parsedLines.push({
        type: "hunk",
        content: line,
      });
    } else if (line.startsWith("+")) {
      newLineNumber++;
      parsedLines.push({
        type: "added",
        newLineNumber,
        content: line.substring(1),
      });
    } else if (line.startsWith("-")) {
      oldLineNumber++;
      parsedLines.push({
        type: "deleted",
        oldLineNumber,
        content: line.substring(1),
      });
    } else if (line.startsWith(" ") || line === "") {
      oldLineNumber++;
      newLineNumber++;
      parsedLines.push({
        type: "context",
        oldLineNumber,
        newLineNumber,
        content: line.substring(1),
      });
    }
  }

  return parsedLines;
};

// GitHub-style diff renderer
const renderGitHubDiff = (diffContent: string, startLineNumber: number | undefined, codeRef: RefObject<HTMLElement | null>) => {
  const parsedLines = parseDiff(diffContent, startLineNumber);

  return (
    <div className="diff-table">
      {parsedLines.map((line, index) => (
        <div key={index} className={`diff-row ${line.type}`}>
          <div className="diff-line-number">
            {line.type === "added" ? "" : line.oldLineNumber || ""}
          </div>
          <div className="diff-line-number">
            {line.type === "deleted" ? "" : line.newLineNumber || ""}
          </div>
          <div className="diff-line-content">
            {line.type === "added" && <span className="diff-sign"></span>}
            {line.type === "deleted" && <span className="diff-sign"></span>}
            <code
                ref={codeRef}
                className={classNames(styles.code, `language-diff`)}
            >
              {line.content}
            </code>
          </div>
        </div>
      ))}
    </div>
  );
};

type CodeInstance = {
  code: string | { content: string; error: string | null };
  language: Language;
  label: string;
  highlight?: string;
  prefixIcon?: string;
  startLineNumber?: number;
};

interface CodeBlockProps extends React.ComponentProps<typeof Flex> {
  codeHeight?: number;
  fillHeight?: boolean;
  previewPadding?: SpacingToken;
  codes?: CodeInstance[];
  preview?: ReactNode;
  copyButton?: boolean;
  styleButton?: boolean;
  reloadButton?: boolean;
  fullscreenButton?: boolean;
  compact?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onInstanceChange?: (index: number) => void;
  lineNumbers?: boolean;
  highlight?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({
  highlight: deprecatedHighlight,
  codeHeight,
  fillHeight,
  previewPadding = "l",
  codes = [],
  preview,
  copyButton = true,
  styleButton = false,
  reloadButton = false,
  fullscreenButton = false,
  lineNumbers = false,
  compact = false,
  className,
  style,
  onInstanceChange,
  ...rest
}) => {
  const codeRef = useRef<HTMLElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const [selectedInstance, setSelectedInstance] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const codeBlockRef = useRef<HTMLDivElement>(null);
  const [dependenciesLoaded, setDependenciesLoaded] = useState(false);

  const codeInstance = codes[selectedInstance] || {
    code: "",
    language: "",
  };
  const { code, language, startLineNumber } = codeInstance;
  const highlight =
    codeInstance.highlight !== undefined ? codeInstance.highlight : deprecatedHighlight;

  console.log(highlight, codeInstance.highlight, deprecatedHighlight);

  useEffect(() => {
    const loadDependencies = async () => {
      await Promise.all([
        loadPrismDependencies(
          ...codes.map((data) => {
            return data.language;
          }),
        ),
        loadCssFiles(),
      ]);
      setDependenciesLoaded(true);
    };

    loadDependencies();
  }, []);

  useEffect(() => {
    if (dependenciesLoaded && codeRef.current && codes.length > 0) {
      setTimeout(() => {
        Prism.highlightAll();
      }, 0);
    }
  }, [dependenciesLoaded, code, codes.length, selectedInstance, isFullscreen, isAnimating]);

  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden";

      // Start animation after a small delay to allow portal to render
      setTimeout(() => {
        setIsAnimating(true);
      }, 10);

      const handleEscKey = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          toggleFullscreen();
        }
      };

      document.addEventListener("keydown", handleEscKey);

      return () => {
        document.body.style.overflow = "";
        document.removeEventListener("keydown", handleEscKey);
      };
    } else {
      document.body.style.overflow = "";
      setIsAnimating(false);
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isFullscreen]);

  const [copyIcon, setCopyIcon] = useState<string>("clipboard");
  const handleCopy = () => {
    if (codes.length > 0 && code) {
      navigator.clipboard
        .writeText(typeof code === "string" ? code : code.content)
        .then(() => {
          setCopyIcon("check");

          setTimeout(() => {
            setCopyIcon("clipboard");
          }, 5000);
        })
        .catch((err) => {
          console.error("Failed to copy code: ", err);
        });
    }
  };

  const [refreshKey, setRefreshKey] = useState(0);
  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleContent = (selectedLabel: string) => {
    const index = codes.findIndex((instance) => instance.label === selectedLabel);
    if (index !== -1) {
      setSelectedInstance(index);

      // Re-highlight after tab change
      setTimeout(() => {
        Prism.highlightAll();
      }, 10);
    }
  };

  const toggleFullscreen = () => {
    if (isFullscreen) {
      // When exiting fullscreen, first remove animation class, then remove portal after transition
      setIsAnimating(false);
      setTimeout(() => {
        setIsFullscreen(false);

        // Re-highlight after exiting fullscreen
        setTimeout(() => {
          Prism.highlightAll();
        }, 10);
      }, 300); // Match transition duration
    } else {
      // When entering fullscreen, immediately show portal
      setIsFullscreen(true);

      // Re-highlight after entering fullscreen
      setTimeout(() => {
        Prism.highlightAll();
      }, 50);
    }
  };

  // Ensure highlighting is applied after animation completes
  useEffect(() => {
    if (isAnimating && dependenciesLoaded) {
      // Re-highlight after animation completes
      setTimeout(() => {
        Prism.highlightAll();
      }, 350); // Slightly longer than animation duration
    }
  }, [isAnimating, dependenciesLoaded]);

  // Create a function to render the CodeBlock content
  const renderCodeBlock = (inPortal = false, resetMargin = false) => (
    <Column
      ref={inPortal ? undefined : codeBlockRef}
      radius="l"
      background="surface"
      border="neutral-alpha-weak"
      overflow="hidden"
      vertical="center"
      fillWidth
      minHeight={2.5}
      className={classNames(className, {
        [styles.fullscreen]: inPortal && isFullscreen,
      })}
      style={{
        isolation: "isolate",
        ...(inPortal
          ? {
              transition: "transform 0.3s ease, opacity 0.3s ease",
              transform: isAnimating ? "scale(1)" : "scale(0.95)",
              opacity: isAnimating ? 1 : 0,
              ...(resetMargin
                ? {
                    margin: 0,
                  }
                : {}),
            }
          : {}),
        ...style,
      }}
      {...rest}
    >
      {(codes.length > 1 || (copyButton && !compact)) && (
        <Row zIndex={2} position="static" fillWidth fitHeight horizontal="between">
          {codes.length > 1 ? (
            <Scroller paddingX="8" fadeColor="surface">
              <Row data-scaling="90" fitWidth fillHeight vertical="center" paddingY="4" gap="2">
                {codes.map((instance, index) => (
                  <ToggleButton
                    key={index}
                    weight="default"
                    prefixIcon={instance.prefixIcon}
                    selected={selectedInstance === index}
                    onClick={() => {
                      setSelectedInstance(index);
                      onInstanceChange?.(index);
                      handleContent(instance.label);
                    }}
                  >
                    <Text
                      onBackground={selectedInstance === index ? "neutral-strong" : "neutral-weak"}
                    >
                      {instance.label}
                    </Text>
                  </ToggleButton>
                ))}
              </Row>
            </Scroller>
          ) : (
            <Row
              paddingY="12"
              paddingX="16"
              textVariant="label-default-s"
              onBackground="neutral-strong"
            >
              {codes[0].label}
            </Row>
          )}
          {!compact && (
            <Row paddingY="4" paddingX="8" gap="2" position="static">
              {reloadButton && (
                <IconButton
                  size="m"
                  tooltip="Reload"
                  tooltipPosition="left"
                  variant="tertiary"
                  onClick={handleRefresh}
                  icon="refresh"
                />
              )}
              {fullscreenButton && (
                <IconButton
                  size="m"
                  tooltip={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                  tooltipPosition="left"
                  variant="tertiary"
                  icon={isFullscreen ? "minimize" : "maximize"}
                  onClick={toggleFullscreen}
                />
              )}
              {styleButton && (
                <StyleOverlay>
                  <IconButton variant="tertiary" icon="sparkle" />
                </StyleOverlay>
              )}
              {copyButton && (
                <IconButton
                  size="m"
                  tooltip="Copy"
                  tooltipPosition="left"
                  variant="tertiary"
                  onClick={handleCopy}
                  icon={copyIcon}
                />
              )}
            </Row>
          )}
        </Row>
      )}
      {preview && (
        <Row key={refreshKey} paddingX="4" paddingBottom="4" paddingTop={compact ? "4" : "0"} fill>
          <Row
            fill
            background="overlay"
            padding={previewPadding}
            tabIndex={-1}
            horizontal="center"
            radius="l"
            overflowY="auto"
            border="neutral-alpha-weak"
          >
            {Array.isArray(preview)
              ? preview.map((item, index) => <React.Fragment key={index}>{item}</React.Fragment>)
              : preview}
          </Row>
        </Row>
      )}
      {codes.length > 0 && code && (
        <Row
          border={!compact && !preview ? "neutral-alpha-weak" : undefined}
          style={{
            left: "-1px",
            bottom: "-1px",
            width: "calc(100% + 2px)",
          }}
          radius="l"
          flex="1"
          fillHeight={fillHeight}
        >
          <Row overflowX="auto" fillWidth tabIndex={-1}>
            {language === "diff" ? (
              <div
                className={classNames(styles.padding, styles.pre, `language-${language}`)}
                style={{ maxHeight: `${codeHeight}rem`, overflow: "auto", width: "100%" }}
              >
                {renderGitHubDiff(
                  typeof code === "string" ? code : code.content,
                  startLineNumber,
                  codeRef
                )}
              </div>
            ) : (
              <pre
                key={`${selectedInstance}-${highlight || deprecatedHighlight || 'no-highlight'}`}
                suppressHydrationWarning
                tabIndex={-1}
                style={{ maxHeight: `${codeHeight}rem` }}
                data-line={highlight || deprecatedHighlight}
                ref={preRef}
                className={classNames(
                  lineNumbers ? styles.lineNumberPadding : styles.padding,
                  styles.pre,
                  `language-${language}`,
                  {
                    "line-numbers": lineNumbers,
                  },
                )}
              >
                <code
                  tabIndex={-1}
                  ref={codeRef}
                  className={classNames(styles.code, `language-${language}`)}
                >
                  {typeof code === "string" ? code : code.content}
                </code>
              </pre>
            )}
          </Row>
          {compact && copyButton && (
            <Row
              position="absolute"
              right="4"
              top="4"
              marginRight="2"
              className={styles.compactCopy}
              zIndex={1}
            >
              <IconButton
                tooltip="Copy"
                tooltipPosition="left"
                aria-label="Copy code"
                onClick={handleCopy}
                icon={copyIcon}
                size="m"
                variant="tertiary"
              />
            </Row>
          )}
        </Row>
      )}
    </Column>
  );

  return (
    <>
      {renderCodeBlock(false)}
      {isFullscreen &&
        ReactDOM.createPortal(
          <Flex
            position="fixed"
            zIndex={9}
            top="0"
            left="0"
            right="0"
            bottom="0"
            background={isAnimating ? "overlay" : "transparent"}
            style={{ backdropFilter: "blur(0.5rem)" }}
            transition="macro-medium"
          >
            {renderCodeBlock(true, true)}
          </Flex>,
          document.body,
        )}
    </>
  );
};

CodeBlock.displayName = "CodeBlock";
export { CodeBlock };
