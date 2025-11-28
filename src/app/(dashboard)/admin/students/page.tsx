"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Edit } from "lucide-react";

interface Student {
    id: number;
    userId: string;
    name: string;
    email: string;
    year: number;
    major: string;
    gpa: number;
}

export default function StudentsManagementPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        year: "",
        major: "",
    });

    const [editFormData, setEditFormData] = useState({
        id: 0,
        year: "",
        major: "",
        gpa: "",
    });

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/students");
            const data = await res.json();
            setStudents(data.students || []);
        } catch (error) {
            console.error("Failed to fetch students:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const res = await fetch("/api/admin/students", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                alert("Student created successfully!");
                setShowForm(false);
                setFormData({ name: "", email: "", password: "", year: "", major: "" });
                fetchStudents();
            } else {
                const data = await res.json();
                alert(data.error || "Creation failed");
            }
        } catch (error) {
            alert("An error occurred");
        }
    };

    const handleEdit = (student: Student) => {
        setEditingStudent(student);
        setEditFormData({
            id: student.id,
            year: student.year.toString(),
            major: student.major,
            gpa: student.gpa.toString(),
        });
    };

    const handleUpdate = async () => {
        try {
            const res = await fetch("/api/admin/students", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editFormData),
            });

            if (res.ok) {
                alert("Student updated successfully!");
                setEditingStudent(null);
                fetchStudents();
            } else {
                const data = await res.json();
                alert(data.error || "Update failed");
            }
        } catch (error) {
            alert("An error occurred");
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Student Management</h1>
                <Button onClick={() => setShowForm(!showForm)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Student
                </Button>
            </div>

            {showForm && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Add New Student</CardTitle>
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
                                        placeholder="Alice Johnson"
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
                                        placeholder="alice@university.edu"
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
                                    <Label htmlFor="year">Year</Label>
                                    <Select
                                        value={formData.year}
                                        onValueChange={(value) => setFormData({ ...formData, year: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select year" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">Year 1</SelectItem>
                                            <SelectItem value="2">Year 2</SelectItem>
                                            <SelectItem value="3">Year 3</SelectItem>
                                            <SelectItem value="4">Year 4</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="col-span-2">
                                    <Label htmlFor="major">Major</Label>
                                    <Select
                                        value={formData.major}
                                        onValueChange={(value) => setFormData({ ...formData, major: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select major" />
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
                                <Button type="submit">Create Student</Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowForm(false);
                                        setFormData({ name: "", email: "", password: "", year: "", major: "" });
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {editingStudent && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Edit Student: {editingStudent.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="edit-year">Year</Label>
                                    <Select
                                        value={editFormData.year}
                                        onValueChange={(value) => setEditFormData({ ...editFormData, year: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">Year 1</SelectItem>
                                            <SelectItem value="2">Year 2</SelectItem>
                                            <SelectItem value="3">Year 3</SelectItem>
                                            <SelectItem value="4">Year 4</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="edit-major">Major</Label>
                                    <Input
                                        id="edit-major"
                                        value={editFormData.major}
                                        onChange={(e) => setEditFormData({ ...editFormData, major: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="edit-gpa">GPA</Label>
                                    <Input
                                        id="edit-gpa"
                                        type="number"
                                        step="0.01"
                                        value={editFormData.gpa}
                                        onChange={(e) => setEditFormData({ ...editFormData, gpa: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={handleUpdate}>Update Student</Button>
                                <Button variant="outline" onClick={() => setEditingStudent(null)}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>All Students ({students.length})</CardTitle>
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
                                    <th className="px-4 py-2 text-left">Year</th>
                                    <th className="px-4 py-2 text-left">Major</th>
                                    <th className="px-4 py-2 text-left">GPA</th>
                                    <th className="px-4 py-2 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student) => (
                                    <tr key={student.id} className="border-b">
                                        <td className="px-4 py-2">{student.name}</td>
                                        <td className="px-4 py-2">{student.email}</td>
                                        <td className="px-4 py-2">Year {student.year}</td>
                                        <td className="px-4 py-2">{student.major}</td>
                                        <td className="px-4 py-2">{student.gpa.toFixed(2)}</td>
                                        <td className="px-4 py-2">
                                            <Button size="sm" variant="outline" onClick={() => handleEdit(student)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </td>
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
