"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { getUsersForSharing, shareResource } from "@/app/actions";

interface DacShareDialogProps {
    resourceId: number;
    resourceType: string;
    resourceName: string;
}

export function DacShareDialog({ resourceId, resourceType, resourceName }: DacShareDialogProps) {
    const [users, setUsers] = useState<{ id: string; name: string; role: string }[]>([]);
    const [selectedUser, setSelectedUser] = useState<string>("");
    const [permission, setPermission] = useState<"read" | "write">("read");
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            getUsersForSharing().then(setUsers);
        }
    }, [isOpen]);

    const handleShare = async () => {
        if (!selectedUser) return;
        setLoading(true);
        try {
            await shareResource(resourceId, resourceType, selectedUser, permission);
            setIsOpen(false);
            alert("Resource shared successfully!");
        } catch (error) {
            alert("Failed to share resource");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Share Access (DAC)</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Share "{resourceName}"</DialogTitle>
                    <DialogDescription>
                        Grant access to another user using Discretionary Access Control.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <label>User</label>
                        <Select onValueChange={setSelectedUser}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a user" />
                            </SelectTrigger>
                            <SelectContent>
                                {users.map((user) => (
                                    <SelectItem key={user.id} value={user.id}>
                                        {user.name} ({user.role})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <label>Permission</label>
                        <Select value={permission} onValueChange={(v: any) => setPermission(v)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="read">Read Only</SelectItem>
                                <SelectItem value="write">Read & Write</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleShare} disabled={loading || !selectedUser}>
                        {loading ? "Sharing..." : "Share"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
