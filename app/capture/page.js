import { cookies } from "next/headers";
import CaptureScreen from "@/components/CaptureScreen";
import VerifyScreen from "@/components/VerifyScreen";
import { SESSION_COOKIE, readSessionToken } from "@/lib/session";

export const dynamic = "force-dynamic";

// /capture shows the code screen until the visitor has entered a valid code, then the capture step. Deciding it here
// (not with a rewrite in proxy.js) keeps it working behind a reverse proxy, where the app can't tell its own address.
export default async function CapturePage() {
  let verified = false;
  try {
    verified = Boolean(readSessionToken((await cookies()).get(SESSION_COOKIE)?.value));
  } catch (error) {
    console.error("Unable to read session", error.message);
  }
  return verified ? <CaptureScreen /> : <VerifyScreen />;
}
