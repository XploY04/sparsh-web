import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import dbConnect from "../../../../../lib/dbConnect";
import Participant from "../../../../../models/Participant";
import Trial from "../../../../../models/Trial";
import {
  logAction,
  extractRequestMetadata,
} from "../../../../../lib/auditLogger";

export async function POST(request, { params }) {
  try {
    // Get user session for authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { participantId } = params;
    const { reason } = await request.json();

    if (!reason || reason.trim().length < 10) {
      return NextResponse.json(
        {
          error:
            "A detailed reason is required for unblinding (minimum 10 characters)",
        },
        { status: 400 }
      );
    }

    // Get request metadata for audit trail
    const metadata = extractRequestMetadata(request);

    // Verify participant exists
    const participant = await Participant.findById(participantId).populate(
      "trialId"
    );
    if (!participant) {
      // Log failed attempt
      await logAction(
        session.user.id,
        "participant_unblinded",
        {
          participantId,
          success: false,
          reason: "Participant not found",
          attemptedReason: reason,
        },
        { ...metadata, participantId }
      );

      return NextResponse.json(
        { error: "Participant not found" },
        { status: 404 }
      );
    }

    // Check if participant is already unblinded
    if (participant.isUnblinded) {
      // Log redundant attempt
      await logAction(
        session.user.id,
        "participant_unblinded",
        {
          participantId,
          participantCode: participant.participantCode,
          success: false,
          reason: "Participant already unblinded",
          attemptedReason: reason,
        },
        {
          ...metadata,
          participantId,
          trialId: participant.trialId._id,
        }
      );

      return NextResponse.json(
        { error: "Participant is already unblinded" },
        { status: 400 }
      );
    }

    // Check if the trial is completed or if emergency unblinding is allowed
    const trial = participant.trialId;
    if (trial.status === "draft") {
      return NextResponse.json(
        { error: "Cannot unblind participant in a draft trial" },
        { status: 400 }
      );
    }

    // Update participant to unblinded status
    participant.isUnblinded = true;
    await participant.save();

    // Log successful unblinding
    await logAction(
      session.user.id,
      "participant_unblinded",
      {
        participantId: participant._id,
        participantCode: participant.participantCode,
        trialId: trial._id,
        trialTitle: trial.title,
        assignedGroup: participant.assignedGroup,
        success: true,
        reason: reason.trim(),
        unblindedAt: new Date(),
      },
      {
        ...metadata,
        participantId: participant._id,
        trialId: trial._id,
      }
    );

    // Return the treatment assignment
    const treatmentAssignment = trial.arms[participant.assignedGroup];

    return NextResponse.json({
      success: true,
      participant: {
        id: participant._id,
        code: participant.participantCode,
        assignedGroup: participant.assignedGroup,
        treatmentAssignment:
          treatmentAssignment || `Group ${participant.assignedGroup}`,
        unblindedAt: new Date(),
      },
      message: "Participant successfully unblinded",
    });
  } catch (error) {
    console.error("Error unblinding participant:", error);

    // Log the error attempt
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      await logAction(
        session.user.id,
        "participant_unblinded",
        {
          participantId: params.participantId,
          success: false,
          reason: "System error",
          error: error.message,
        },
        {
          ...extractRequestMetadata(request),
          participantId: params.participantId,
        }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
