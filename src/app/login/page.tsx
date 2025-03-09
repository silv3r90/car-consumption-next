import { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Login - KFZ-Stromverbrauchs-Dashboard",
  description: "Login zum KFZ-Stromverbrauchs-Dashboard",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Anmelden
          </h1>
          <p className="text-sm text-muted-foreground">
            Geben Sie Ihre Anmeldedaten ein, um auf die Admin-Funktionen zuzugreifen
          </p>
        </div>
        <LoginForm />
        <p className="px-8 text-center text-sm text-muted-foreground">
          <Link
            href="/"
            className="hover:text-primary underline underline-offset-4"
          >
            Zurück zur Übersicht
          </Link>
        </p>
      </div>
    </div>
  );
}