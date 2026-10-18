// `@once-ui-system/core/emoji`. EmojiPicker carries its dataset (about 270 KB
// of JSON), so it is not on the root barrel: an app that never renders the
// picker never has the data in its module graph.
export type { EmojiPickerProps } from "../../components/EmojiPicker.js";
export { EmojiPicker } from "../../components/EmojiPicker.js";
