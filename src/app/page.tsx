"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// ─── ORIGINAL HOME PAGE (COMMENTED OUT) ─────────────────────────────
// import { useEffect, useState, Suspense } from "react";
// import { useSearchParams, useRouter } from "next/navigation";
// import ShopLayout from "./components/ShopLayout";
// 
// const LANDING_SEEN_KEY = "fhp-landing-seen";
// 
// function HomeContent() {
//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const [isReady, setIsReady] = useState(false);
// 
//   useEffect(() => {
//     const hasSeenLanding = localStorage.getItem(LANDING_SEEN_KEY) === "1";
//     
//     if (!hasSeenLanding) {
//       router.push("/landing");
//     } else {
//       setIsReady(true);
//     }
//   }, [router]);
// 
//   const collection = searchParams.get("collection") || undefined;
//   const isHomepage = !collection;
// 
//   if (!isReady) {
//     return null;
//   }
// 
//   return (
//     <main className="relative min-h-screen overflow-x-hidden">
//       <ShopLayout visible={true} collection={collection} showHeroBanner={isHomepage} isHomepage={isHomepage} />
//     </main>
//   );
// }

// ─── NEW HOME PAGE (REDIRECT TO ALL SIGNS) ──────────────────────────

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to All Signs page
    router.push("/?collection=All");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <p className="text-white">Redirecting to All Signs...</p>
    </div>
  );
}
