import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { getAuditLogs } from "../../../lib/auditLogger";

export async function GET(request) {
  try {
    // Get user session for authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = Math.min(parseInt(searchParams.get("limit")) || 50, 100); // Max 100 per page
    const action = searchParams.get("action");
    const userId = searchParams.get("userId");
    const trialId = searchParams.get("trialId");
    const participantId = searchParams.get("participantId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build filters
    const filters = {};

    if (action) {
      filters.action = action;
    }

    if (userId) {
      filters.userId = userId;
    }

    if (trialId) {
      filters.trialId = trialId;
    }

    if (participantId) {
      filters.participantId = participantId;
    }

    if (startDate || endDate) {
      filters.timestamp = {};
      if (startDate) {
        filters.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        filters.timestamp.$lte = new Date(endDate);
      }
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Fetch audit logs
    const auditLogs = await getAuditLogs(filters, limit, skip);

    // Count total for pagination
    const totalCount = await getAuditLogs(filters, 0, 0).then(
      (logs) => logs.length
    );
    const totalPages = Math.ceil(totalCount / limit);

    // Format response
    const formattedLogs = auditLogs.map((log) => ({
      id: log._id,
      user: {
        id: log.userId,
        email: log.userId?.email || "Unknown",
        name: log.userId?.name || "Unknown User",
      },
      action: log.action,
      details: log.details,
      timestamp: log.timestamp,
      ipAddress: log.ipAddress,
      trial: log.trialId
        ? {
            id: log.trialId._id,
            title: log.trialId.title,
          }
        : null,
      participant: log.participantId
        ? {
            id: log.participantId._id,
            code: log.participantId.participantCode,
          }
        : null,
    }));

    return NextResponse.json({
      logs: formattedLogs,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      filters: {
        action,
        userId,
        trialId,
        participantId,
        startDate,
        endDate,
      },
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
