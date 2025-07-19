import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import dbConnect from "../../../../../lib/dbConnect";
import Participant from "../../../../../models/Participant";
import Trial from "../../../../../models/Trial";
import { NextRequest } from "next/server";

// Helper function to generate unique participant code
function generateParticipantCode() {
  const prefix = "P";
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `${prefix}${timestamp}${random}`;
}

// Helper function to perform randomization
function randomizeParticipant(randomizationRatio) {
  const totalWeight = randomizationRatio.reduce(
    (sum, weight) => sum + weight,
    0
  );
  const random = Math.random() * totalWeight;

  let cumulativeWeight = 0;
  for (let i = 0; i < randomizationRatio.length; i++) {
    cumulativeWeight += randomizationRatio[i];
    if (random <= cumulativeWeight) {
      return i;
    }
  }

  return 0; // Default to first group
}

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    await dbConnect();
    const { trialId } = params;

    // Fetch participants but OMIT assignedGroup to maintain blind
    const participants = await Participant.find({ trialId })
      .select("-assignedGroup -isUnblinded")
      .sort({ enrollmentDate: -1 });

    return Response.json(participants);
  } catch (error) {
    console.error("Error fetching participants:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    await dbConnect();
    const { trialId } = params;

    // Fetch the trial to get randomization ratio
    const trial = await Trial.findById(trialId);
    if (!trial) {
      return new Response("Trial not found", { status: 404 });
    }

    // Check if trial is active for enrollment
    if (trial.status !== "active") {
      return new Response("Trial is not active for enrollment", {
        status: 400,
      });
    }

    // Check enrollment capacity
    const currentParticipants = await Participant.countDocuments({ trialId });
    if (currentParticipants >= trial.targetEnrollment) {
      return new Response("Trial has reached target enrollment", {
        status: 400,
      });
    }

    // Generate unique participant code
    let participantCode;
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      participantCode = generateParticipantCode();
      const existing = await Participant.findOne({ participantCode });
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return new Response("Failed to generate unique participant code", {
        status: 500,
      });
    }

    // Perform randomization
    const assignedGroup = randomizeParticipant(trial.randomizationRatio);

    // Create new participant
    const participant = new Participant({
      participantCode,
      trialId,
      assignedGroup,
      status: "enrolled",
    });

    await participant.save();

    // Return participant data without assignedGroup
    const responseData = {
      _id: participant._id,
      participantCode: participant.participantCode,
      trialId: participant.trialId,
      status: participant.status,
      enrollmentDate: participant.enrollmentDate,
      createdAt: participant.createdAt,
      updatedAt: participant.updatedAt,
    };

    return Response.json(responseData, { status: 201 });
  } catch (error) {
    console.error("Error enrolling participant:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
