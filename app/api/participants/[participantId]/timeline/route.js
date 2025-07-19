import { NextResponse } from "next/server";
import dbConnect from "../../../../../lib/dbConnect";
import DataPoint from "../../../../../models/DataPoint";
import Participant from "../../../../../models/Participant";

export async function GET(request, { params }) {
  try {
    await dbConnect();

    const { participantId } = params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit")) || 100;
    const type = searchParams.get("type");

    // Verify participant exists
    const participant = await Participant.findById(participantId);
    if (!participant) {
      return NextResponse.json(
        { error: "Participant not found" },
        { status: 404 }
      );
    }

    // Build query
    let query = { participantId };
    if (type) {
      query.type = type;
    }

    // Fetch timeline data
    const timeline = await DataPoint.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    // Group by date for better visualization
    const groupedByDate = timeline.reduce((acc, dataPoint) => {
      const date = dataPoint.timestamp.toISOString().split("T")[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(dataPoint);
      return acc;
    }, {});

    // Convert to array format sorted by date
    const timelineByDate = Object.entries(groupedByDate)
      .map(([date, dataPoints]) => ({
        date,
        dataPoints: dataPoints.sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        ),
        totalCount: dataPoints.length,
        alertCount: dataPoints.filter((dp) => dp.isAlert).length,
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    // Summary statistics
    const summary = {
      totalDataPoints: timeline.length,
      totalAlerts: timeline.filter((dp) => dp.isAlert).length,
      dataTypes: [...new Set(timeline.map((dp) => dp.type))],
      dateRange: {
        earliest:
          timeline.length > 0 ? timeline[timeline.length - 1].timestamp : null,
        latest: timeline.length > 0 ? timeline[0].timestamp : null,
      },
    };

    return NextResponse.json({
      participantId,
      participantCode: participant.participantCode,
      timeline: timelineByDate,
      summary,
    });
  } catch (error) {
    console.error("Error fetching participant timeline:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
