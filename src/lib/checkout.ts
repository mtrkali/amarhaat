// Checkout form rules. These are plain functions with no React in them,
// so they are easy to test and to reuse later (for example on the server).

// TODO: confirm which areas Amar Haat really delivers to. These are the upazilas of Feni district.
export const UPAZILAS: readonly string[] = [
    "ফেনী সদর",
    "ছাগলনাইয়া",
    "দাগনভূঞা",
    "ফুলগাজী",
    "পরশুরাম",
    "সোনাগাজী",
];

export type CheckoutValues = {
    name: string;
    phone: string;
    upazila: string;
    union: string;
    ward: string;
    address: string;
    note: string;
};

export type CheckoutField = keyof CheckoutValues;

export type CheckoutErrors = Partial<Record<CheckoutField, string>>;

// The order the fields appear on the page. Used to focus the first field with an error.
export const FIELD_ORDER: CheckoutField[] = [
    "name",
    "phone",
    "upazila",
    "union",
    "ward",
    "address",
    "note",
];

export const emptyCheckoutValues: CheckoutValues = {
    name: "",
    phone: "",
    upazila: "",
    union: "",
    ward: "",
    address: "",
    note: "",
};

const BENGALI_DIGITS = "০১২৩৪৫৬৭৮৯";

// Turns Bengali digits (০-৯) into ordinary digits (0-9).
function toEnglishDigits(input: string): string {
    return input.replace(/[০-৯]/g, (digit) =>
        String(BENGALI_DIGITS.indexOf(digit)),
    );
}

// Turns "০১৭১২-৩৪৫ ৬৭৮" or "+8801712345678" into "01712345678".
export function normalizePhone(input: string): string {
    let phone = toEnglishDigits(input).replace(/[\s\-()]/g, "");

    if (phone.startsWith("+880")) {
        phone = "0" + phone.slice(4);
    } else if (phone.startsWith("880") && phone.length === 13) {
        phone = "0" + phone.slice(3);
    }

    return phone;
}

// Bangladesh mobile numbers: 01 + a digit from 3 to 9 + 8 more digits.
const PHONE_PATTERN = /^01[3-9]\d{8}$/;

export type ValidationResult =
    | { ok: true; values: CheckoutValues }
    | { ok: false; errors: CheckoutErrors };

export function validateCheckout(values: CheckoutValues): ValidationResult {
    const cleaned: CheckoutValues = {
        name: values.name.trim().replace(/\s+/g, " "),
        phone: normalizePhone(values.phone),
        upazila: values.upazila,
        union: values.union.trim().replace(/\s+/g, " "),
        ward: toEnglishDigits(values.ward.trim()),
        address: values.address.trim(),
        note: values.note.trim(),
    };

    const errors: CheckoutErrors = {};

    if (!cleaned.name) {
        errors.name = "আপনার নাম লিখুন।";
    } else if (cleaned.name.length < 2) {
        errors.name = "নাম অন্তত ২ অক্ষরের হতে হবে।";
    } else if (cleaned.name.length > 80) {
        errors.name = "নাম ৮০ অক্ষরের বেশি হতে পারবে না।";
    }

    if (!cleaned.phone) {
        errors.phone = "মোবাইল নম্বর লিখুন।";
    } else if (!PHONE_PATTERN.test(cleaned.phone)) {
        errors.phone = "সঠিক মোবাইল নম্বর দিন, যেমন 01XXXXXXXXX।";
    }

    if (!UPAZILAS.includes(cleaned.upazila)) {
        errors.upazila = "আপনার উপজেলা বেছে নিন।";
    }

    if (!cleaned.union) {
        errors.union = "আপনার ইউনিয়ন বা পৌরসভার নাম লিখুন।";
    } else if (cleaned.union.length < 2) {
        errors.union = "নামটি অন্তত ২ অক্ষরের হতে হবে।";
    } else if (cleaned.union.length > 50) {
        errors.union = "নাম ৫০ অক্ষরের বেশি হতে পারবে না।";
    }

    // The ward number is optional, but if it is given it must be a number from 1 to 99.
    if (cleaned.ward) {
        const ward = /^\d{1,2}$/.test(cleaned.ward) ? Number(cleaned.ward) : NaN;

        if (!Number.isInteger(ward) || ward < 1 || ward > 99) {
            errors.ward = "ওয়ার্ড নম্বর ১ থেকে ৯৯-এর মধ্যে একটি সংখ্যা হতে হবে।";
        } else {
            cleaned.ward = String(ward);
        }
    }

    if (!cleaned.address) {
        errors.address = "ডেলিভারির ঠিকানা লিখুন।";
    } else if (cleaned.address.length < 10) {
        errors.address = "ঠিকানা আরও বিস্তারিত লিখুন (বাড়ি, রাস্তা, গ্রাম বা মহল্লা)।";
    } else if (cleaned.address.length > 300) {
        errors.address = "ঠিকানা ৩০০ অক্ষরের বেশি হতে পারবে না।";
    }

    if (cleaned.note.length > 300) {
        errors.note = "নোট ৩০০ অক্ষরের বেশি হতে পারবে না।";
    }

    if (Object.keys(errors).length > 0) {
        return { ok: false, errors };
    }

    return { ok: true, values: cleaned };
}