"use client";

import { Column, Row, SegmentedControl, Tag, Text } from "@once-ui-system/core";
import {
  Scene,
  SceneGroup,
  SceneLabel,
  SceneMesh,
  useSceneFrame,
} from "@once-ui-system/core/scene";
import { useRef, useState } from "react";
import type { Group } from "three";

export const SceneBasicExample = () => (
  <Scene
    height={384}
    controls="turntable"
    floor
    labels={{ scene: "A ring and two shapes on a turntable" }}
  >
    <SceneMesh
      geometry="torus"
      args={[0.6, 0.18]}
      position={[0, 0.9, 0]}
      color="brand-strong"
      metalness={0.5}
      roughness={0.3}
    />
    <SceneMesh geometry="sphere" args={[0.35]} position={[-1.3, 0.35, 0.4]} color="accent-strong" />
    <SceneMesh
      geometry="capsule"
      args={[0.2, 0.5]}
      position={[1.3, 0.45, -0.3]}
      color="success-medium"
    />
  </Scene>
);

const ROBOTS = [
  { id: "KR-07", name: "Sparrow", battery: 82 },
  { id: "KR-14", name: "Finch", battery: 23 },
];

/** A robot built from primitives: the head looks around and the arm swings. */
function Robot({
  battery,
  selected,
  onSelect,
}: {
  battery: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const head = useRef<Group>(null);
  const arm = useRef<Group>(null);
  useSceneFrame(({ elapsed }) => {
    if (head.current) head.current.rotation.y = Math.sin(elapsed * 1.2) * 0.35;
    if (arm.current) arm.current.rotation.x = Math.sin(elapsed * 1.6) * 0.5;
  });
  const low = battery < 30;
  return (
    <SceneGroup onClick={onSelect}>
      <SceneMesh args={[1.6, 0.5, 1.2]} position={[0, 0.45, 0]} color="neutral-weak" />
      {[-0.65, 0.65].flatMap((x) =>
        [-0.5, 0.5].map((z) => (
          <SceneMesh
            key={`${x}:${z}`}
            geometry="cylinder"
            args={[0.25, 0.25, 0.18]}
            position={[x, 0.25, z]}
            rotation={[Math.PI / 2, 0, 0]}
            color="neutral-strong"
          />
        )),
      )}
      <SceneMesh
        args={[1.1, 1, 0.9]}
        position={[0, 1.2, 0]}
        color="neutral-medium"
        metalness={0.3}
        roughness={0.35}
      />
      <SceneMesh
        args={[0.5 * (battery / 100), 0.08, 0.02]}
        position={[-0.25 + 0.25 * (battery / 100), 1.35, 0.46]}
        color={low ? "warning-strong" : "success-strong"}
        emissive={low ? "warning-strong" : "success-strong"}
      />
      <SceneGroup ref={head} position={[0, 1.95, 0]}>
        <SceneMesh args={[0.8, 0.5, 0.6]} color="neutral-medium" metalness={0.3} roughness={0.35} />
        <SceneMesh
          args={[0.6, 0.16, 0.02]}
          position={[0, 0.02, 0.31]}
          color="brand-strong"
          emissive="brand-strong"
        />
        <SceneMesh
          geometry="cylinder"
          args={[0.02, 0.02, 0.35]}
          position={[0.25, 0.42, 0]}
          color="neutral-strong"
        />
        <SceneMesh
          geometry="sphere"
          args={[0.06]}
          position={[0.25, 0.62, 0]}
          color="brand-strong"
          emissive="brand-strong"
        />
        <SceneLabel position={[0, 0.85, 0]}>
          <Tag tone={selected ? "brand" : low ? "warning" : "neutral"} label={`${battery}%`} />
        </SceneLabel>
      </SceneGroup>
      <SceneGroup ref={arm} position={[0.65, 1.5, 0]}>
        <SceneMesh args={[0.18, 0.7, 0.18]} position={[0, -0.3, 0]} color="neutral-medium" />
        <SceneMesh args={[0.28, 0.12, 0.28]} position={[0, -0.7, 0]} color="accent-strong" />
      </SceneGroup>
    </SceneGroup>
  );
}

export const SceneRobotExample = () => {
  const [robot, setRobot] = useState(ROBOTS[0].id);
  const [selected, setSelected] = useState(false);
  const current = ROBOTS.find((r) => r.id === robot) ?? ROBOTS[0];
  return (
    <Column fillWidth gap="12">
      <Row gap="12" vertical="center" wrap>
        <SegmentedControl
          value={robot}
          onValueChange={setRobot}
          fillWidth={false}
          buttons={ROBOTS.map((r) => ({ value: r.id, label: `${r.id} ${r.name}` }))}
        />
        <Text textVariant="body-default-s" onBackground="neutral-weak">
          {selected ? "Selected: the label turns brand." : "Click the robot to select it."}
        </Text>
      </Row>
      <Scene
        height={448}
        floor="grid"
        camera={{ position: [4.5, 3.2, 5.5], target: [0, 1.1, 0] }}
        labels={{ scene: `Robot ${current.id} ${current.name}, battery ${current.battery}%` }}
      >
        <Robot
          battery={current.battery}
          selected={selected}
          onSelect={() => setSelected((s) => !s)}
        />
      </Scene>
    </Column>
  );
};
