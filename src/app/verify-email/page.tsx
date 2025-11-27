"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const router = useRouter();
    const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("No verification token provided");
            return;
        }

        const verify = async () => {
            try {
                const res = await fetch("/api/auth/verify-email", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token }),
                });
                const data = await res.json();

                if (res.ok) {
                    setStatus("success");
                } else {
                    setStatus("error");
                    setMessage(data.error || "Verification failed");
                }
            } catch (error) {
                setStatus("error");
                setMessage("An error occurred");
            }
        };

        verify();
    }, [token]);

    return (
        <Card className="w-[400px]">
            <CardHeader>
                <CardTitle>Email Verification</CardTitle>
                <CardDescription>Verifying your email address...</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
                {status === "verifying" && <p>Please wait...</p>}
                {status === "success" && (
                    <>
                        <p className="text-green-600 font-medium">Email verified successfully!</p>
                        <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
                    </>
                )}
                {status === "error" && (
                    <>
                        <p className="text-red-600 font-medium">Verification failed</p>
                        <p className="text-sm text-gray-500">{message}</p>
                        <Button variant="outline" onClick={() => router.push("/sign-in")}>Back to Sign In</Button>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

export default function VerifyEmailPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Suspense fallback={<div>Loading...</div>}>
                <VerifyEmailContent />
            </Suspense>
        </div>
    );
}
