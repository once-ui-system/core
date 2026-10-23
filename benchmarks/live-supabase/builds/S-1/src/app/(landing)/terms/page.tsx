import { LegalPage, legalMetadata } from "../components/LegalPage";

export const generateMetadata = () => legalMetadata("terms");

export default function Terms() {
  return (
    <LegalPage
      page="terms"
      heading="Terms"
      text="By using Acme Notes you agree to use it lawfully and to keep your sign-in details safe. Your organization's notes belong to you. The service is provided as is, and plans can be changed or cancelled at any time from your organization's settings."
    />
  );
}
