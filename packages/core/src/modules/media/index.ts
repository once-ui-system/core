// `@once-ui-system/core/media`: media components kept off the root barrel.
// MediaUpload compresses through the optional `compressorjs` peer; the players,
// Scrubber and CompareImage need no peer.
export { CompareImage } from "../../components/CompareImage.js";
export type { MediaAudioPlayerProps } from "../../components/MediaAudioPlayer.js";
export { MediaAudioPlayer } from "../../components/MediaAudioPlayer.js";
export { MediaVideoPlayer } from "../../components/MediaVideoPlayer.js";
export type {
  ScrubberBlock,
  ScrubberFilmstripProps,
  ScrubberMarker,
  ScrubberProps,
  ScrubberRange,
  ScrubberTrack,
  ScrubberWaveformProps,
} from "../../components/Scrubber.js";
export { Scrubber } from "../../components/Scrubber.js";
export { ScrubberFilmstrip, ScrubberWaveform } from "../../components/Scrubber.js";
export type { MediaUploadProps } from "./MediaUpload.js";
export { MediaUpload } from "./MediaUpload.js";
