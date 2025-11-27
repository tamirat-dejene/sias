"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";

const TEST_ACCOUNTS = [
    { email: "alice.student@university.edu", role: "Student - Alice Johnson" },
    { email: "bob.student@university.edu", role: "Student - Bob Williams" },
    { email: "carol.student@university.edu", role: "Student - Carol Davis" },
    { email: "dr.smith@university.edu", role: "Instructor - Dr. John Smith" },
    { email: "prof.jones@university.edu", role: "Instructor - Prof. Sarah Jones" },
    { email: "head.cs@university.edu", role: "Department Head - Dr. Michael Chen" },
    { email: "registrar@university.edu", role: "Registrar - Emily Rodriguez" },
    { email: "admin@university.edu", role: "Admin - System Administrator" },
];

export default function SignIn() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("password123");
    const [loading, setLoading] = useState(false);
    const [mfaRequired, setMfaRequired] = useState(false);
    const [mfaCode, setMfaCode] = useState("");
    const router = useRouter();

    const handleSignIn = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/auth/signin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();

            if (res.ok) {
                if (data.mfaRequired) {
                    setMfaRequired(true);
                    setLoading(false);
                } else {
                    router.push("/dashboard");
                }
            } else {
                alert(data.error || "Sign in failed");
                setLoading(false);
            }
        } catch (error) {
            alert("An error occurred");
            setLoading(false);
        }
    };

    const handleMfaVerify = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/auth/mfa/validate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: mfaCode }),
            });
            const data = await res.json();

            if (res.ok) {
                router.push("/dashboard");
            } else {
                alert(data.error || "Invalid code");
                setLoading(false);
            }
        } catch (error) {
            alert("An error occurred");
            setLoading(false);
        }
    };

    const handleTestAccountSelect = (selectedEmail: string) => {
        setEmail(selectedEmail);
        setPassword("password123");
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Card className="w-[400px]">
                <CardHeader>
                    <CardTitle>Sign In</CardTitle>
                    <CardDescription>Enter your credentials to access SIAS</CardDescription>
                </CardHeader>
                <CardContent>
                    {mfaRequired ? (
                        <div className="grid w-full items-center gap-4">
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="mfa-code">Authenticator Code</Label>
                                <Input
                                    id="mfa-code"
                                    placeholder="123456"
                                    value={mfaCode}
                                    onChange={(e) => setMfaCode(e.target.value)}
                                    maxLength={6}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="grid w-full items-center gap-4">
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="test-account">Quick Test Account (Dev Only)</Label>
                                <Select onValueChange={handleTestAccountSelect}>
                                    <SelectTrigger id="test-account">
                                        <SelectValue placeholder="Select a test account..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {TEST_ACCOUNTS.map((account) => (
                                            <SelectItem key={account.email} value={account.email}>
                                                {account.role}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" placeholder="user@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <div className="flex w-full justify-between">
                        {!mfaRequired && (
                            <Button variant="outline" onClick={() => router.push("/sign-up")}>Sign Up</Button>
                        )}
                        {mfaRequired ? (
                            <Button onClick={handleMfaVerify} disabled={loading} className="w-full">
                                {loading ? "Verifying..." : "Verify Code"}
                            </Button>
                        ) : (
                            <Button onClick={handleSignIn} disabled={loading}>
                                {loading ? "Signing in..." : "Sign In"}
                            </Button>
                        )}
                    </div>
                    {!mfaRequired && (
                        <div className="flex flex-col gap-2 w-full text-sm text-center">
                            <Link href="/forgot-password" className="text-primary hover:underline">
                                Forgot your password?
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
