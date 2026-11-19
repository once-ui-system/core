/**
 * Feedback on the docs goes to Once UI's board on Chirio
 * (chirio.dev/b/once-ui). The header's Feedback and What's new buttons open a
 * drawer that Chirio's board widget fills: anyone reading the docs can post a
 * bug or an idea with a screenshot of the page, or read what's new.
 *
 * Who is posting comes from once-ui.com, never from the docs: the widget asks
 * once-ui.com/api/feedback-token (the session cookie is on .once-ui.com, so it
 * travels with the request). Someone signed in there gets Chirio's pin
 * feedback (click the page, comment on the spot); everyone else gets the
 * board's form and signs in on the board by email.
 *
 * once-ui.com answers only https://docs.once-ui.com, so the token URL is set
 * on the production deployment alone: anywhere else (localhost, CI, preview
 * URLs) the fetch would be refused and log a CORS error on every page.
 */
export const feedback = {
  board: "once-ui",
  chirio: "https://www.chirio.dev",
  tokenUrl:
    process.env.VERCEL_ENV === "production"
      ? "https://once-ui.com/api/feedback-token"
      : undefined,
};

export const feedbackBoardUrl = `${feedback.chirio}/b/${feedback.board}`;
