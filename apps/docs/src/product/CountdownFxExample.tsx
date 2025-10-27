'use client';

import { Column, Row, Text, CountdownFx, Heading } from "@once-ui-system/core";

export const CountdownFxBasic = () => {
  return (
    <Column gap="16" fill center>
      <CountdownFx
        targetDate={new Date(Date.now() + 24 * 60 * 60 * 1000)}
        variant="display-strong-l"
        format="HH:MM:SS"
      />
    </Column>
  );
};

export const CountdownFxFormats = () => {
  return (
    <Column gap="24" fill>
      <Column gap="8">
        <Text variant="label-default-s" onBackground="neutral-weak">HH:MM:SS</Text>
        <CountdownFx
          targetDate={new Date(Date.now() + 5 * 60 * 60 * 1000)}
          variant="heading-strong-l"
          format="HH:MM:SS"
        />
      </Column>
      <Column gap="8">
        <Text variant="label-default-s" onBackground="neutral-weak">MM:SS</Text>
        <CountdownFx
          targetDate={new Date(Date.now() + 10 * 60 * 1000)}
          variant="heading-strong-l"
          format="MM:SS"
        />
      </Column>
      <Column gap="8">
        <Text variant="label-default-s" onBackground="neutral-weak">DD:HH:MM:SS</Text>
        <CountdownFx
          targetDate={new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)}
          variant="heading-strong-l"
          format="DD:HH:MM:SS"
        />
      </Column>
    </Column>
  );
};

export const CountdownFxEffects = () => {
  return (
    <Column gap="24" fill>
      <Column gap="8">
        <Text variant="label-default-s" onBackground="neutral-weak">Wheel Effect</Text>
        <CountdownFx
          targetDate={new Date(Date.now() + 2 * 60 * 60 * 1000)}
          variant="display-strong-m"
          effect="wheel"
        />
      </Column>
      <Column gap="8">
        <Text variant="label-default-s" onBackground="neutral-weak">Smooth Effect</Text>
        <CountdownFx
          targetDate={new Date(Date.now() + 2 * 60 * 60 * 1000)}
          variant="display-strong-m"
          effect="smooth"
        />
      </Column>
      <Column gap="8">
        <Text variant="label-default-s" onBackground="neutral-weak">Simple Effect</Text>
        <CountdownFx
          targetDate={new Date(Date.now() + 2 * 60 * 60 * 1000)}
          variant="display-strong-m"
          effect="simple"
        />
      </Column>
    </Column>
  );
};

export const CountdownFxLaunch = () => {
  return (
    <Column
      gap="16"
      fill
      center
      padding="32"
      data-solid="contrast"
      radius="l"
    >
      <Heading variant="display-strong-xl" align="center">
        Launching Soon
      </Heading>
      <CountdownFx
        targetDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}
        variant="display-strong-l"
        format="DD:HH:MM:SS"
        onBackground="brand-medium"
      />
      <Text variant="body-default-m" onBackground="neutral-weak" align="center">
        Get ready for something amazing
      </Text>
    </Column>
  );
};

export const CountdownFxOnComplete = () => {
  const handleComplete = () => {
    console.log('Countdown complete!');
  };

  return (
    <CountdownFx
      targetDate={new Date(Date.now() + 5000)}
      variant="heading-strong-l"
      format="MM:SS"
      onComplete={handleComplete}
    />
  );
};
