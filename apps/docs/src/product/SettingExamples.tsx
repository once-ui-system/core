"use client";

import {
  Setting,
  SettingAxes,
  SettingGroup,
  Column,
  SegmentedControl,
  Slider,
  Switch,
  Text,
} from "@once-ui-system/core";
import { useState } from "react";

export function SettingBasicExample() {
  const [autoplay, setAutoplay] = useState(true);
  const [loop, setLoop] = useState(false);

  return (
    <Column fillWidth gap="8" maxWidth={32}>
      <Setting label="Autoplay" description="Start playing on load">
        <Switch checked={autoplay} onCheckedChange={() => setAutoplay(!autoplay)} />
      </Setting>
      <Setting label="Loop" info="Restarts from the beginning when it reaches the end.">
        <Switch checked={loop} onCheckedChange={() => setLoop(!loop)} />
      </Setting>
    </Column>
  );
}

export function SettingGroupExample() {
  const [enabled, setEnabled] = useState(true);
  const [opacity, setOpacity] = useState(60);
  const [position, setPosition] = useState("bottom-right");

  return (
    <Column fillWidth gap="8" maxWidth={32}>
      <SettingGroup
        label="Watermark"
        control={<Switch checked={enabled} onCheckedChange={() => setEnabled(!enabled)} />}
        open={enabled}
      >
        <Setting label="Opacity">
          <Slider value={opacity} min={0} max={100} onValueChange={setOpacity} />
          <Text wrap="nowrap" variant="label-default-xs" onBackground="neutral-weak">
            {opacity}%
          </Text>
        </Setting>
        <Setting label="Position" controlWidth={18}>
          <SegmentedControl
            fillWidth
            value={position}
            onValueChange={setPosition}
            buttons={[
              { value: "bottom-left", label: "Left" },
              { value: "bottom-right", label: "Right" },
            ]}
          />
        </Setting>
      </SettingGroup>
    </Column>
  );
}

export function SettingAxesExample() {
  const [tilt, setTilt] = useState({ x: 12, y: -6 });

  return (
    <Column fillWidth maxWidth={32}>
      <SettingAxes
        label="Tilt"
        info="Rotates the frame in 3D. Both axes are degrees."
        axes={[
          {
            label: "X",
            control: (
              <Slider
                value={tilt.x}
                min={-45}
                max={45}
                onValueChange={(x) => setTilt((t) => ({ ...t, x }))}
              />
            ),
          },
          {
            label: "Y",
            control: (
              <Slider
                value={tilt.y}
                min={-45}
                max={45}
                onValueChange={(y) => setTilt((t) => ({ ...t, y }))}
              />
            ),
          },
        ]}
      />
    </Column>
  );
}
