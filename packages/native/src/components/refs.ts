import type { ComponentRef, ForwardRefExoticComponent, RefAttributes } from "react";
import type { Text, TextInput, View } from "react-native";

// React Native's own types make `View` and friends functions, so their
// instances are named through `ComponentRef`.
export type ViewRef = ComponentRef<typeof View>;
export type TextRef = ComponentRef<typeof Text>;
export type TextInputRef = ComponentRef<typeof TextInput>;

/** A style built up key by key (React Native's style types are read-only). */
export type Writable<T> = { -readonly [K in keyof T]: T[K] };

/** A `forwardRef` component's type, spelled out so declarations stay portable. */
export type RefComponent<P, R> = ForwardRefExoticComponent<P & RefAttributes<R>>;
