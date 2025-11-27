import { getAllUsers, getAdminStats } from "@/app/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSession } from "@/lib/auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Users, GraduationCap, BookOpen, UserCog, FileText, Settings, HelpCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { QuickLink } from "@/components/quick-link";

export default async function AdminDashboard() {
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
    if (session.user.role !== "admin") {
        return (
            <div className="p-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Access Denied</AlertTitle>
                    <AlertDescription>
                        This page is only accessible to system administrators. Your role: {session.user.role}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    // Fetch admin data
    const [users, stats] = await Promise.all([
        getAllUsers(),
        getAdminStats()
    ]);

    if (!users || !stats) {
        return (
            <div className="p-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        Unable to fetch system data. Please contact support.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">System Administration</h1>
                <p className="text-muted-foreground">Welcome, {session.user.name}</p>
            </div>

            {/* Quick Links */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
                <QuickLink
                    href="/admin/users"
                    title="User Management"
                    description="Manage users and change roles"
                    icon={Users}
                />
                <QuickLink
                    href="/admin/audit-logs"
                    title="Audit Logs"
                    description="View system activity and security logs"
                    icon={FileText}
                />
                <QuickLink
                    href="/help"
                    title="Help & Support"
                    description="Get help and learn about the system"
                    icon={HelpCircle}
                />
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{stats.totalUsers}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Students</CardTitle>
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{stats.totalStudents}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Instructors</CardTitle>
                        <UserCog className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{stats.totalInstructors}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Courses</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{stats.totalCourses}</p>
                    </CardContent>
                </Card>
            </div>

            {/* User Management */}
            <Card>
                <CardHeader>
                    <CardTitle>User Management</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Security Level</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <span className="capitalize">{user.role?.replace('_', ' ')}</span>
                                    </TableCell>
                                    <TableCell>{user.department || '-'}</TableCell>
                                    <TableCell>
                                        <span className="capitalize">{user.securityLevel}</span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
