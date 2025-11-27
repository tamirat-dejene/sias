import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface QuickLinkProps {
    href: string;
    title: string;
    description: string;
    icon: LucideIcon;
}

export function QuickLink({ href, title, description, icon: Icon }: QuickLinkProps) {
    return (
        <Link href={href}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-lg">{title}</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <CardDescription>{description}</CardDescription>
                </CardContent>
            </Card>
        </Link>
    );
}
