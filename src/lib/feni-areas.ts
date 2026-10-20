// Administrative areas of Feni district: for each upazila, its pourashava (municipality, if any)
// and its unions. Source: the official Feni district portal (feni.gov.bd) and the upazila portals.
// In total: 6 upazilas, 5 pourashavas and 43 unions. Local government areas can be reorganised,
// so check this list against the official portal from time to time.

export type AreaType = "pourashava" | "union";

export type Area = {
    name: string;
    type: AreaType;
};

const pourashava = (name: string): Area => ({ name, type: "pourashava" });

const unions = (...names: string[]): Area[] =>
    names.map((name): Area => ({ name, type: "union" }));

export const AREAS_BY_UPAZILA: Record<string, Area[]> = {
    "ফেনী সদর": [
        pourashava("ফেনী পৌরসভা"),
        ...unions(
            "শর্শদি",
            "পাঁচগাছিয়া",
            "ধর্মপুর",
            "কাজিরবাগ",
            "কালিদহ",
            "বালিগাঁও",
            "ধলিয়া",
            "লেমুয়া",
            "ছনুয়া",
            "মোটবী",
            "ফরহাদনগর",
            "ফাজিলপুর",
        ),
    ],
    "ছাগলনাইয়া": [
        pourashava("ছাগলনাইয়া পৌরসভা"),
        ...unions("মহামায়া", "পাঠাননগর", "রাধানগর", "শুভপুর", "ঘোপাল"),
    ],
    "দাগনভূঞা": [
        pourashava("দাগনভূঞা পৌরসভা"),
        ...unions(
            "সিন্দুরপুর",
            "রাজাপুর",
            "পূর্বচন্দ্রপুর",
            "রামনগর",
            "ইয়াকুবপুর",
            "দাগনভূঞা",
            "মাতুভূঞা",
            "জায়লস্কর",
        ),
    ],
    // Fulgazi has no pourashava.
    "ফুলগাজী": unions(
        "ফুলগাজী",
        "মুন্সিরহাট",
        "দরবারপুর",
        "আনন্দপুর",
        "আমজাদহাট",
        "জি.এম. হাট",
    ),
    "পরশুরাম": [
        pourashava("পরশুরাম পৌরসভা"),
        ...unions("মির্জানগর", "চিথলিয়া", "বক্সমাহমুদ"),
    ],
    "সোনাগাজী": [
        pourashava("সোনাগাজী পৌরসভা"),
        ...unions(
            "চরমজলিশপুর",
            "বগাদানা",
            "মঙ্গলকান্দি",
            "মতিগঞ্জ",
            "চরদরবেশ",
            "চরচান্দিয়া",
            "সোনাগাজী",
            "আমিরাবাদ",
            "নবাবপুর",
        ),
    ],
};

export function getAreas(upazila: string): Area[] {
    return Object.prototype.hasOwnProperty.call(AREAS_BY_UPAZILA, upazila)
        ? AREAS_BY_UPAZILA[upazila]
        : [];
}

export function isValidArea(upazila: string, name: string): boolean {
    return getAreas(upazila).some((area) => area.name === name);
}

// Feni Pourashava has 18 wards. Every other pourashava and every union has 9.
export function getWardCount(upazila: string, name: string): number {
    return upazila === "ফেনী সদর" && name === "ফেনী পৌরসভা" ? 18 : 9;
}

const BENGALI_DIGITS = "০১২৩৪৫৬৭৮৯";

// 12 -> "১২"
export function toBengaliDigits(value: number | string): string {
    return String(value).replace(
        /\d/g,
        (digit) => BENGALI_DIGITS[Number(digit)],
    );
}