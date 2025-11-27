"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";

export default function SettingsPage() {
    const [step, setStep] = useState<"initial" | "setup" | "success">("initial");
    const [secret, setSecret] = useState("");
    const [qrCode, setQrCode] = useState("");
    const [code, setCode] = useState("");
    const [backupCodes, setBackupCodes] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const startSetup = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/auth/mfa/setup", { method: "POST" });
            const data = await res.json();
            if (res.ok) {
                setSecret(data.secret);
                setQrCode(data.qrCode);
                setStep("setup");
            } else {
                alert(data.error);
            }
        } catch (error) {
            alert("Error starting setup");
        } finally {
            setLoading(false);
        }
    };

    const verifyMfa = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/auth/mfa/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: code }),
            });
            const data = await res.json();
            if (res.ok) {
                setBackupCodes(data.backupCodes);
                setStep("success");
            } else {
                alert(data.error);
            }
        } catch (error) {
            alert("Error verifying code");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Account Settings</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Multi-Factor Authentication (MFA)</CardTitle>
                    <CardDescription>Add an extra layer of security to your account.</CardDescription>
                </CardHeader>
                <CardContent>
                    {step === "initial" && (
                        <div className="space-y-4">
                            <p>MFA is currently disabled. Enable it to protect your account.</p>
                            <Button onClick={startSetup} disabled={loading}>
                                {loading ? "Loading..." : "Enable MFA"}
                            </Button>
                        </div>
                    )}

                    {step === "setup" && (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <h3 className="font-medium">1. Scan QR Code</h3>
                                <p className="text-sm text-gray-500">Use your authenticator app (Google Authenticator, Authy, etc.) to scan this code.</p>
                                <div className="flex justify-center p-4 bg-white border rounded-lg">
                                    {qrCode && <Image src={qrCode} alt="MFA QR Code" width={200} height={200} />}
                                </div>
                                <p className="text-sm text-gray-500 text-center">Secret: {secret}</p>
                            </div>

                            <div className="space-y-2">
                                <h3 className="font-medium">2. Enter Code</h3>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="123456"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        maxLength={6}
                                    />
                                    <Button onClick={verifyMfa} disabled={loading}>
                                        {loading ? "Verifying..." : "Verify"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === "success" && (
                        <div className="space-y-4">
                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                                ✅ MFA Enabled Successfully!
                            </div>

                            <div className="space-y-2">
                                <h3 className="font-medium">Backup Codes</h3>
                                <p className="text-sm text-gray-500">Save these codes in a safe place. You can use them to log in if you lose your device.</p>
                                <div className="grid grid-cols-2 gap-2 p-4 bg-gray-50 rounded-lg font-mono text-sm">
                                    {backupCodes.map((code, i) => (
                                        <div key={i}>{code}</div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
