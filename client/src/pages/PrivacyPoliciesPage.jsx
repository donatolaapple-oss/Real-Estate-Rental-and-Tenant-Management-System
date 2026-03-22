import { Logo, Footer } from "../components";

export default function PrivacyPoliciesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 shadow-sm">
        <Logo />
      </header>
      <main className="flex-1 max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Privacy</h1>
        <p className="text-slate-700 leading-relaxed">
          We process account and listing data to run the platform. Cookies store refresh tokens for signed-in
          sessions. Contact your administrator for a full privacy policy tailored to your deployment.
        </p>
      </main>
      <Footer />
    </div>
  );
}
