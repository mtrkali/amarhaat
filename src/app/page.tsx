import CategoryGrid from "./components/CategoryGrid";
import FaqSection from "./components/FaqSection";
import FeaturedSellers from "./components/FeaturedSellers";
import HeroBanner from "./components/HeroBanner";
import JoinUsBanner from "./components/JoinUsBanner";
import OfferBanner from "./components/OfferBanner";
import PopularProducts from "./components/PopularProducts";
import SellerCta from "./components/SellerCta";
import StartShoppingCta from "./components/StartShoppingCta";
import Testimonials from "./components/Testimonials";
import TrustBadges from "./components/TrustBadges";
import WhyAmarHaat from "./components/WhyAmarHaat";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 pb-10">
      <HeroBanner />
      <TrustBadges />

      <div className="space-y-10 px-4 pt-8 sm:px-6 lg:px-8">
        <CategoryGrid />
        <OfferBanner image="/images/offer.webp" />
        <PopularProducts />
        <WhyAmarHaat />
        <StartShoppingCta />

        {/* On large screens these pairs sit side by side; on smaller screens they stack. */}
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-8">
          <FeaturedSellers />
          <SellerCta image="/images/shop.webp" />
        </div>

        <Testimonials />

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-8">
          <FaqSection />
          <JoinUsBanner image="/images/feni-bridge.webp" />
        </div>
      </div>
    </main>
  );
}