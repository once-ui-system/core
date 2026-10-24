import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function EmailField() {
  return (
    <div className="space-y-2">
      <Label htmlFor="email">Email</Label>
      <Input id="email" name="email" type="email" autoComplete="email" required />
    </div>
  );
}

export function PasswordField({ id = "password", label = "Password", autoComplete = "current-password" }: { id?: string; label?: string; autoComplete?: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name="password" type="password" autoComplete={autoComplete} minLength={8} required />
    </div>
  );
}
