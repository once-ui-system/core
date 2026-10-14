import { createInterface } from "node:readline/promises";

/** Ask one question on the terminal. Throws when there is no terminal to ask on. */
export async function ask(question: string): Promise<string> {
  if (!process.stdin.isTTY) {
    throw new Error("This step needs an answer, but stdin is not a terminal.");
  }
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    return (await rl.question(question)).trim();
  } finally {
    rl.close();
  }
}

/** Read all of stdin, for `echo $TOKEN | once-ui login`. */
export async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString("utf8").trim();
}
