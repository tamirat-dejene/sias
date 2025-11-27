"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Suspense } from "react";

function AccessDeniedContent() {
    const searchParams = useSearchParams();
    const reason = searchParams.get("reason");
    const router = useRouter();

    let message = "You do not have permission to access this resource.";
    if (reason === "outside_hours") {
        message = "Access to this resource is restricted to business hours (Mon-Fri, 9:00 AM - 5:00 PM).";
    } else if (reason === "ip_restricted") {
        message = "Access to this resource is restricted to the campus network.";
    }

    return (
        <Card className="w-[500px] border-red-200 shadow-lg">
            <CardHeader className="bg-red-50 rounded-t-lg">
                <CardTitle className="text-red-700">Access Denied</CardTitle>
                <CardDescription className="text-red-600">Security Restriction Enforced</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                <p className="text-gray-700">{message}</p>
            </CardContent>
            <CardFooter className="flex justify-end">
                <Button variant="outline" onClick={() => router.push("/dashboard")}>
                    Return to Dashboard
                </Button>
            </CardFooter>
        </Card>
    );
}

export default function AccessDeniedPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <Suspense fallback={<div>Loading...</div>}>
                <AccessDeniedContent />
            </Suspense>
        </div>
    );
}
