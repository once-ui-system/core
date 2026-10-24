// Auth pages depend on the environment (demo mode or live), so render per request.
export const dynamic = "force-dynamic";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
