import type { Metadata } from "next"
import SignInClientPage from "./SignInClientPage"

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your account",
}

export default function SignInPage() {
  return <SignInClientPage />
}
