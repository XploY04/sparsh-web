import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import dbConnect from "../../../../lib/dbConnect";
import Trial from "../../../../models/Trial";

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    await dbConnect();
    const { trialId } = params;

    const trial = await Trial.findById(trialId);
    if (!trial) {
      return new Response("Trial not found", { status: 404 });
    }

    return Response.json(trial);
  } catch (error) {
    console.error("Error fetching trial:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
