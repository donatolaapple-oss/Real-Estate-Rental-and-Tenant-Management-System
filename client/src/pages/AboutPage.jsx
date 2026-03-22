import { Logo, Footer } from "../components";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 shadow-sm">
        <Logo />
      </header>
      <main className="flex-1 max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">About StayScout</h1>
        <p className="text-slate-700 leading-relaxed">
          StayScout helps tenants discover boarding houses and helps landlords manage listings, analytics, and
          messaging in the Tupi area. Property Plus powers core rental workflows behind the scenes.
        </p>
      </main>
      <Footer />
    </div>
  );
}
