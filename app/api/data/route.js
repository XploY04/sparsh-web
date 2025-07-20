import { NextResponse } from "next/server";
import dbConnect from "../../../lib/dbConnect";
import DataPoint from "../../../models/DataPoint";
import Participant from "../../../models/Participant";

export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { participantCode, type, payload } = body;

    if (!participantCode || !type || !payload) {
      return NextResponse.json(
        { error: "Missing required fields: participantCode, type, payload" },
        { status: 400 }
      );
    }

    // Find participant by code
    const participant = await Participant.findOne({ participantCode });
    if (!participant) {
      return NextResponse.json(
        { error: "Participant not found" },
        { status: 404 }
      );
    }

    // Determine if this is an alert based on type and payload
    let isAlert = false;
    let severity = "low";

    // Alert criteria
    if (type === "EmergencyCall") {
      isAlert = true;
      severity = "critical";
    } else if (type === "SideEffect" && payload.severity === "severe") {
      isAlert = true;
      severity = "high";
    } else if (type === "SymptomReport" && payload.severity >= 8) {
      isAlert = true;
      severity = "medium";
    } else if (type === "VitalSigns") {
      // Check for abnormal vital signs
      if (payload.heartRate > 120 || payload.heartRate < 50) {
        isAlert = true;
        severity = "medium";
      }
      if (
        payload.bloodPressure?.systolic > 180 ||
        payload.bloodPressure?.diastolic > 110
      ) {
        isAlert = true;
        severity = "high";
      }
    }

    // Create data point
    const dataPoint = new DataPoint({
      participantId: participant._id,
      trialId: participant.trialId,
      type,
      payload,
      isAlert,
      severity,
    });

    await dataPoint.save();

    return NextResponse.json({
      success: true,
      dataPoint: {
        id: dataPoint._id,
        type: dataPoint.type,
        isAlert: dataPoint.isAlert,
        severity: dataPoint.severity,
        timestamp: dataPoint.timestamp,
      },
    });
  } catch (error) {
    console.error("Error creating data point:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const participantCode = searchParams.get("participantCode");
    const type = searchParams.get("type");
    const limit = parseInt(searchParams.get("limit")) || 50;

    let query = {};

    if (participantCode) {
      const participant = await Participant.findOne({ participantCode });
      if (participant) {
        query.participantId = participant._id;
      }
    }

    if (type) {
      query.type = type;
    }

    const dataPoints = await DataPoint.find(query)
      .populate("participantId", "participantCode")
      .sort({ timestamp: -1 })
      .limit(limit);

    return NextResponse.json({ dataPoints });
  } catch (error) {
    console.error("Error fetching data points:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
