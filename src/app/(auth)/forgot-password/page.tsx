"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await fetch("/api/auth/password/forgot", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            // Always show success message
            setSubmitted(true);
        } catch (error) {
            // Ignore error
            setSubmitted(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Card className="w-[400px]">
                <CardHeader>
                    <CardTitle>Forgot Password</CardTitle>
                    <CardDescription>Enter your email to reset your password</CardDescription>
                </CardHeader>
                <CardContent>
                    {submitted ? (
                        <div className="text-center space-y-4">
                            <div className="p-4 bg-green-50 text-green-700 rounded-lg">
                                If an account exists with that email, we've sent password reset instructions.
                            </div>
                            <Button variant="outline" onClick={() => router.push("/sign-in")} className="w-full">
                                Back to Sign In
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="grid w-full items-center gap-4">
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="user@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-between gap-4">
                                <Button type="button" variant="outline" onClick={() => router.push("/sign-in")}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={loading}>
                                    {loading ? "Sending..." : "Send Reset Link"}
                                </Button>
                            </div>
                        </form>
                    )}
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                    {!submitted && (
                        <div className="flex flex-col gap-2 w-full text-sm text-center">
                            <Link href="/sign-in" className="text-primary hover:underline">
                                Remember your password? Sign in
                            </Link>
                            <Link href="/" className="text-muted-foreground hover:text-primary hover:underline">
                                ← Back to Home
                            </Link>
                        </div>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
