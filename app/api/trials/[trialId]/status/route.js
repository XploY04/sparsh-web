import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import dbConnect from "../../../../../lib/dbConnect";
import Trial from "../../../../../models/Trial";

export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    await dbConnect();
    const { trialId } = params;
    const { status } = await req.json();

    // Validate status
    const validStatuses = ["draft", "active", "completed", "paused"];
    if (!validStatuses.includes(status)) {
      return new Response("Invalid status", { status: 400 });
    }

    // Update trial status
    const trial = await Trial.findByIdAndUpdate(
      trialId,
      { status },
      { new: true, runValidators: true }
    );

    if (!trial) {
      return new Response("Trial not found", { status: 404 });
    }

    return Response.json(trial);
  } catch (error) {
    console.error("Error updating trial status:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
