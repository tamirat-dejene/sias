import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default async function Dashboard() {
    const session = await getSession();

    if (!session?.user) {
        return (
            <div className="p-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Not Authenticated</AlertTitle>
                    <AlertDescription>
                        Please sign in to access the dashboard.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    // Redirect based on role
    const role = session.user.role;

    switch (role) {
        case "student":
            redirect("/student");
        case "instructor":
            redirect("/instructor");
        case "department_head":
            redirect("/department-head");
        case "registrar":
            redirect("/registrar");
        case "admin":
            redirect("/admin");
        default:
            // If no role or unknown role, show error
            return (
                <div className="p-8">
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>No Role Assigned</AlertTitle>
                        <AlertDescription>
                            Your account doesn't have a role assigned. Please visit{" "}
                            <a href="/setup-role" className="underline font-semibold">
                                /setup-role
                            </a>{" "}
                            to set your role, or contact an administrator.
                        </AlertDescription>
                    </Alert>
                </div>
            );
    }
}
