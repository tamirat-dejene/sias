import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { auditLogs, users } from "@/db/schema";
import { desc, like, and, gte, lte, eq, or } from "drizzle-orm";
import { decryptLogData } from "@/lib/encryption";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    const action = searchParams.get("action") || "";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          like(auditLogs.action, `%${search}%`),
          like(auditLogs.resource, `%${search}%`),
          like(auditLogs.ipAddress, `%${search}%`)
        )
      );
    }

    if (action) {
      conditions.push(eq(auditLogs.action, action));
    }

    if (startDate) {
      conditions.push(gte(auditLogs.timestamp, new Date(startDate)));
    }

    if (endDate) {
      conditions.push(lte(auditLogs.timestamp, new Date(endDate)));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Fetch logs with user info
    const logs = await db
      .select({
        id: auditLogs.id,
        userId: auditLogs.userId,
        userName: users.name,
        userEmail: users.email,
        action: auditLogs.action,
        resource: auditLogs.resource,
        ipAddress: auditLogs.ipAddress,
        details: auditLogs.details,
        timestamp: auditLogs.timestamp,
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.userId, users.id))
      .where(whereClause)
      .orderBy(desc(auditLogs.timestamp))
      .limit(limit)
      .offset(offset);

    // Decrypt details for each log
    const decryptedLogs = logs.map((log) => ({
      ...log,
      details: log.details ? decryptLogData(log.details as any) : null,
    }));

    // Get total count
    const [{ count }] = (await db
      .select({ count: auditLogs.id })
      .from(auditLogs)
      .where(whereClause)) as any;

    return NextResponse.json({
      logs: decryptedLogs,
      pagination: {
        page,
        limit,
        total: count || logs.length,
        totalPages: Math.ceil((count || logs.length) / limit),
      },
    });
  } catch (error) {
    console.error("Audit logs fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
