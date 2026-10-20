import Image from "next/image";
import Link from "next/link";
import { sellers } from "../../lib/mock-sellers";
import SectionHeader from "./SectionHeader";

export default function FeaturedSellers() {
    return (
        <section aria-labelledby="sellers-heading">
            <SectionHeader
                id="sellers-heading"
                title="আমাদের কিছু সফল সেলার"
                href="/sellers"
            />

            <ul className="grid grid-cols-4 gap-3">
                {sellers.map((seller) => (
                    <li key={seller.id}>
                        <Link
                            href={seller.href}
                            className="flex flex-col items-center gap-2 text-center"
                        >
                            <span className="relative flex size-16 items-center justify-center overflow-hidden rounded-full bg-surface-green text-3xl ring-2 ring-border sm:size-24 sm:text-5xl">
                                {seller.image ? (
                                    <Image
                                        src={seller.image}
                                        alt=""
                                        fill
                                        sizes="96px"
                                        className="object-cover"
                                    />
                                ) : (
                                    <span aria-hidden="true">
                                        {seller.emoji}
                                    </span>
                                )}
                            </span>

                            <span className="text-xs leading-tight sm:text-sm">
                                <span className="block font-semibold text-foreground">
                                    {seller.name}
                                </span>
                                <span className="block text-muted-foreground">
                                    {seller.category}
                                </span>
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    );
}