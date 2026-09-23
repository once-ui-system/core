import {
  Button,
  Column,
  Fade,
  Heading,
  Input,
  Line,
  Logo,
  PasswordInput,
  Row,
  SmartLink,
} from "@once-ui-system/core";
import { Background3 } from "./Background3";

export const Login1 = () => {
  return (
    <Row fill>
      <Row m={{ hide: true }} fill maxWidth={48} padding="8">
        <Row fill radius="l" overflow="hidden" background="page" data-theme="dark">
          <Row fill position="absolute">
            <Background3 />
          </Row>
          <Row
            fill
            position="absolute"
            top="0"
            left="0"
            onBackground="brand-medium"
            pointerEvents="none"
            style={{
              mixBlendMode: "color-dodge",
              userSelect: "none",
              opacity: 0.05,
            }}
          >
            <pre>
              {`
[SYS.IOCORE] :: INIT_PH0X COREBOOT: TRUE - XR-214N_SECURE_CONNECT [HASH:9A2B33FF]
<LINK> SYNC /dsp/timemap/phase_core === OK
[GEN_LOG] PULSE_FRAME => [2D.014.F93] T:3048.21ms | Δt:12.04μs | CLKSYNC:TRUE
[PARSER] >> parseStack(FRAG_ID:4096a-fpx9-DC11b) => STAGE2 COMPLETE
[QUANTUMNET] PingNode: 8a:f3:01:cd:f8:alpha42 -- RTT[±4.023ms]
Auth Token [X-LAYER 3 :: pfx4_KernelClamp::SECTOR:7]
⮑ Decrypt seed_core.vmem... ✓
⮑ Re-alloc TEMP_HEAP: 34.2 MB
⮑ Load /mnt/synx/phase/mindbox.ko → status: PATCHED
SECURE_TUNNEL: ssh-quant[SHA512-X3] → [OK]
REACTOR_INTERFACE: MODE = PASSIVE_OBSERVE
[DROP_EVENT] -> Stream fragment: 6F4C::9F01::B23A:dd78 detected
ERROR_FLAG: BITMASK 0x09 triggered (Δpulse mismatch, subframe drift)
↳ Rerouting through /opt/core_warp/fallback_hub (node: 43.1.9-alpha)

>>> [LOGRHYTHM] SYSTEM SYNC AT PHASE-LOCK ϕ = 3.14159 (ideal)
[FTL-FS]: WriteFrameQueue → CHK: 98% | Status: PartialFlush
[MEMTRACE]: {0x00ffae04} ref_count++ :: THRESHOLD NEAR [warn]

STACK_TICK[9983] > resolve(mind::stack::qubit_state) => OK
>>> [DEBUG/EXPERIMENTAL] Executing SHARD_HARVEST v3.2-beta
core::thread[Ψ-chain.52] : enter STATE_FREEZE :: id: 994e-a2f9
SENSOR.FREQ.LOG [em-spectrum: NIR + UV] = ~unstable~
:: Redirecting logs to TEMPDEV /dev/null_404

[CORE NOTE]
– Kernel patched with async AI-safe module override
– Frame buffer index rotated by π/3 radians
– Sync probe set to soft delay mode (BETA)
– FRAGMENT SHA3: 233xXFF11a994e44a993AC

PROCESS OUTPUT:
{"session_id":"94F-A1B0-CC23","packets_sent":142244,"packets_dropped":223}
[REACTOR_HEARTBEAT] 💓 152 BPM | STATUS: semi-coherent phase
[AI-BUS] Protocol Switch: GPT-5h → GPT-8q :: NLP-TEMP: stabilized at 34.9°C
>>> Begin SUBNET_MERGE [task_id: delta_332] – latency ∇t = +0.0004s

>>> EXOFRAME DETECTED :: LOADER ACTIVE (z-index: ∞)
---BEGIN ENCODED STREAM---
hA4F7X1ZxPQ==:6Vxm++ZfP38kkA77Xa@/z3a4F?ERR
---END ENCODED STREAM---

TRANSLOG:
-> /var/log/mindframe_eco/protocol_mirror.xlog.gz
→ AppendWrite {timestamp: 9829334, hash: 0xe3f29dfaa4}
→ AppendWrite {timestamp: 9829335, hash: 0xe3f29dfaa5}

⟨ENDSYS⟩ :: [fragment of spacetime preserved | status: UNKNOWN]
              `}
            </pre>
          </Row>
          <Fade
            pattern={{ display: true, size: "2" }}
            position="absolute"
            top="0"
            to="bottom"
            topRadius="l"
            height={32}
            fillWidth
          />
          <Column fill padding="xl" zIndex={2} pointerEvents="none">
            <Heading as="h2" variant="display-strong-m" align="center">
              Enter your vault
            </Heading>
          </Column>
        </Row>
      </Row>
      <Column fill center>
        <Column fillWidth center gap="16" padding="32" maxWidth={32}>
          <Logo dark icon="/trademarks/icon-dark.svg" size="l" />
          <Logo light icon="/trademarks/icon-light.svg" size="l" />
          <Heading variant="display-strong-xs" align="center">
            Welcome to Once UI
          </Heading>
          <Row onBackground="neutral-medium" marginBottom="24" gap="4" align="center">
            Log in or
            <SmartLink href="#">sign up</SmartLink>
          </Row>
          <Column fillWidth gap="8">
            <Button
              label="Continue with Google"
              fillWidth
              variant="secondary"
              weight="default"
              prefixIcon="google"
              size="l"
            />
            <Button
              label="Continue with GitHub"
              fillWidth
              variant="secondary"
              weight="default"
              prefixIcon="github"
              size="l"
            />
          </Column>
          <Row fillWidth paddingY="24">
            <Row onBackground="neutral-weak" fillWidth gap="24" vertical="center">
              <Line />/<Line />
            </Row>
          </Row>
          <Column gap="-1" fillWidth>
            <Input id="email" placeholder="Email" corners="top" />
            <PasswordInput id="password" placeholder="Password" corners="bottom" />
          </Column>
          <Button id="login" label="Log in" arrowIcon fillWidth />
        </Column>
      </Column>
    </Row>
  );
};
