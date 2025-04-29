import type { Metadata } from "next"
import SignUpClientPage from "./signup-client-page"

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create a new account",
}

export default function SignUpPage() {
  return <SignUpClientPage />
}
