import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0faf5] to-white">
      <header className="max-w-4xl mx-auto px-4 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#1B6B4A] rounded-lg flex items-center justify-center">
            <span className="text-white">🐟</span>
          </div>
          <span className="text-xl font-bold text-[#1B6B4A]">StockBoard</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 font-medium">
            Sign in
          </Link>
          <Link href="/signup">
            <Button size="sm">Get started free</Button>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
          🌿 Live in under 5 minutes, free forever
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-4">
          The live inventory board<br />
          <span className="text-[#1B6B4A]">for aquarium sellers</span>
        </h1>

        <p className="text-lg text-gray-600 max-w-xl mx-auto mb-8">
          Local fish stores and breeders publish a real-time livestock availability page.
          Buyers browse what&apos;s in stock — no phone tag, no buried Facebook posts.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
          <Link href="/signup">
            <Button size="lg" className="text-base px-8">
              Create your board — free
            </Button>
          </Link>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 text-left">
          {[
            {
              icon: "⚡",
              title: "Live in minutes",
              desc: "Add your first item in 15 seconds. Share your link. Done.",
            },
            {
              icon: "📱",
              title: "Mobile-first",
              desc: "Update stock from your phone while walking the floor. Camera built in.",
            },
            {
              icon: "🔍",
              title: "Species autocomplete",
              desc: "2,000+ species with care data. Tap to add — category fills automatically.",
            },
            {
              icon: "🏷️",
              title: "Just In badges",
              desc: "New shipments get a 72-hour badge so buyers know what just arrived.",
            },
            {
              icon: "🔔",
              title: "Restock alerts",
              desc: "Buyers sign up for notifications on sold-out species.",
            },
            {
              icon: "📸",
              title: "WYSIWYG support",
              desc: "For coral frags and unique pieces. Photo is the listing. Auto-archives when sold.",
            },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="text-2xl mb-2">{icon}</div>
              <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
              <p className="text-sm text-gray-500">{desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-white rounded-3xl border border-gray-100 p-8 max-w-lg mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Simple pricing</h2>
          <p className="text-gray-500 mb-6">Start free. Upgrade when you need more.</p>
          <div className="space-y-3 text-left">
            {[
              { tier: "Free", price: "$0/mo", features: "25 items, 1 photo/item, public board" },
              { tier: "Pro", price: "$9.99/mo", features: "100 items, 3 photos, shipment badges, WYSIWYG" },
              { tier: "Shop", price: "$24.99/mo", features: "Unlimited items, 5 photos, everything" },
            ].map(({ tier, price, features }) => (
              <div key={tier} className="flex items-start justify-between p-3 rounded-xl border border-gray-100">
                <div>
                  <span className="font-semibold text-gray-900">{tier}</span>
                  <p className="text-xs text-gray-500">{features}</p>
                </div>
                <span className="font-bold text-[#1B6B4A] whitespace-nowrap">{price}</span>
              </div>
            ))}
          </div>
          <Link href="/signup" className="mt-5 block">
            <Button size="lg" className="w-full">Start free today</Button>
          </Link>
        </div>
      </main>

      <footer className="text-center py-8 text-xs text-gray-400">
        © 2026 StockBoard · Built for the aquarium hobby
      </footer>
    </div>
  );
}
