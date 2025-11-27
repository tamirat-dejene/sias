"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Enrollment {
    enrollmentId: number;
    studentName: string;
    studentEmail: string;
    courseCode: string;
    courseTitle: string;
    semester: string;
    currentGrade: string | null;
}

export default function InstructorGradesPage() {
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [gradeValue, setGradeValue] = useState("");

    useEffect(() => {
        fetchEnrollments();
    }, []);

    const fetchEnrollments = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/instructor/enrollments");
            const data = await res.json();
            if (res.ok) {
                setEnrollments(data.enrollments || []);
            }
        } catch (error) {
            console.error("Failed to fetch enrollments:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGradeUpdate = async (enrollmentId: number) => {
        try {
            const res = await fetch("/api/instructor/grades", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ enrollmentId, grade: gradeValue }),
            });

            if (res.ok) {
                alert("Grade updated successfully!");
                setEditingId(null);
                setGradeValue("");
                fetchEnrollments();
            } else {
                const data = await res.json();
                alert(data.error || "Failed to update grade");
            }
        } catch (error) {
            alert("An error occurred");
        }
    };

    const startEdit = (enrollmentId: number, currentGrade: string | null) => {
        setEditingId(enrollmentId);
        setGradeValue(currentGrade || "");
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Grade Management</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Student Enrollments</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left">Student</th>
                                        <th className="px-4 py-2 text-left">Course</th>
                                        <th className="px-4 py-2 text-left">Semester</th>
                                        <th className="px-4 py-2 text-left">Current Grade</th>
                                        <th className="px-4 py-2 text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {enrollments.map((enrollment) => (
                                        <tr key={enrollment.enrollmentId} className="border-b hover:bg-gray-50">
                                            <td className="px-4 py-2">
                                                <div>{enrollment.studentName}</div>
                                                <div className="text-xs text-gray-500">{enrollment.studentEmail}</div>
                                            </td>
                                            <td className="px-4 py-2">
                                                <div className="font-medium">{enrollment.courseCode}</div>
                                                <div className="text-sm text-gray-600">{enrollment.courseTitle}</div>
                                            </td>
                                            <td className="px-4 py-2">{enrollment.semester}</td>
                                            <td className="px-4 py-2">
                                                {editingId === enrollment.enrollmentId ? (
                                                    <Input
                                                        value={gradeValue}
                                                        onChange={(e) => setGradeValue(e.target.value)}
                                                        placeholder="A, B, C, D, F"
                                                        className="w-20"
                                                    />
                                                ) : (
                                                    <span className={`px-2 py-1 rounded ${enrollment.currentGrade
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-gray-100 text-gray-500"
                                                        }`}>
                                                        {enrollment.currentGrade || "Not Graded"}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-2">
                                                {editingId === enrollment.enrollmentId ? (
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleGradeUpdate(enrollment.enrollmentId)}
                                                        >
                                                            Save
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => setEditingId(null)}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => startEdit(enrollment.enrollmentId, enrollment.currentGrade)}
                                                    >
                                                        {enrollment.currentGrade ? "Edit" : "Add Grade"}
                                                    </Button>
                                                )}
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
