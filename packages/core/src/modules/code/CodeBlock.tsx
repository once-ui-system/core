"use client";

import React, { ReactNode, RefObject, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import classNames from "classnames";
import { Language, SpacingToken } from "../../types";
import Prism from "prismjs";
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

const loadCssFiles = async () => {
  if (typeof window !== "undefined") {
    await Promise.all([
      import("./CodeHighlight.css"),
      import("./LineNumber.css"),
      import("./CodeDiff.css"),
    ]);
    return true;
  }
  return false;
};

// Complete dependency map for Prism.js languages
const languageDependencies: Record<string, string[]> = {
  // Languages that require clike (C-like syntax)
  arduino: ["clike"],
  c: ["clike"],
  cpp: ["c"],
  csharp: ["clike"],
  dart: ["clike"],
  java: ["clike"],
  javascript: ["clike"],
  kotlin: ["clike"],
  objectivec: ["c"],
  scala: ["java"],
  swift: ["clike"],
  processing: ["clike"],
  solidity: ["clike"],
  squirrel: ["clike"],
  unrealscript: ["clike"],
  cilkc: ["c"],
  cilkcpp: ["cpp"],
  cfscript: ["clike"],
  chaiscript: ["clike"],
  cil: ["clike"],
  concurnas: ["clike"],
  crystal: ["clike"],
  gcode: ["clike"],
  glsl: ["c"],
  hlsl: ["c"],
  opencl: ["c"],
  reason: ["clike"],

  // Languages that require markup (HTML/XML)
  "xml-doc": ["markup"],
  mathml: ["markup"],
  svg: ["markup"],
  ssml: ["markup"],
  asciidoc: ["markup"],
  "dns-zone-file": ["markup"],
  javadoclike: ["markup"],
  markdown: ["markup"],
  nasm: ["markup"],
  parser: ["markup"],
  "plant-uml": ["markup"],
  powerquery: ["markup"],
  "solution-file": ["markup"],
  "t4-templating": ["markup"],
  turtle: ["markup"],
  "web-idl": ["markup"],
  xquery: ["markup"],

  // Languages that require markup-templating
  django: ["markup-templating"],
  erb: ["markup-templating", "ruby"],
  etlua: ["markup-templating", "lua"],
  handlebars: ["markup-templating"],
  jsp: ["markup-templating", "java"],
  latte: ["markup-templating", "php"],
  liquid: ["markup-templating"],
  mustache: ["markup-templating"],
  php: ["markup-templating"],
  smarty: ["markup-templating"],
  twig: ["markup-templating"],
  velocity: ["markup-templating"],
  ejs: ["markup-templating", "javascript"],
  ftl: ["markup-templating"],
  tt2: ["clike", "markup-templating"],

  // Languages that require javascript
  actionscript: ["javascript"],
  coffeescript: ["javascript"],
  flow: ["javascript"],
  jsx: ["markup", "javascript"],
  n4js: ["javascript"],
  qml: ["javascript"],
  typescript: ["javascript"],
  tsx: ["jsx", "typescript"],
  jsdoc: ["javascript", "javadoclike"],
  "js-extras": ["javascript"],
  "js-templates": ["javascript"],
  jsstacktrace: ["javascript"],
  mongodb: ["javascript"],
  rescript: ["javascript"],

  // Languages that require CSS
  less: ["css"],
  sass: ["css"],
  scss: ["css"],
  stylus: ["css"],
  "css-extras": ["css"],

  // Languages that require JSON
  json5: ["json"],
  jsonp: ["json"],

  // Languages with specific complex dependencies
  aspnet: ["markup", "csharp"],
  cshtml: ["markup", "csharp"],
  bison: ["c"],
  docker: ["clike"],
  "firestore-security-rules": ["clike"],
  "go-module": ["go"],
  haml: ["ruby"],
  javadoc: ["markup", "java"],
  lilypond: ["scheme"],
  mel: ["python"],
  nginx: ["clike"],
  phpdoc: ["php", "javadoclike"],
  pug: ["markup", "javascript"],
  qsharp: ["csharp"],
  "t4-cs": ["csharp", "t4-templating"],
  "t4-vb": ["vbnet", "t4-templating"],
  vbnet: ["basic"],
};

// Track loaded languages to avoid re-loading
const loadedLanguages = new Set<string>(["markup", "css", "clike", "javascript"]);

// Recursively load language dependencies
const loadLanguageWithDependencies = async (lang: string): Promise<boolean> => {
  if (typeof window === "undefined") return false;

  // Handle language aliases
  const languageAliases: Record<string, string> = {
    ts: "typescript",
  };
  
  const actualLang = languageAliases[lang] || lang;

  // Skip if already loaded
  if (loadedLanguages.has(actualLang)) {
    return true;
  }

  try {
    // Load dependencies first
    const dependencies = languageDependencies[actualLang] || [];
    for (const dep of dependencies) {
      if (!loadedLanguages.has(dep)) {
        await loadLanguageWithDependencies(dep);
      }
    }

    // Load the main language
    await import(`prismjs/components/prism-${actualLang}`);
    loadedLanguages.add(actualLang);
    loadedLanguages.add(lang); // Also mark the alias as loaded
    return true;
  } catch (error) {
    console.warn(`✗ Failed to load Prism language '${lang}':`, error);
    return false;
  }
};

// Load multiple languages and plugins
const loadPrismDependencies = async (...langs: string[]): Promise<boolean> => {
  if (typeof window === "undefined") return false;

  try {
    // Load core plugins first
    await Promise.all([
      import("prismjs/plugins/line-highlight/prism-line-highlight"),
      import("prismjs/plugins/line-numbers/prism-line-numbers"),
      import("prismjs/components/prism-diff"),
      import("prismjs/plugins/diff-highlight/prism-diff-highlight"),
    ]);

    // Filter out empty/invalid languages and remove duplicates
    const validLangs = [...new Set(langs.filter((lang) => lang && lang.trim()))];

    // Load each language with its dependencies
    const results = await Promise.all(validLangs.map((lang) => loadLanguageWithDependencies(lang)));

    const successCount = results.filter(Boolean).length;

    return successCount > 0;
  } catch (error) {
    console.error("💥 Error loading Prism dependencies:", error);
    return false;
  }
};

// Diff parser
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
    } else if (line.startsWith("") || line === "") {
      oldLineNumber++;
      newLineNumber++;
      parsedLines.push({
        type: "context",
        oldLineNumber,
        newLineNumber,
        content: line,
      });
    }
  }

  return parsedLines;
};

