import { getDepartmentCourses, getDepartmentStudents } from "@/app/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSession } from "@/lib/auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, BookOpen, Users } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function DeptHeadDashboard() {
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
    if (session.user.role !== "department_head") {
        return (
            <div className="p-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Access Denied</AlertTitle>
                    <AlertDescription>
                        This page is only accessible to department heads. Your role: {session.user.role}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    // Fetch department data
    const [courses, students] = await Promise.all([
        getDepartmentCourses(),
        getDepartmentStudents()
    ]);

    if (courses === null || students === null) {
        return (
            <div className="p-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        Unable to fetch department data. Please contact support.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Department Head Portal</h1>
                <p className="text-muted-foreground mt-1">
                    Welcome, {session.user.name} - {session.user.department || 'No Department Assigned'}
                </p>
            </div>

            {/* Statistics */}
            <div className="grid gap-4 md:grid-cols-2 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Department Courses</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{courses.length}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Department Students</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{students.length}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Courses */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Department Courses</CardTitle>
                </CardHeader>
                <CardContent>
                    {courses.length === 0 ? (
                        <Alert>
                            <BookOpen className="h-4 w-4" />
                            <AlertTitle>No Courses</AlertTitle>
                            <AlertDescription>
                                No courses found for your department.
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Security Level</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {courses.map((course) => (
                                    <TableRow key={course.id}>
                                        <TableCell className="font-medium">{course.code}</TableCell>
                                        <TableCell>{course.title}</TableCell>
                                        <TableCell>{course.department}</TableCell>
                                        <TableCell className="capitalize">{course.securityLevel}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Students */}
            <Card>
                <CardHeader>
                    <CardTitle>Department Students</CardTitle>
                </CardHeader>
                <CardContent>
                    {students.length === 0 ? (
                        <Alert>
                            <Users className="h-4 w-4" />
                            <AlertTitle>No Students</AlertTitle>
                            <AlertDescription>
                                No students found for your department.
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Year</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.map((student) => (
                                    <TableRow key={student.studentId}>
                                        <TableCell className="font-medium">{student.name}</TableCell>
                                        <TableCell>{student.email}</TableCell>
                                        <TableCell>{student.year}</TableCell>
                                        <TableCell className="capitalize">{student.enrollmentStatus}</TableCell>
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
