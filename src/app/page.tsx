"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ShopLayout from "./components/ShopLayout";

const LANDING_SEEN_KEY = "fhp-landing-seen";

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const hasSeenLanding = localStorage.getItem(LANDING_SEEN_KEY) === "1";
    
    if (!hasSeenLanding) {
      router.push("/landing");
    } else {
      setIsReady(true);
    }
  }, [router]);

  const collection = searchParams.get("collection") || "All";
  const isHomepage = false;

  if (!isReady) {
    return null;
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <ShopLayout visible={true} collection={collection} showHeroBanner={false} isHomepage={isHomepage} />
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
