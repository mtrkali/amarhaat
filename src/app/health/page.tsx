"use client";

import { useEffect, useState } from "react";
import { getHealth, type HealthResponse } from "../../lib/api";

export default function HealthPage() {
    const [data, setData] = useState<HealthResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getHealth()
            .then((response) => {
                setData(response);
            })
            .catch((error) => {
                setError(error.message);
            });
    }, []);

    if (error) {
        return <p>Backend connection failed: {error}</p>;
    }

    if (!data) {
        return <p>Connecting to backend...</p>;
    }

    return (
        <main>
            <h1>Amar Haat API Health</h1>

            <p>{data.message}</p>

            <p>
                Status: {data.success ? "Backend Connected ✅" : "Backend Error ❌"}
            </p>
        </main>
    );
}