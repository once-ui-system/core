// react-native-svg's web build looks up bundled image assets here; the tests and
// the demo draw no image assets, so the lookup finds none.
export function getAssetByID() {
  return undefined;
}
