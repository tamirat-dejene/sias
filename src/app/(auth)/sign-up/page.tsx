"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import ReCAPTCHA from "react-google-recaptcha";
import Link from "next/link";

export default function SignUp() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const router = useRouter();

    const handleSignUp = async () => {
        if (!captchaToken) {
            alert("Please complete the CAPTCHA");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, captchaToken }),
            });
            const data = await res.json();

            if (res.ok) {
                alert("Account created! Please check your email to verify your account.");
                router.push("/sign-in");
            } else {
                alert(data.error || "Sign up failed");
                setLoading(false);
            }
        } catch (error) {
            alert("An error occurred");
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Card className="w-[350px]">
                <CardHeader>
                    <CardTitle>Sign Up</CardTitle>
                    <CardDescription>Create a new account</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid w-full items-center gap-4">
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" placeholder="user@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        <div className="flex justify-center mt-2">
                            <ReCAPTCHA
                                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"}
                                onChange={setCaptchaToken}
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button onClick={handleSignUp} disabled={loading || !captchaToken} className="w-full">
                        {loading ? "Creating account..." : "Sign Up"}
                    </Button>
                    <div className="flex flex-col gap-2 w-full text-sm text-center">
                        <p className="text-muted-foreground">
                            Already have an account?{" "}
                            <Link href="/sign-in" className="text-primary hover:underline">
                                Sign in
                            </Link>
                        </p>
                        <Link href="/" className="text-muted-foreground hover:text-primary hover:underline">
                            ← Back to Home
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
