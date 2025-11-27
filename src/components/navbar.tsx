"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Home,
    Users,
    BookOpen,
    GraduationCap,
    FileText,
    Settings,
    LogOut,
    Menu,
    X,
    Shield,
    HelpCircle
} from "lucide-react";
import { useState, useEffect } from "react";

interface User {
    name: string;
    email: string;
    role: string;
}

export function Navbar() {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch session on mount and when pathname changes
    useEffect(() => {
        const fetchSession = async () => {
            try {
                const res = await fetch("/api/auth/session");
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user || null);
                } else {
                    setUser(null);
                }
            } catch (error) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchSession();
    }, [pathname]); // Re-fetch when route changes

    const handleSignOut = async () => {
        await fetch("/api/auth/signout", { method: "POST" });
        setUser(null);
        window.location.href = "/sign-in";
    };

    // Role-based navigation items
    const getNavItems = () => {
        if (!user) return [];

        const baseItems = [
            { href: "/dashboard", label: "Dashboard", icon: Home },
            { href: "/help", label: "Help", icon: HelpCircle },
            { href: "/settings", label: "Settings", icon: Settings },
        ];

        const roleItems: Record<string, any[]> = {
            student: [
                { href: "/student", label: "My Portal", icon: GraduationCap },
                { href: "/student/transcripts", label: "Transcripts", icon: FileText },
            ],
            instructor: [
                { href: "/instructor", label: "My Portal", icon: BookOpen },
                { href: "/instructor/grades", label: "Grade Management", icon: FileText },
            ],
            department_head: [
                { href: "/department-head", label: "My Portal", icon: Users },
                { href: "/department-head/reports", label: "Reports", icon: FileText },
            ],
            registrar: [
                { href: "/registrar", label: "My Portal", icon: Shield },
                { href: "/registrar/enrollments", label: "Enrollments", icon: Users },
            ],
            admin: [
                { href: "/admin", label: "My Portal", icon: Shield },
                { href: "/admin/users", label: "User Management", icon: Users },
                { href: "/admin/audit-logs", label: "Audit Logs", icon: FileText },
            ],
        };

        return [...(roleItems[user.role] || []), ...baseItems];
    };

    const navItems = getNavItems();

    if (loading) {
        return (
            <nav className="border-b bg-background">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <Link href="/" className="text-xl font-bold">
                        SIAS
                    </Link>
                </div>
            </nav>
        );
    }

    if (!user) {
        return (
            <nav className="border-b bg-background">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <Link href="/" className="text-xl font-bold">
                        SIAS
                    </Link>
                    <div className="flex gap-4">
                        <Link href="/sign-in">
                            <Button variant="ghost">Sign In</Button>
                        </Link>
                        <Link href="/sign-up">
                            <Button>Sign Up</Button>
                        </Link>
                    </div>
                </div>
            </nav>
        );
    }

    return (
        <nav className="border-b bg-background sticky top-0 z-50">
            <div className="container mx-auto px-4 py-3">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <Link href="/dashboard" className="text-xl font-bold flex items-center gap-2">
                        <Shield className="h-6 w-6" />
                        SIAS
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-2 text-sm transition-colors hover:text-primary ${isActive ? "text-primary font-medium" : "text-muted-foreground"
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>

                    {/* User Menu */}
                    <div className="hidden md:flex items-center gap-4">
                        <div className="text-sm text-right">
                            <div className="font-medium">{user.name}</div>
                            <div className="text-xs text-muted-foreground capitalize">
                                {user.role.replace("_", " ")}
                            </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleSignOut}>
                            <LogOut className="h-4 w-4 mr-2" />
                            Sign Out
                        </Button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden mt-4 pb-4 border-t pt-4">
                        <div className="flex flex-col gap-3">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center gap-2 p-2 rounded transition-colors ${isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                                            }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {item.label}
                                    </Link>
                                );
                            })}
                            <div className="border-t pt-3 mt-2">
                                <div className="text-sm mb-2">
                                    <div className="font-medium">{user.name}</div>
                                    <div className="text-xs text-muted-foreground capitalize">
                                        {user.role.replace("_", " ")}
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" onClick={handleSignOut} className="w-full">
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Sign Out
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
