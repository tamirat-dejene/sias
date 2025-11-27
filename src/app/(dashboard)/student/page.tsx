import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStudentGrades } from "@/app/actions";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, BookOpen, GraduationCap, FileText, Settings, HelpCircle } from "lucide-react";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { students, enrollments, courses, grades } from "@/db/schema";
import { eq } from "drizzle-orm";
import { QuickLink } from "@/components/quick-link";

export default async function StudentDashboard() {
    const session = await getSession();

    // Check authentication
    if (!session?.user) {
        return (
            <div className="p-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Access Denied</AlertTitle>
                    <AlertDescription>
                        You must be logged in to view this page.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    // Check role
    if (session.user.role !== "student") {
        return (
            <div className="p-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Access Denied</AlertTitle>
                    <AlertDescription>
                        This page is only accessible to students. Your role: {session.user.role}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    // Fetch grades
    const grades = await getStudentGrades();

    // Handle null (access denied from action)
    if (grades === null) {
        return (
            <div className="p-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        Unable to fetch your academic records. Please contact support.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    // Calculate GPA (simple 4.0 scale: A=4, B=3, C=2, D=1, F=0)
    const calculateGPA = () => {
        const gradesWithValues = grades.filter(g => g.grade);
        if (gradesWithValues.length === 0) return "N/A";

        const gradePoints: Record<string, number> = {
            'A': 4.0, 'A-': 3.7,
            'B+': 3.3, 'B': 3.0, 'B-': 2.7,
            'C+': 2.3, 'C': 2.0, 'C-': 1.7,
            'D+': 1.3, 'D': 1.0,
            'F': 0.0
        };

        const total = gradesWithValues.reduce((sum, g) => {
            return sum + (gradePoints[g.grade!] || 0);
        }, 0);

        return (total / gradesWithValues.length).toFixed(2);
    };

    const gpa = calculateGPA();
    const completedCourses = grades.filter(g => g.grade).length;
    const totalCourses = grades.length;

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Student Portal</h1>
                <p className="text-muted-foreground">
                    Welcome back, {session.user.name}!
                </p>
            </div>

            {/* Quick Links */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
                <QuickLink
                    href="/student/transcripts"
                    title="My Transcripts"
                    description="View and download your academic transcripts"
                    icon={FileText}
                />
                <QuickLink
                    href="/settings"
                    title="Settings"
                    description="Manage your account and security settings"
                    icon={Settings}
                />
                <QuickLink
                    href="/help"
                    title="Help & Support"
                    description="Get help and learn about the system"
                    icon={HelpCircle}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-3 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">GPA</CardTitle>
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{gpa}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Out of 4.0 scale
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed Courses</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{completedCourses}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Courses with grades
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{totalCourses}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            All enrolled courses
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Academic Record</CardTitle>
                </CardHeader>
                <CardContent>
                    {grades.length === 0 ? (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>No Enrollments</AlertTitle>
                            <AlertDescription>
                                You are not currently enrolled in any courses.
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <Table>
                            <TableCaption>Your complete academic record</TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Course Code</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Semester</TableHead>
                                    <TableHead className="text-right">Grade</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {grades.map((g, i) => (
                                    <TableRow key={i}>
                                        <TableCell className="font-medium">{g.courseCode}</TableCell>
                                        <TableCell>{g.courseTitle}</TableCell>
                                        <TableCell>{g.semester}</TableCell>
                                        <TableCell className="text-right">
                                            {g.grade ? (
                                                <span className="font-semibold">{g.grade}</span>
                                            ) : (
                                                <span className="text-muted-foreground italic">Pending</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
