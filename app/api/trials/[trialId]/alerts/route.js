import { NextResponse } from "next/server";
import dbConnect from "../../../../../lib/dbConnect";
import DataPoint from "../../../../../models/DataPoint";
import Participant from "../../../../../models/Participant";
import Trial from "../../../../../models/Trial";

export async function GET(request, { params }) {
  try {
    await dbConnect();

    const { trialId } = params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit")) || 50;
    const severity = searchParams.get("severity");

    // Verify trial exists
    const trial = await Trial.findById(trialId);
    if (!trial) {
      return NextResponse.json({ error: "Trial not found" }, { status: 404 });
    }

    // Build query for alerts
    let query = {
      trialId,
      isAlert: true,
    };

    if (severity) {
      query.severity = severity;
    }

    // Fetch alerts with participant information
    const alerts = await DataPoint.find(query)
      .populate("participantId", "participantCode assignedGroup")
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    // Group alerts by severity for summary
    const alertsBySeverity = alerts.reduce((acc, alert) => {
      const sev = alert.severity;
      if (!acc[sev]) {
        acc[sev] = [];
      }
      acc[sev].push(alert);
      return acc;
    }, {});

    // Recent alerts (last 24 hours)
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const recentAlerts = alerts.filter(
      (alert) => new Date(alert.timestamp) >= twentyFourHoursAgo
    );

    // Summary statistics
    const summary = {
      totalAlerts: alerts.length,
      recentAlerts: recentAlerts.length,
      bySeverity: {
        critical: alertsBySeverity.critical?.length || 0,
        high: alertsBySeverity.high?.length || 0,
        medium: alertsBySeverity.medium?.length || 0,
        low: alertsBySeverity.low?.length || 0,
      },
      uniqueParticipants: [
        ...new Set(alerts.map((a) => a.participantId._id.toString())),
      ].length,
    };

    return NextResponse.json({
      trialId,
      alerts: alerts.map((alert) => ({
        id: alert._id,
        type: alert.type,
        severity: alert.severity,
        timestamp: alert.timestamp,
        payload: alert.payload,
        participant: {
          id: alert.participantId._id,
          code: alert.participantId.participantCode,
          group: alert.participantId.assignedGroup,
        },
      })),
      summary,
    });
  } catch (error) {
    console.error("Error fetching trial alerts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
