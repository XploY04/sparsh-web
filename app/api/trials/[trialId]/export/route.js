import { NextResponse } from "next/server";
import { Parser } from "json2csv";
import mongoose from "mongoose";
import dbConnect from "../../../../../lib/dbConnect";
import Trial from "../../../../../models/Trial";
import Participant from "../../../../../models/Participant";
import DataPoint from "../../../../../models/DataPoint";

export async function GET(request, { params }) {
  try {
    await dbConnect();

    const { trialId } = params;
    const { searchParams } = new URL(request.url);
    const isBlinded = searchParams.get("blinded") === "true";

    // Verify trial exists
    const trial = await Trial.findById(trialId);
    if (!trial) {
      return NextResponse.json({ error: "Trial not found" }, { status: 404 });
    }

    // Check if unblinded data is requested but trial is still blinded
    if (!isBlinded && !trial.isUnblinded) {
      return NextResponse.json(
        { error: "Trial is not unblinded yet. Cannot export unblinded data." },
        { status: 403 }
      );
    }

    // Convert trialId to ObjectId for queries
    const trialObjectId = new mongoose.Types.ObjectId(trialId);

    // Fetch all participants for this trial
    const participants = await Participant.find({ trialId: trialObjectId })
      .select("participantCode assignedGroup enrollmentDate status")
      .lean();

    // Fetch all data points for this trial
    const dataPoints = await DataPoint.find({ trialId: trialObjectId })
      .populate({
        path: "participantId",
        select: "participantCode assignedGroup enrollmentDate status",
      })
      .lean();

    // Prepare data for CSV export
    const exportData = [];

    // Add participant data
    for (const participant of participants) {
      const baseRow = {
        participantCode: participant.participantCode,
        enrollmentDate: participant.enrollmentDate,
        status: participant.status,
        assignedGroup: isBlinded
          ? `Group ${participant.assignedGroup}`
          : getGroupName(trial, participant.assignedGroup),
      };

      // Find all data points for this participant
      const participantDataPoints = dataPoints.filter(
        (dp) => dp.participantId._id.toString() === participant._id.toString()
      );

      if (participantDataPoints.length === 0) {
        // If no data points, add just the participant info
        exportData.push({
          ...baseRow,
          dataType: "N/A",
          timestamp: "N/A",
          severity: "N/A",
          isAlert: "N/A",
          payload: "N/A",
        });
      } else {
        // Add one row per data point
        for (const dataPoint of participantDataPoints) {
          exportData.push({
            ...baseRow,
            dataType: dataPoint.type,
            timestamp: dataPoint.timestamp,
            severity: dataPoint.severity,
            isAlert: dataPoint.isAlert ? "Yes" : "No",
            payload: JSON.stringify(dataPoint.payload),
          });
        }
      }
    }

    // Define CSV fields
    const fields = [
      "participantCode",
      "enrollmentDate",
      "status",
      "assignedGroup",
      "dataType",
      "timestamp",
      "severity",
      "isAlert",
      "payload",
    ];

    // Convert to CSV
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(exportData);

    // Set response headers for file download
    const filename = `${trial.title.replace(/[^a-z0-9]/gi, "_")}_${
      isBlinded ? "blinded" : "unblinded"
    }_export_${new Date().toISOString().split("T")[0]}.csv`;

    const response = new NextResponse(csv);
    response.headers.set("Content-Type", "text/csv");
    response.headers.set(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );

    return response;
  } catch (error) {
    console.error("Error exporting data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to get group name for unblinded data
function getGroupName(trial, groupNumber) {
  if (trial.arms && trial.arms[groupNumber]) {
    return trial.arms[groupNumber].name || `Group ${groupNumber}`;
  }
  return `Group ${groupNumber}`;
}
