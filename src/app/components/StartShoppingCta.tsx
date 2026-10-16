import Link from "next/link";

export default function StartShoppingCta() {
    return (
        <section aria-labelledby="start-heading">
            <div className="relative overflow-hidden rounded-2xl bg-banner p-6 text-banner-foreground md:p-10">
                <div className="relative z-10 max-w-[70%] md:max-w-lg">
                    <h2
                        id="start-heading"
                        className="text-xl font-bold leading-snug md:text-3xl"
                    >
                        এখনই শুরু করুন আপনার কেনাকাটার যাত্রা
                    </h2>

                    <p className="mt-2 text-sm text-banner-foreground/85 md:text-base">
                        লগইন করুন বা অতিথি হিসেবে অর্ডার করুন।
                    </p>

                    {/* TODO: /login and /checkout do not exist yet. */}
                    <div className="mt-5 flex flex-wrap gap-3">
                        <Link
                            href="/login"
                            className="inline-flex h-11 items-center rounded-full border border-white/60 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                        >
                            লগইন করুন
                        </Link>

                        <Link
                            href="/checkout"
                            className="inline-flex h-11 items-center rounded-full bg-white px-5 text-sm font-semibold text-green-900 transition-colors hover:bg-green-50"
                        >
                            অতিথি হিসেবে অর্ডার করুন
                        </Link>
                    </div>
                </div>

                {/* Placeholder decoration. */}
                <div
                    aria-hidden="true"
                    className="absolute bottom-3 right-4 select-none text-6xl md:text-8xl"
                >
                    🛍️
                </div>
            </div>
        </section>
    );
}