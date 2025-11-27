"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Student {
    id: number;
    userId: string;
    name: string;
    email: string;
}

interface Course {
    id: number;
    code: string;
    title: string;
}

interface Enrollment {
    id: number;
    studentName: string;
    courseCode: string;
    courseTitle: string;
    semester: string;
}

export default function RegistrarEnrollmentsPage() {
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedStudent, setSelectedStudent] = useState("");
    const [selectedCourse, setSelectedCourse] = useState("");
    const [semester, setSemester] = useState("Fall 2024");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [enrollRes, studentsRes, coursesRes] = await Promise.all([
                fetch("/api/registrar/enrollments-list"),
                fetch("/api/registrar/students"),
                fetch("/api/registrar/courses"),
            ]);

            const [enrollData, studentsData, coursesData] = await Promise.all([
                enrollRes.json(),
                studentsRes.json(),
                coursesRes.json(),
            ]);

            setEnrollments(enrollData.enrollments || []);
            setStudents(studentsData.students || []);
            setCourses(coursesData.courses || []);
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async () => {
        if (!selectedStudent || !selectedCourse || !semester) {
            alert("Please select student, course, and semester");
            return;
        }

        try {
            const res = await fetch("/api/registrar/enrollments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    studentId: parseInt(selectedStudent),
                    courseId: parseInt(selectedCourse),
                    semester,
                }),
            });

            if (res.ok) {
                alert("Student enrolled successfully!");
                setSelectedStudent("");
                setSelectedCourse("");
                fetchData();
            } else {
                const data = await res.json();
                alert(data.error || "Failed to enroll");
            }
        } catch (error) {
            alert("An error occurred");
        }
    };

    const handleDrop = async (enrollmentId: number) => {
        if (!confirm("Are you sure you want to drop this student from the course?")) {
            return;
        }

        try {
            const res = await fetch("/api/registrar/enrollments", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ enrollmentId }),
            });

            if (res.ok) {
                alert("Student dropped successfully!");
                fetchData();
            } else {
                const data = await res.json();
                alert(data.error || "Failed to drop");
            }
        } catch (error) {
            alert("An error occurred");
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Enrollment Management</h1>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Enroll Student</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="student">Student</Label>
                            <select
                                id="student"
                                className="w-full border rounded px-3 py-2"
                                value={selectedStudent}
                                onChange={(e) => setSelectedStudent(e.target.value)}
                            >
                                <option value="">Select Student</option>
                                {students.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name} ({s.email})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <Label htmlFor="course">Course</Label>
                            <select
                                id="course"
                                className="w-full border rounded px-3 py-2"
                                value={selectedCourse}
                                onChange={(e) => setSelectedCourse(e.target.value)}
                            >
                                <option value="">Select Course</option>
                                {courses.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.code} - {c.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <Label htmlFor="semester">Semester</Label>
                            <Input
                                id="semester"
                                value={semester}
                                onChange={(e) => setSemester(e.target.value)}
                                placeholder="Fall 2024"
                            />
                        </div>
                    </div>
                    <Button onClick={handleEnroll} className="mt-4">
                        Enroll Student
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Current Enrollments</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left">Student</th>
                                    <th className="px-4 py-2 text-left">Course</th>
                                    <th className="px-4 py-2 text-left">Semester</th>
                                    <th className="px-4 py-2 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {enrollments.map((enrollment) => (
                                    <tr key={enrollment.id} className="border-b">
                                        <td className="px-4 py-2">{enrollment.studentName}</td>
                                        <td className="px-4 py-2">
                                            {enrollment.courseCode} - {enrollment.courseTitle}
                                        </td>
                                        <td className="px-4 py-2">{enrollment.semester}</td>
                                        <td className="px-4 py-2">
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => handleDrop(enrollment.id)}
                                            >
                                                Drop
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
