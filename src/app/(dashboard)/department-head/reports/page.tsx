"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface DepartmentStats {
    totalStudents: number;
    totalCourses: number;
    totalInstructors: number;
    averageGPA: number;
    enrollmentsByYear: Record<string, number>;
}

export default function DepartmentHeadReportsPage() {
    const [stats, setStats] = useState<DepartmentStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/department-head/stats");
            const data = await res.json();
            if (res.ok) {
                setStats(data);
            }
        } catch (error) {
            console.error("Failed to fetch stats:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Department Reports</h1>

            {loading ? (
                <p>Loading...</p>
            ) : stats ? (
                <>
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Total Students</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold">{stats.totalStudents}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Total Courses</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold">{stats.totalCourses}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Total Instructors</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold">{stats.totalInstructors}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Average GPA</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold">{stats.averageGPA.toFixed(2)}</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Enrollments by Year</CardTitle>
                            <CardDescription>Student distribution across academic years</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {Object.entries(stats.enrollmentsByYear).map(([year, count]) => (
                                    <div key={year} className="flex justify-between items-center">
                                        <span className="font-medium">Year {year}</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-64 bg-gray-200 rounded-full h-4">
                                                <div
                                                    className="bg-blue-500 h-4 rounded-full"
                                                    style={{
                                                        width: `${(count / stats.totalStudents) * 100}%`,
                                                    }}
                                                />
                                            </div>
                                            <span className="text-sm text-gray-600">{count} students</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </>
            ) : (
                <p>No data available</p>
            )}
        </div>
    );
}
