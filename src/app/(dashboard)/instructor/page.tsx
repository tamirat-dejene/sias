import { getInstructorCourses } from "@/app/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DacShareDialog } from "@/components/dac-share-dialog";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, BookOpen } from "lucide-react";

export default async function InstructorDashboard() {
    // Server-side session validation
    const session = await auth.api.getSession({
        headers: await headers()
    });

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
    if (session.user.role !== "instructor") {
        return (
            <div className="p-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Access Denied</AlertTitle>
                    <AlertDescription>
                        This page is only accessible to instructors. Your role: {session.user.role}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    // Fetch instructor courses
    const courses = await getInstructorCourses();

    // Handle error from action
    if (courses === null) {
        return (
            <div className="p-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        Unable to fetch your courses. Please contact support.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Instructor Portal</h1>
                <p className="text-muted-foreground mt-1">Welcome, {session.user.name}</p>
            </div>

            {courses.length === 0 ? (
                <Alert>
                    <BookOpen className="h-4 w-4" />
                    <AlertTitle>No Courses</AlertTitle>
                    <AlertDescription>
                        You are not currently assigned to any courses.
                    </AlertDescription>
                </Alert>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {courses.map((course) => (
                        <Card key={course.id}>
                            <CardHeader>
                                <CardTitle>{course.code}: {course.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="mb-4 text-sm text-muted-foreground">
                                    Department: {course.department}
                                </p>
                                <DacShareDialog
                                    resourceId={course.id}
                                    resourceType="course"
                                    resourceName={course.title}
                                />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
