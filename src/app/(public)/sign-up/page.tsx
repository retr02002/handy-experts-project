import { redirect } from "next/navigation";

// OTP unifies login-or-register into one step now (verifying a phone that
// has no matching account creates one on the spot) — there's no longer a
// meaningfully different "create account" page for customers, so old links
// to /sign-up just land on /sign-in instead of 404ing.
export default function SignUpPage() {
  redirect("/sign-in");
}
