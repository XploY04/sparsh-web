import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import dbConnect from "../../../../../lib/dbConnect";
import Trial from "../../../../../models/Trial";
import Participant from "../../../../../models/Participant";
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

    const { trialId } = params;
    const { reason, confirmationText } = await request.json();

    // Validate required fields
    if (!reason || reason.trim().length < 20) {
      return NextResponse.json(
        {
          error:
            "A detailed reason is required for study unblinding (minimum 20 characters)",
        },
        { status: 400 }
      );
    }

    if (confirmationText !== "UNBLIND STUDY") {
      return NextResponse.json(
        { error: "Confirmation text must be exactly 'UNBLIND STUDY'" },
        { status: 400 }
      );
    }

    // Get request metadata for audit trail
    const metadata = extractRequestMetadata(request);

    // Verify trial exists
    const trial = await Trial.findById(trialId);
    if (!trial) {
      // Log failed attempt
      await logAction(
        session.user.id,
        "trial_unblinded",
        {
          trialId,
          success: false,
          reason: "Trial not found",
          attemptedReason: reason,
        },
        { ...metadata, trialId }
      );

      return NextResponse.json({ error: "Trial not found" }, { status: 404 });
    }

    // Check if trial is already unblinded
    if (trial.isUnblinded) {
      // Log redundant attempt
      await logAction(
        session.user.id,
        "trial_unblinded",
        {
          trialId: trial._id,
          trialTitle: trial.title,
          success: false,
          reason: "Trial already unblinded",
          attemptedReason: reason,
        },
        { ...metadata, trialId: trial._id }
      );

      return NextResponse.json(
        { error: "Trial is already unblinded" },
        { status: 400 }
      );
    }

    // Check if trial is in appropriate state for unblinding
    if (trial.status === "draft") {
      return NextResponse.json(
        { error: "Cannot unblind a draft trial" },
        { status: 400 }
      );
    }

    // Get all participants in the trial
    const participants = await Participant.find({ trialId });
    const totalParticipants = participants.length;
    const alreadyUnblindedCount = participants.filter(
      (p) => p.isUnblinded
    ).length;

    // Update trial to unblinded status
    trial.isUnblinded = true;
    trial.unblindedAt = new Date();
    trial.unblindedBy = session.user.id;
    await trial.save();

    // Optionally unblind all participants in the trial
    await Participant.updateMany(
      { trialId, isUnblinded: false },
      { isUnblinded: true }
    );

    const newlyUnblindedCount = totalParticipants - alreadyUnblindedCount;

    // Generate treatment mapping
    const treatmentMapping = trial.arms.map((arm, index) => ({
      group: index,
      name: arm.name || `Group ${index}`,
      description: arm.description || "",
    }));

    // Log successful unblinding
    await logAction(
      session.user.id,
      "trial_unblinded",
      {
        trialId: trial._id,
        trialTitle: trial.title,
        success: true,
        reason: reason.trim(),
        unblindedAt: trial.unblindedAt,
        totalParticipants,
        alreadyUnblindedCount,
        newlyUnblindedCount,
        treatmentMapping,
      },
      { ...metadata, trialId: trial._id }
    );

    return NextResponse.json({
      success: true,
      trial: {
        id: trial._id,
        title: trial.title,
        unblindedAt: trial.unblindedAt,
        unblindedBy: session.user.id,
      },
      participants: {
        total: totalParticipants,
        alreadyUnblinded: alreadyUnblindedCount,
        newlyUnblinded: newlyUnblindedCount,
      },
      treatmentMapping,
      message: "Study successfully unblinded",
    });
  } catch (error) {
    console.error("Error unblinding trial:", error);

    // Log the error attempt
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      await logAction(
        session.user.id,
        "trial_unblinded",
        {
          trialId: params.trialId,
          success: false,
          reason: "System error",
          error: error.message,
        },
        {
          ...extractRequestMetadata(request),
          trialId: params.trialId,
        }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
