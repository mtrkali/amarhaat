import CategoryGrid from "./components/CategoryGrid";
import HeroBanner from "./components/HeroBanner";
import OfferBanner from "./components/OfferBanner";
import PopularProducts from "./components/PopularProducts";
import TrustBadges from "./components/TrustBadges";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 pb-10">
      <HeroBanner />
      <TrustBadges />

      <div className="space-y-10 px-4 pt-8 sm:px-6 lg:px-8">
        <CategoryGrid />
        <OfferBanner />
        <PopularProducts />
      </div>
    </main>
  );
}