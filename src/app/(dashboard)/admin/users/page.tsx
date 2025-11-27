"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    department: string | null;
    securityLevel: string;
    emailVerified: boolean;
    mfaEnabled: boolean;
    createdAt: string;
}

export default function UsersManagementPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [changingRole, setChangingRole] = useState<string | null>(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ ...(search && { search }) });
            const res = await fetch(`/api/admin/users?${params}`);
            const data = await res.json();

            if (res.ok) {
                setUsers(data.users);
            }
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchUsers();
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
            return;
        }

        setChangingRole(userId);
        try {
            const res = await fetch(`/api/admin/users/${userId}/role`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: newRole }),
            });

            if (res.ok) {
                alert("Role changed successfully!");
                fetchUsers();
            } else {
                const data = await res.json();
                alert(data.error || "Failed to change role");
            }
        } catch (error) {
            alert("An error occurred");
        } finally {
            setChangingRole(null);
        }
    };

    const getRoleBadgeColor = (role: string) => {
        const colors: Record<string, string> = {
            admin: "bg-purple-100 text-purple-700",
            registrar: "bg-blue-100 text-blue-700",
            department_head: "bg-green-100 text-green-700",
            instructor: "bg-yellow-100 text-yellow-700",
            student: "bg-gray-100 text-gray-700",
        };
        return colors[role] || "bg-gray-100 text-gray-700";
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">User Management</h1>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Search Users</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder="Search by name or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Button type="submit">Search</Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>Manage user roles and permissions</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left">Name</th>
                                        <th className="px-4 py-2 text-left">Email</th>
                                        <th className="px-4 py-2 text-left">Current Role</th>
                                        <th className="px-4 py-2 text-left">Department</th>
                                        <th className="px-4 py-2 text-left">Security Level</th>
                                        <th className="px-4 py-2 text-left">MFA</th>
                                        <th className="px-4 py-2 text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id} className="border-b hover:bg-gray-50">
                                            <td className="px-4 py-2">{user.name}</td>
                                            <td className="px-4 py-2 text-sm">{user.email}</td>
                                            <td className="px-4 py-2">
                                                <span className={`px-2 py-1 rounded text-xs ${getRoleBadgeColor(user.role)}`}>
                                                    {user.role.replace("_", " ").toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 text-sm">{user.department || "-"}</td>
                                            <td className="px-4 py-2 text-sm">{user.securityLevel}</td>
                                            <td className="px-4 py-2 text-sm">
                                                {user.mfaEnabled ? "✅ Enabled" : "❌ Disabled"}
                                            </td>
                                            <td className="px-4 py-2">
                                                <select
                                                    className="border rounded px-2 py-1 text-sm"
                                                    value={user.role}
                                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                    disabled={changingRole === user.id}
                                                >
                                                    <option value="student">Student</option>
                                                    <option value="instructor">Instructor</option>
                                                    <option value="department_head">Department Head</option>
                                                    <option value="registrar">Registrar</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
