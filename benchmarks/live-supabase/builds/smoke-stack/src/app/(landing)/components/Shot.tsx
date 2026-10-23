import { Media } from "@once-ui-system/core";

interface ShotProps extends Omit<React.ComponentProps<typeof Media>, "src"> {
  /** A screenshot under /images/landing, without the extension. */
  name: string;
}

/**
 * A product screenshot in the visitor's theme: `name.jpg` is taken in dark
 * mode and `name-light.jpg` in light mode, and only the matching one shows.
 */
export const Shot: React.FC<ShotProps> = ({ name, ...media }) => (
  <>
    <Media dark src={`/images/landing/${name}.jpg`} {...media} />
    <Media light src={`/images/landing/${name}-light.jpg`} {...media} />
  </>
);
