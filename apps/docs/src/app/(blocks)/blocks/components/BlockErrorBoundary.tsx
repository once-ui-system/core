"use client";

import { Column, Text } from "@once-ui-system/core";
import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Smaller copy for the filmstrip's thumbnails. */
  compact?: boolean;
}

interface State {
  failed: boolean;
}

/**
 * Keeps one block's preview from taking the whole page down. A block that
 * throws while rendering (the 3D globe in a browser with WebGL off or out of
 * contexts, say) shows a quiet note in its own frame, and the rest of the page,
 * its code and the other blocks, stays usable. Remount with a `key` to retry.
 */
export class BlockErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Block preview failed to render", error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <Column fill center padding="l" gap="4">
        <Text
          variant={this.props.compact ? "label-default-xs" : "label-default-s"}
          onBackground="neutral-weak"
          align="center"
        >
          This preview can't run in this browser.
        </Text>
        {!this.props.compact && (
          <Text variant="body-default-xs" onBackground="neutral-weak" align="center">
            The code below still works in your app.
          </Text>
        )}
      </Column>
    );
  }
}
