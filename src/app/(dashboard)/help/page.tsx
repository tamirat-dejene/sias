import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Shield, Users, Lock, Key, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function HelpPage() {
    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">SIAS Help & Documentation</h1>
                <p className="text-muted-foreground text-lg">
                    Student Information Access System - Comprehensive Guide
                </p>
            </div>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="access-control">Access Control</TabsTrigger>
                    <TabsTrigger value="roles">Roles</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                    <TabsTrigger value="guides">User Guides</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Info className="h-5 w-5" />
                                What is SIAS?
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p>
                                The <strong>Student Information Access System (SIAS)</strong> is a secure,
                                web-based platform designed to manage and control access to student academic
                                records within a university environment.
                            </p>
                            <p>
                                SIAS demonstrates multiple access control models and security features, making
                                it an ideal system for understanding how different security paradigms work
                                together to protect sensitive information.
                            </p>

                            <div className="mt-6">
                                <h3 className="font-semibold text-lg mb-3">Key Features</h3>
                                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                                    <li>Multi-factor Authentication (MFA) with OTP</li>
                                    <li>Role-Based Access Control (RBAC)</li>
                                    <li>Mandatory Access Control (MAC) with security levels</li>
                                    <li>Discretionary Access Control (DAC) for resource sharing</li>
                                    <li>Rule-Based Access Control (RuBAC)</li>
                                    <li>Attribute-Based Access Control (ABAC)</li>
                                    <li>Comprehensive audit logging</li>
                                    <li>Secure session management</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Technology Stack</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-semibold mb-2">Frontend</h4>
                                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                        <li>Next.js 16 (App Router)</li>
                                        <li>React 19</li>
                                        <li>TypeScript</li>
                                        <li>Tailwind CSS</li>
                                        <li>Shadcn UI Components</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-2">Backend</h4>
                                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                        <li>Next.js Server Actions</li>
                                        <li>Better Auth (Authentication)</li>
                                        <li>PostgreSQL Database</li>
                                        <li>Drizzle ORM</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Access Control Tab */}
                <TabsContent value="access-control" className="space-y-6">
                    <Alert>
                        <Shield className="h-4 w-4" />
                        <AlertTitle>Multiple Access Control Models</AlertTitle>
                        <AlertDescription>
                            SIAS implements five different access control models working together to
                            provide comprehensive security.
                        </AlertDescription>
                    </Alert>

                    <Card>
                        <CardHeader>
                            <CardTitle>1. Role-Based Access Control (RBAC)</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                Access permissions are assigned based on user roles. Each role has specific
                                capabilities and can access only the resources appropriate for that role.
                            </p>
                            <div className="bg-muted p-4 rounded-lg">
                                <h4 className="font-semibold mb-2">Roles in SIAS:</h4>
                                <ul className="list-disc list-inside text-sm space-y-1">
                                    <li><strong>Student</strong> - View own grades and enrollments</li>
                                    <li><strong>Instructor</strong> - Manage courses and assign grades</li>
                                    <li><strong>Department Head</strong> - Oversee department courses and students</li>
                                    <li><strong>Registrar</strong> - Manage all student records and enrollments</li>
                                    <li><strong>Admin</strong> - Full system access and user management</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>2. Mandatory Access Control (MAC)</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                System-enforced access control based on security clearance levels. Users and
                                resources are assigned security levels, and access is granted only if the user's
                                clearance meets or exceeds the resource's classification.
                            </p>
                            <div className="bg-muted p-4 rounded-lg">
                                <h4 className="font-semibold mb-2">Security Levels:</h4>
                                <ul className="list-disc list-inside text-sm space-y-1">
                                    <li><strong>Public</strong> - Lowest level (Students)</li>
                                    <li><strong>Internal</strong> - Instructors and courses</li>
                                    <li><strong>Confidential</strong> - Grades, department heads, registrars</li>
                                    <li><strong>Restricted</strong> - Highest level (System administrators)</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>3. Discretionary Access Control (DAC)</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                Resource owners can grant or revoke access to their resources at their discretion.
                                For example, instructors can share course access with other faculty members.
                            </p>
                            <div className="bg-muted p-4 rounded-lg">
                                <p className="text-sm">
                                    <strong>Example:</strong> An instructor can share read or write access to their
                                    course with another instructor or department head using the "Share Access (DAC)"
                                    button on their course cards.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>4. Rule-Based Access Control (RuBAC)</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                Access is determined by predefined rules. For example, students can only view
                                grades for courses they are enrolled in, and instructors can only modify grades
                                for courses they teach.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>5. Attribute-Based Access Control (ABAC)</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                Access decisions are based on attributes of the user, resource, and environment.
                                For example, department heads can only access data for their specific department.
                            </p>
                            <div className="bg-muted p-4 rounded-lg">
                                <p className="text-sm">
                                    <strong>Example:</strong> A Computer Science department head can view all CS
                                    courses and CS students, but not Mathematics courses or students.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Roles Tab */}
                <TabsContent value="roles" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Student Role
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                Students have the most restricted access, limited to viewing their own academic records.
                            </p>
                            <div className="bg-muted p-4 rounded-lg">
                                <h4 className="font-semibold mb-2">Capabilities:</h4>
                                <ul className="list-disc list-inside text-sm space-y-1">
                                    <li>View own course enrollments</li>
                                    <li>View own grades</li>
                                    <li>Calculate GPA</li>
                                    <li>View academic record history</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Instructor Role
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                Instructors manage their assigned courses and can assign grades to enrolled students.
                            </p>
                            <div className="bg-muted p-4 rounded-lg">
                                <h4 className="font-semibold mb-2">Capabilities:</h4>
                                <ul className="list-disc list-inside text-sm space-y-1">
                                    <li>View assigned courses</li>
                                    <li>Assign and modify grades for own courses</li>
                                    <li>Share course access with other users (DAC)</li>
                                    <li>View enrolled students in own courses</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Department Head Role
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                Department heads oversee all courses and students within their specific department.
                            </p>
                            <div className="bg-muted p-4 rounded-lg">
                                <h4 className="font-semibold mb-2">Capabilities:</h4>
                                <ul className="list-disc list-inside text-sm space-y-1">
                                    <li>View all courses in their department</li>
                                    <li>View all students in their department</li>
                                    <li>Monitor department performance</li>
                                    <li>Approve grade changes (if applicable)</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Registrar Role
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                Registrars have university-wide access to manage all student records and enrollments.
                            </p>
                            <div className="bg-muted p-4 rounded-lg">
                                <h4 className="font-semibold mb-2">Capabilities:</h4>
                                <ul className="list-disc list-inside text-sm space-y-1">
                                    <li>View all student records across all departments</li>
                                    <li>View all courses across all departments</li>
                                    <li>View all enrollments and grades</li>
                                    <li>Manage course schedules</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                System Administrator Role
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                Administrators have full system access for user management and system configuration.
                            </p>
                            <div className="bg-muted p-4 rounded-lg">
                                <h4 className="font-semibold mb-2">Capabilities:</h4>
                                <ul className="list-disc list-inside text-sm space-y-1">
                                    <li>Manage all user accounts</li>
                                    <li>View system statistics</li>
                                    <li>Access audit logs</li>
                                    <li>Configure security policies (MAC)</li>
                                    <li>Full access to all system resources</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lock className="h-5 w-5" />
                                Authentication
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                SIAS uses Better Auth for secure authentication with email and password.
                            </p>
                            <div className="bg-muted p-4 rounded-lg space-y-2">
                                <h4 className="font-semibold">Features:</h4>
                                <ul className="list-disc list-inside text-sm space-y-1">
                                    <li>Secure password hashing</li>
                                    <li>Email verification</li>
                                    <li>Session management with secure cookies</li>
                                    <li>Automatic session expiration</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Key className="h-5 w-5" />
                                Multi-Factor Authentication (MFA)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                Optional two-factor authentication using One-Time Passwords (OTP) for enhanced security.
                            </p>
                            <Alert>
                                <Info className="h-4 w-4" />
                                <AlertTitle>Development Mode</AlertTitle>
                                <AlertDescription>
                                    In development, OTP codes are logged to the console instead of being sent via email.
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Audit Logging
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                All significant actions are logged for security auditing and compliance.
                            </p>
                            <div className="bg-muted p-4 rounded-lg">
                                <h4 className="font-semibold mb-2">Logged Events:</h4>
                                <ul className="list-disc list-inside text-sm space-y-1">
                                    <li>User login/logout</li>
                                    <li>Grade modifications</li>
                                    <li>Access control changes</li>
                                    <li>Resource sharing (DAC)</li>
                                    <li>Failed access attempts</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* User Guides Tab */}
                <TabsContent value="guides" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Getting Started</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-semibold mb-2">1. Sign Up / Sign In</h4>
                                <p className="text-sm text-muted-foreground mb-2">
                                    Navigate to the sign-in page and enter your credentials. If you don't have an
                                    account, click "Sign Up" to create one.
                                </p>
                                <Alert>
                                    <Info className="h-4 w-4" />
                                    <AlertTitle>New Users</AlertTitle>
                                    <AlertDescription>
                                        New users are assigned the "student" role by default. Contact an administrator
                                        to change your role if needed.
                                    </AlertDescription>
                                </Alert>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2">2. Set Your Role (If Needed)</h4>
                                <p className="text-sm text-muted-foreground">
                                    If you're an existing user without a role, visit <code className="bg-muted px-1 py-0.5 rounded">/setup-role</code> to
                                    select your appropriate role.
                                </p>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2">3. Access Your Dashboard</h4>
                                <p className="text-sm text-muted-foreground">
                                    After logging in, you'll be directed to your role-specific dashboard where you
                                    can access all features available to your role.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Common Tasks</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-semibold mb-2">Viewing Grades (Students)</h4>
                                <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                                    <li>Log in with your student account</li>
                                    <li>Navigate to the Student Portal</li>
                                    <li>View your GPA and course enrollments</li>
                                    <li>Check the Academic Record table for detailed grades</li>
                                </ol>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2">Sharing Course Access (Instructors)</h4>
                                <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                                    <li>Log in with your instructor account</li>
                                    <li>Navigate to the Instructor Portal</li>
                                    <li>Find the course you want to share</li>
                                    <li>Click "Share Access (DAC)"</li>
                                    <li>Select the user and permission level (Read/Write)</li>
                                    <li>Click "Share" to grant access</li>
                                </ol>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2">Managing Users (Administrators)</h4>
                                <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                                    <li>Log in with your admin account</li>
                                    <li>Navigate to the System Administration portal</li>
                                    <li>View system statistics and user list</li>
                                    <li>Manage user roles and security levels</li>
                                    <li>Review audit logs for security monitoring</li>
                                </ol>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Troubleshooting</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <h4 className="font-semibold mb-2">Access Denied Errors</h4>
                                <p className="text-sm text-muted-foreground">
                                    If you see "Access Denied", ensure you're logged in with the correct role for
                                    that page. Each dashboard is restricted to specific roles.
                                </p>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2">Empty Role</h4>
                                <p className="text-sm text-muted-foreground">
                                    If your role is empty or undefined, visit <code className="bg-muted px-1 py-0.5 rounded">/setup-role</code> to
                                    set your role, or contact an administrator.
                                </p>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2">Can't See Data</h4>
                                <p className="text-sm text-muted-foreground">
                                    Make sure you have the appropriate security clearance level and that you're
                                    accessing resources within your authorized scope (e.g., your department).
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
