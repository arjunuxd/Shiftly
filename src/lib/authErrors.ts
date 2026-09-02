const SAFE_MESSAGES: Record<string, string> = {
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/missing-password": "Please enter your password.",
  "auth/weak-password": "Please choose a stronger password.",
  "auth/invalid-credential":
    "The email or password you entered is incorrect.",
  "auth/wrong-password": "The email or password you entered is incorrect.",
  "auth/user-not-found": "The email or password you entered is incorrect.",
  "auth/email-already-in-use":
    "This email is already registered. Try signing in instead.",
  "auth/too-many-requests":
    "Too many attempts. Please try again in a little while.",
  "auth/network-request-failed":
    "Network error. Please check your connection and try again.",
  "auth/user-disabled": "This account has been disabled. Contact support.",
  "auth/invalid-action-code": "This link is invalid or has expired.",
  "auth/operation-not-allowed":
    "This sign-in option is not available right now.",
  "auth/email-not-verified": "Please verify your email to continue.",
};

export function getAuthErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "code" in error) {
    const code = (error as { code: unknown }).code;
    if (typeof code === "string" && SAFE_MESSAGES[code]) {
      return SAFE_MESSAGES[code];
    }
  }
  return "Something went wrong. Please try again.";
}
