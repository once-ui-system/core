import { LegalPage, legalMetadata } from "../components/LegalPage";

export const generateMetadata = () => legalMetadata("privacy");

export default function Privacy() {
  return (
    <LegalPage
      page="privacy"
      heading="Privacy"
      text="Acme Notes stores the account details you give us, such as your email address, and the notes your team writes, only to run the service for you. We do not sell your information, and you can ask us to delete your account and your organization's data at any time."
    />
  );
}
