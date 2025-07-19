import { NextResponse } from "next/server";
import dbConnect from "../../../../../lib/dbConnect";
import DataPoint from "../../../../../models/DataPoint";
import Trial from "../../../../../models/Trial";

export async function GET(request, { params }) {
  try {
    await dbConnect();

    const { trialId } = params;

    // Verify trial exists
    const trial = await Trial.findById(trialId);
    if (!trial) {
      return NextResponse.json({ error: "Trial not found" }, { status: 404 });
    }

    // Aggregation pipeline for data types
    const typeAggregation = await DataPoint.aggregate([
      { $match: { trialId: trial._id } },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
          latestTimestamp: { $max: "$timestamp" },
        },
      },
      {
        $project: {
          type: "$_id",
          count: 1,
          latestTimestamp: 1,
          _id: 0,
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Aggregation for severity distribution
    const severityAggregation = await DataPoint.aggregate([
      { $match: { trialId: trial._id } },
      {
        $group: {
          _id: "$severity",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          severity: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ]);

    // Daily activity aggregation (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyActivity = await DataPoint.aggregate([
      {
        $match: {
          trialId: trial._id,
          timestamp: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$timestamp",
            },
          },
          count: { $sum: 1 },
          alertCount: {
            $sum: { $cond: ["$isAlert", 1, 0] },
          },
        },
      },
      {
        $project: {
          date: "$_id",
          count: 1,
          alertCount: 1,
          _id: 0,
        },
      },
      { $sort: { date: 1 } },
    ]);

    // Alert aggregation
    const alertAggregation = await DataPoint.aggregate([
      {
        $match: {
          trialId: trial._id,
          isAlert: true,
        },
      },
      {
        $group: {
          _id: {
            type: "$type",
            severity: "$severity",
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          type: "$_id.type",
          severity: "$_id.severity",
          count: 1,
          _id: 0,
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Total statistics
    const totalStats = await DataPoint.aggregate([
      { $match: { trialId: trial._id } },
      {
        $group: {
          _id: null,
          totalDataPoints: { $sum: 1 },
          totalAlerts: { $sum: { $cond: ["$isAlert", 1, 0] } },
          uniqueParticipants: { $addToSet: "$participantId" },
        },
      },
      {
        $project: {
          totalDataPoints: 1,
          totalAlerts: 1,
          uniqueParticipantCount: { $size: "$uniqueParticipants" },
          _id: 0,
        },
      },
    ]);

    return NextResponse.json({
      trialId,
      aggregatedData: {
        byType: typeAggregation,
        bySeverity: severityAggregation,
        dailyActivity,
        alerts: alertAggregation,
        totalStats: totalStats[0] || {
          totalDataPoints: 0,
          totalAlerts: 0,
          uniqueParticipantCount: 0,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching aggregated data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
