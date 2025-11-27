"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface TranscriptData {
    studentName: string;
    studentEmail: string;
    enrollments: Array<{
        courseCode: string;
        courseTitle: string;
        semester: string;
        grade: string | null;
    }>;
    gpa: number;
}

export default function StudentTranscriptsPage() {
    const [transcript, setTranscript] = useState<TranscriptData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTranscript();
    }, []);

    const fetchTranscript = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/student/transcript");
            const data = await res.json();
            if (res.ok) {
                setTranscript(data);
            }
        } catch (error) {
            console.error("Failed to fetch transcript:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        if (!transcript) return;

        const content = `
STUDENT TRANSCRIPT
==================

Student: ${transcript.studentName}
Email: ${transcript.studentEmail}
GPA: ${transcript.gpa.toFixed(2)}

COURSES
-------
${transcript.enrollments.map(e =>
            `${e.courseCode} - ${e.courseTitle} (${e.semester}): ${e.grade || "In Progress"}`
        ).join('\n')}

Generated: ${new Date().toLocaleString()}
    `.trim();

        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `transcript_${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">My Transcript</h1>

            {loading ? (
                <p>Loading...</p>
            ) : transcript ? (
                <>
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Student Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Name</p>
                                    <p className="font-medium">{transcript.studentName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="font-medium">{transcript.studentEmail}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">GPA</p>
                                    <p className="font-medium text-2xl">{transcript.gpa.toFixed(2)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Course History</CardTitle>
                            <Button onClick={handleDownload}>Download Transcript</Button>
                        </CardHeader>
                        <CardContent>
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left">Course Code</th>
                                        <th className="px-4 py-2 text-left">Course Title</th>
                                        <th className="px-4 py-2 text-left">Semester</th>
                                        <th className="px-4 py-2 text-left">Grade</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transcript.enrollments.map((enrollment, idx) => (
                                        <tr key={idx} className="border-b">
                                            <td className="px-4 py-2 font-medium">{enrollment.courseCode}</td>
                                            <td className="px-4 py-2">{enrollment.courseTitle}</td>
                                            <td className="px-4 py-2">{enrollment.semester}</td>
                                            <td className="px-4 py-2">
                                                <span className={`px-2 py-1 rounded ${enrollment.grade
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-yellow-100 text-yellow-700"
                                                    }`}>
                                                    {enrollment.grade || "In Progress"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </>
            ) : (
                <p>No transcript data available</p>
            )}
        </div>
    );
}
