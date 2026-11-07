export const metadata = {
  title: "Admin · NESCAFÉ Make Your World",
  robots: { index: false, follow: false }
};

// Every admin page, the sign-in page included: a normal scrolling web page, unlike the full-screen kiosk screens.
export default function AdminRootLayout({ children }) {
  return <div className="admin-app">{children}</div>;
}
