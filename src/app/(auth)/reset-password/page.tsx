"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

function ResetPasswordContent() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        if (!token) {
            alert("Missing reset token");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/auth/password/reset", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });
            const data = await res.json();

            if (res.ok) {
                alert("Password reset successfully! Please sign in.");
                router.push("/sign-in");
            } else {
                alert(data.error || "Failed to reset password");
            }
        } catch (error) {
            alert("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <Card className="w-[400px]">
                <CardHeader>
                    <CardTitle>Invalid Link</CardTitle>
                    <CardDescription>This password reset link is invalid or missing a token.</CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button onClick={() => router.push("/forgot-password")} className="w-full">
                        Request New Link
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    return (
        <Card className="w-[400px]">
            <CardHeader>
                <CardTitle>Reset Password</CardTitle>
                <CardDescription>Enter your new password below</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit}>
                    <div className="grid w-full items-center gap-4">
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="password">New Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="mt-6">
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? "Resetting..." : "Reset Password"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Suspense fallback={<div>Loading...</div>}>
                <ResetPasswordContent />
            </Suspense>
        </div>
    );
}
