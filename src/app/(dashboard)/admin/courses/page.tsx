"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Search } from "lucide-react";

interface Course {
    id: number;
    code: string;
    title: string;
    department: string;
    credits: number;
    instructorId: number | null;
}

interface Instructor {
    id: number;
    userId: string;
    name: string;
}

export default function CoursesManagementPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        code: "",
        title: "",
        department: "",
        credits: "",
        instructorId: "",
    });

    useEffect(() => {
        fetchCourses();
        fetchInstructors();
    }, []);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/courses?search=${search}`);
            const data = await res.json();
            setCourses(data.courses || []);
        } catch (error) {
            console.error("Failed to fetch courses:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchInstructors = async () => {
        try {
            const res = await fetch("/api/admin/instructors");
            const data = await res.json();
            setInstructors(data.instructors || []);
        } catch (error) {
            console.error("Failed to fetch instructors:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const method = editingCourse ? "PATCH" : "POST";
            const body = editingCourse
                ? { ...formData, id: editingCourse.id }
                : formData;

            const res = await fetch("/api/admin/courses", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                alert(editingCourse ? "Course updated!" : "Course created!");
                setShowForm(false);
                setEditingCourse(null);
                setFormData({ code: "", title: "", department: "", credits: "", instructorId: "" });
                fetchCourses();
            } else {
                const data = await res.json();
                alert(data.error || "Operation failed");
            }
        } catch (error) {
            alert("An error occurred");
        }
    };

    const handleEdit = (course: Course) => {
        setEditingCourse(course);
        setFormData({
            code: course.code,
            title: course.title,
            department: course.department,
            credits: course.credits.toString(),
            instructorId: course.instructorId?.toString() || "",
        });
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this course?")) return;

        try {
            const res = await fetch(`/api/admin/courses?id=${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                alert("Course deleted!");
                fetchCourses();
            } else {
                const data = await res.json();
                alert(data.error || "Deletion failed");
            }
        } catch (error) {
            alert("An error occurred");
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Course Management</h1>
                <Button onClick={() => setShowForm(!showForm)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Course
                </Button>
            </div>

            {showForm && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>{editingCourse ? "Edit Course" : "Add New Course"}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="code">Course Code</Label>
                                    <Input
                                        id="code"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                        placeholder="CS101"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="title">Course Title</Label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Introduction to Computer Science"
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
                                <div>
                                    <Label htmlFor="credits">Credits</Label>
                                    <Input
                                        id="credits"
                                        type="number"
                                        value={formData.credits}
                                        onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                                        placeholder="3"
                                        required
                                    />
                                </div>
                                <div className="col-span-2">
                                    <Label htmlFor="instructor">Instructor (Optional)</Label>
                                    <Select
                                        value={formData.instructorId || "none"}
                                        onValueChange={(value) => setFormData({ ...formData, instructorId: value === "none" ? "" : value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select instructor" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">No instructor</SelectItem>
                                            {instructors.map((inst) => (
                                                <SelectItem key={inst.id} value={inst.id.toString()}>
                                                    {inst.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit">
                                    {editingCourse ? "Update Course" : "Create Course"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingCourse(null);
                                        setFormData({ code: "", title: "", department: "", credits: "", instructorId: "" });
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
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search courses..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && fetchCourses()}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Button onClick={fetchCourses}>Search</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left">Code</th>
                                    <th className="px-4 py-2 text-left">Title</th>
                                    <th className="px-4 py-2 text-left">Department</th>
                                    <th className="px-4 py-2 text-left">Credits</th>
                                    <th className="px-4 py-2 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {courses.map((course) => (
                                    <tr key={course.id} className="border-b">
                                        <td className="px-4 py-2 font-mono">{course.code}</td>
                                        <td className="px-4 py-2">{course.title}</td>
                                        <td className="px-4 py-2">{course.department}</td>
                                        <td className="px-4 py-2">{course.credits}</td>
                                        <td className="px-4 py-2">
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="outline" onClick={() => handleEdit(course)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleDelete(course.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
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
