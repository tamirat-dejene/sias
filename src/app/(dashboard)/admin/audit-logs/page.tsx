"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface AuditLog {
    id: number;
    userId: string | null;
    userName: string | null;
    userEmail: string | null;
    action: string;
    resource: string | null;
    ipAddress: string | null;
    details: any;
    timestamp: string;
}

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [action, setAction] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "20",
                ...(search && { search }),
                ...(action && { action })
            });

            const res = await fetch(`/api/admin/audit-logs?${params}`);
            const data = await res.json();

            if (res.ok) {
                setLogs(data.logs);
                setTotalPages(data.pagination.totalPages);
            }
        } catch (error) {
            console.error("Failed to fetch logs:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [page, action]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchLogs();
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Audit Logs</h1>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Search & Filter</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <div className="flex-1">
                            <Label htmlFor="search">Search</Label>
                            <Input
                                id="search"
                                placeholder="Search by action, resource, or IP..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="w-48">
                            <Label htmlFor="action">Action Type</Label>
                            <select
                                id="action"
                                className="w-full border rounded px-3 py-2"
                                value={action}
                                onChange={(e) => setAction(e.target.value)}
                            >
                                <option value="">All Actions</option>
                                <option value="LOGIN_SUCCESS">Login Success</option>
                                <option value="LOGIN_FAILED">Login Failed</option>
                                <option value="LOGOUT">Logout</option>
                                <option value="ACCESS_GRADES">Access Grades</option>
                                <option value="DAC_SHARE">DAC Share</option>
                                <option value="ROLE_CHANGE">Role Change</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <Button type="submit">Search</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Audit Trail</CardTitle>
                    <CardDescription>All system activities are logged and encrypted</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left">Timestamp</th>
                                            <th className="px-4 py-2 text-left">User</th>
                                            <th className="px-4 py-2 text-left">Action</th>
                                            <th className="px-4 py-2 text-left">Resource</th>
                                            <th className="px-4 py-2 text-left">IP Address</th>
                                            <th className="px-4 py-2 text-left">Details</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {logs.map((log) => (
                                            <tr key={log.id} className="border-b hover:bg-gray-50">
                                                <td className="px-4 py-2 text-sm">
                                                    {new Date(log.timestamp).toLocaleString()}
                                                </td>
                                                <td className="px-4 py-2 text-sm">
                                                    {log.userName || "System"}
                                                    {log.userEmail && (
                                                        <div className="text-xs text-gray-500">{log.userEmail}</div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-2">
                                                    <span className={`px-2 py-1 rounded text-xs ${log.action.includes("FAILED") || log.action.includes("DENIED")
                                                            ? "bg-red-100 text-red-700"
                                                            : log.action.includes("SUCCESS")
                                                                ? "bg-green-100 text-green-700"
                                                                : "bg-blue-100 text-blue-700"
                                                        }`}>
                                                        {log.action}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2 text-sm">{log.resource || "-"}</td>
                                                <td className="px-4 py-2 text-sm font-mono">{log.ipAddress}</td>
                                                <td className="px-4 py-2 text-xs">
                                                    {log.details && (
                                                        <details className="cursor-pointer">
                                                            <summary>View</summary>
                                                            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-w-xs">
                                                                {JSON.stringify(log.details, null, 2)}
                                                            </pre>
                                                        </details>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex justify-between items-center mt-4">
                                <div className="text-sm text-gray-600">
                                    Page {page} of {totalPages}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