const isInformationalLine = (type: "file-header" | "hunk" | "added" | "deleted" | "context") => {
  return ["hunk", "file-header"].includes(type);
};

// GitHub-style diff renderer with syntax highlighting
const renderDiff = (
  diffContent: string,
  startLineNumber: number | undefined,
  codeRef: RefObject<HTMLElement | null>,
  lang: string | undefined,
) => {
  const parsedLines = parseDiff(diffContent, startLineNumber);

  const codeLines = parsedLines.filter((line) => !isInformationalLine(line.type));

  // Apply syntax highlighting to code lines
  let highlightedLines: string[] = [];
  
  if (lang && Prism.languages[lang]) {
    try {
      highlightedLines = codeLines.map((line) => {
        try {
          // Check if language is loaded before highlighting
          if (Prism.languages[lang]) {
            return Prism.highlight(line.content, Prism.languages[lang], lang);
          }
          return line.content;
        } catch (error) {
          console.warn(`Failed to highlight line: ${line.content}`, error);
          return line.content;
        }
      });
    } catch (error) {
      console.warn(`Failed to highlight code with language ${lang}:`, error);
      highlightedLines = codeLines.map((line) => line.content);
    }
  } else {
    highlightedLines = codeLines.map((line) => line.content);
  }

  let codeLineIndex = 0;

  return (
    <div className="diff-table">
      {parsedLines.map((line, index) => {
        let content = line.content;
        let className = "";

        if (isInformationalLine(line.type)) {
          if (Prism.languages.diff) {
            try {
              content = Prism.highlight(line.content, Prism.languages.diff, "diff");
            } catch (error) {
              console.warn(`Failed to highlight diff line: ${line.content}`, error);
            }
          }
          className = "language-diff";
        } else {
          content = highlightedLines[codeLineIndex] || line.content;
          className = `language-${lang || "diff"}`;
          codeLineIndex++;
        }

        return (
          <div key={index} className={`diff-row ${line.type}`}>
            <div className="diff-line-number">
              {(line.type === "deleted" || line.type === "context") &&
                line.oldLineNumber !== undefined && <Text variant="code-default-s" style={{ transform: "scale(0.9)" }}>{line.oldLineNumber}</Text>}
            </div>
            <div className="diff-line-number">
              {(line.type === "added" || line.type === "context") &&
                line.newLineNumber !== undefined && <Text variant="code-default-s" style={{ transform: "scale(0.9)" }}>{line.newLineNumber}</Text>}
            </div>
            <div className="diff-line-content">
              <span className="diff-sign"></span>
              <code
                suppressHydrationWarning
                className={className}
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

type CodeInstance = {
  code: string | { content: string; error: string | null };
  language: string | ["diff", string];
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

  useEffect(() => {
    const loadDependencies = async () => {
      await Promise.all([
        loadPrismDependencies(
          ...codes.flatMap((data) => {
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
  }, [dependenciesLoaded, code, codes.length, selectedInstance, isFullscreen, isAnimating, language]);

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

  // Special handling for diff highlighting
  useEffect(() => {
    if (
      codeInstance &&
      Array.isArray(codeInstance.language) &&
      codeInstance.language.includes("diff")
    ) {
      const timeoutId = setTimeout(() => {
        if (codeRef.current) {
          const diffRows = codeRef.current.querySelectorAll(".diff-row");
          const lang = codeInstance.language[1];

          if (lang && Prism.languages[lang]) {
            diffRows.forEach((row) => {
              const codeContent = row.querySelector(".diff-line-content code");
              const rowElement = row as HTMLElement;

              if (
                codeContent &&
                (rowElement.classList.contains("added") ||
                  rowElement.classList.contains("deleted") ||
                  rowElement.classList.contains("context"))
              ) {
                const textContent = codeContent.textContent || "";
                try {
                  codeContent.innerHTML = Prism.highlight(textContent, Prism.languages[lang], lang);
                } catch (error) {
                  console.warn("Failed to re-highlight line:", error);
                }
              }
            });
          }
        }
      }, 50);

      return () => clearTimeout(timeoutId);
    }
  }, [codeInstance, codes]);

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
      {!compact && (
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
                  tooltipPosition="bottom"
                  variant="tertiary"
                  onClick={handleRefresh}
                  icon="refresh"
                />
              )}
              {fullscreenButton && (
                <IconButton
                  size="m"
                  tooltip={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                  tooltipPosition="bottom"
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
                  tooltipPosition="bottom"
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
        <Row
          key={refreshKey}
          paddingX="4"
          paddingBottom="4"
          paddingTop={compact ? "4" : "0"}
          fill
        >
          <Row
            fill
            background="overlay"
            radius="l"
            border="neutral-alpha-weak"
            padding={previewPadding}
            tabIndex={-1}
            horizontal="center"
            overflowY="auto"
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
          fillHeight={fillHeight}
          radius="l"
          paddingRight="2"
          paddingBottom="2"
          flex="1"
          style={{
            left: "-1px",
            bottom: "-1px",
            width: "calc(100% + 2px)",
          }}
        >
          <Row overflowX="auto" fillWidth tabIndex={-1}>
            {language.includes("diff") ? (
              <div
                className={classNames(
                  styles.pre,
                  `language-diff`,
                )}
                style={{ maxHeight: `${codeHeight}rem`, overflow: "auto", width: "100%" }}
              >
                {renderDiff(
                  typeof code === "string" ? code : code.content,
                  startLineNumber,
                  codeRef,
                  Array.isArray(language) ? language[1] : undefined,
                )}
              </div>
            ) : (
              <pre
                key={`${selectedInstance}-${highlight || deprecatedHighlight || "no-highlight"}`}
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
