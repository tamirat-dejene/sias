"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function SetupRole() {
    const [role, setRole] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState(false);
    const [checking, setChecking] = useState(true);
    const router = useRouter();

    // Check if user already has a role
    useEffect(() => {
        const checkSession = async () => {
            try {
                const res = await fetch("/api/auth/session");
                if (res.ok) {
                    const data = await res.json();
                    if (data.user?.role) {
                        // User already has a role, redirect to dashboard
                        router.push("/dashboard");
                        return;
                    }
                }
            } catch (error) {
                console.error("Session check failed:", error);
            } finally {
                setChecking(false);
            }
        };

        checkSession();
    }, [router]);

    const handleSetRole = async () => {
        if (!role) {
            setError("Please select a role");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/user/role", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role }),
            });

            if (!response.ok) {
                throw new Error("Failed to set role");
            }

            setSuccess(true);
            setTimeout(() => {
                router.push("/dashboard");
            }, 1500);
        } catch (err) {
            setError("Failed to set role. Please try again.");
            setLoading(false);
        }
    };

    if (checking) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <Card className="w-[400px]">
                    <CardContent className="pt-6">
                        <p className="text-center text-muted-foreground">Checking your account...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Card className="w-[400px]">
                <CardHeader>
                    <CardTitle>Complete Your Profile</CardTitle>
                    <CardDescription>
                        Please select your role to continue
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {success && (
                        <Alert className="border-green-500 bg-green-50">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <AlertTitle className="text-green-600">Success</AlertTitle>
                            <AlertDescription className="text-green-600">
                                Role set successfully! Redirecting...
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Select Your Role</label>
                        <Select value={role} onValueChange={setRole}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose a role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="student">Student</SelectItem>
                                <SelectItem value="instructor">Instructor</SelectItem>
                                <SelectItem value="department_head">Department Head</SelectItem>
                                <SelectItem value="registrar">Registrar</SelectItem>
                                <SelectItem value="admin">System Administrator</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        onClick={handleSetRole}
                        disabled={loading || success}
                        className="w-full"
                    >
                        {loading ? "Setting role..." : "Continue"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
