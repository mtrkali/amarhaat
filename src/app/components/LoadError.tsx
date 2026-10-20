type LoadErrorProps = {
    message?: string;
};

// Shown in place of a page's content when the backend cannot be reached.
export default function LoadError({ message }: LoadErrorProps) {
    return (
        <div
            role="alert"
            className="rounded-2xl border border-border bg-card p-8 text-center"
        >
            <p className="text-lg font-semibold text-foreground">
                তথ্য লোড করা যায়নি
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
                {message ??
                    "সার্ভারের সাথে যোগাযোগ করা যাচ্ছে না। কিছুক্ষণ পর পেজটি রিফ্রেশ করুন।"}
            </p>
        </div>
    );
}
