"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, UserPlus } from "lucide-react";

interface Instructor {
    id: number;
    userId: string;
    name: string;
    email: string;
    department: string;
}

export default function InstructorsManagementPage() {
    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        department: "",
    });

    useEffect(() => {
        fetchInstructors();
    }, []);

    const fetchInstructors = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/instructors");
            const data = await res.json();
            setInstructors(data.instructors || []);
        } catch (error) {
            console.error("Failed to fetch instructors:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const res = await fetch("/api/admin/instructors", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                alert("Instructor created successfully!");
                setShowForm(false);
                setFormData({ name: "", email: "", password: "", department: "" });
                fetchInstructors();
            } else {
                const data = await res.json();
                alert(data.error || "Creation failed");
            }
        } catch (error) {
            alert("An error occurred");
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Instructor Management</h1>
                <Button onClick={() => setShowForm(!showForm)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Instructor
                </Button>
            </div>

            {showForm && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Add New Instructor</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Dr. John Smith"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="john.smith@university.edu"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="Minimum 12 characters"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="department">Department</Label>
                                    <Select
                                        value={formData.department}
                                        onValueChange={(value) => setFormData({ ...formData, department: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Computer Science">Computer Science</SelectItem>
                                            <SelectItem value="Mathematics">Mathematics</SelectItem>
                                            <SelectItem value="Physics">Physics</SelectItem>
                                            <SelectItem value="Engineering">Engineering</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit">Create Instructor</Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowForm(false);
                                        setFormData({ name: "", email: "", password: "", department: "" });
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>All Instructors ({instructors.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left">Name</th>
                                    <th className="px-4 py-2 text-left">Email</th>
                                    <th className="px-4 py-2 text-left">Department</th>
                                </tr>
                            </thead>
                            <tbody>
                                {instructors.map((instructor) => (
                                    <tr key={instructor.id} className="border-b">
                                        <td className="px-4 py-2">{instructor.name}</td>
                                        <td className="px-4 py-2">{instructor.email}</td>
                                        <td className="px-4 py-2">{instructor.department}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
