import AuthForm from "@/components/auth-form";

export const metadata = { title: "Créer un compte" };

export default function CreateAccountPage() {
  return <AuthForm register />;
}