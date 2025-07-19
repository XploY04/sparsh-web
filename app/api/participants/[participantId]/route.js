import { NextResponse } from "next/server";
import dbConnect from "../../../lib/dbConnect";
import Participant from "../../../models/Participant";
import Trial from "../../../models/Trial";

export async function GET(request, { params }) {
  try {
    await dbConnect();

    const { participantId } = params;

    // Find participant with trial information
    const participant = await Participant.findById(participantId)
      .populate("trialId", "title description")
      .lean();

    if (!participant) {
      return NextResponse.json(
        { error: "Participant not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(participant);
  } catch (error) {
    console.error("Error fetching participant:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
