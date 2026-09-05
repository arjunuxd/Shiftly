import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { resolve } from "node:path";

const sa = resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS ?? "");
const API_KEY = process.env.VITE_FIREBASE_API_KEY ?? "";
const BASE = process.env.API_BASE_URL ?? "http://localhost:4000";

if (!sa || !API_KEY) {
  console.error("missing env");
  process.exit(1);
}

const app = initializeApp({ credential: cert(sa) });
const auth = getAuth(app);

const uid = "upload-probe-seeker-" + Date.now();

async function getIdToken() {
  const token = await auth.createCustomToken(uid, { role: "job_seeker", emailVerified: true });
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, returnSecureToken: true }),
    },
  );
  const data = await res.json();
  if (!data.idToken) throw new Error("no idToken: " + JSON.stringify(data));
  return data.idToken;
}

async function call(method, path, token, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, text: await res.text() };
}

const pdfBase64 = "JVBERi0xLjQKJcfsj6IK";
const pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

const token = await getIdToken();

const photoOk = await call("POST", "/api/uploads/photo", token, {
  dataUrl: `data:image/png;base64,${pngBase64}`,
  fileName: "face.png",
  size: 70,
});
console.log("photo_ok", photoOk.status, short(photoOk.text));

const photoBadType = await call("POST", "/api/uploads/photo", token, {
  dataUrl: `data:application/pdf;base64,${pdfBase64}`,
  fileName: "notaphoto.pdf",
  size: 10,
});
console.log("photo_bad_type", photoBadType.status, short(photoBadType.text));

const photoTooBig = await call("POST", "/api/uploads/photo", token, {
  dataUrl: `data:image/png;base64,${"A".repeat(800000)}`,
  fileName: "huge.png",
  size: 600000,
});
console.log("photo_too_big", photoTooBig.status, short(photoTooBig.text));

const resumeOk = await call("POST", "/api/uploads/resume", token, {
  dataUrl: `data:application/pdf;base64,${pdfBase64}`,
  fileName: "resume.pdf",
  size: 15,
});
console.log("resume_ok", resumeOk.status, short(resumeOk.text));

const resumeBadType = await call("POST", "/api/uploads/resume", token, {
  dataUrl: `data:image/png;base64,${pngBase64}`,
  fileName: "resume.png",
  size: 70,
});
console.log("resume_bad_type", resumeBadType.status, short(resumeBadType.text));

const certOk = await call("POST", "/api/uploads/certificate", token, {
  certificateId: "cert-123",
  dataUrl: `data:application/pdf;base64,${pdfBase64}`,
  fileName: "cert.pdf",
  size: 15,
});
console.log("cert_ok", certOk.status, short(certOk.text));

const certBadId = await call("POST", "/api/uploads/certificate", token, {
  certificateId: "x".repeat(100),
  dataUrl: `data:application/pdf;base64,${pdfBase64}`,
  fileName: "cert.pdf",
  size: 10,
});
console.log("cert_bad_id", certBadId.status, short(certBadId.text));

const resumeDel = await call("DELETE", "/api/uploads/resume", token);
console.log("resume_del", resumeDel.status, short(resumeDel.text));

const certDel = await call("DELETE", `/api/uploads/certificate/${encodeURIComponent("cert-123")}`, token);
console.log("cert_del", certDel.status, short(certDel.text));

const photoDel = await call("DELETE", "/api/uploads/photo", token);
console.log("photo_del", photoDel.status, short(photoDel.text));

const unknownRoute = await call("GET", "/api/uploads/doesnotexist", token);
console.log("unknown_route", unknownRoute.status, short(unknownRoute.text));

function short(s) {
  return s.length > 140 ? s.slice(0, 140) + "..." : s;
}

process.exit(0);