import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import dbConnect from "../../../lib/dbConnect";
import Trial from "../../../models/Trial";
import { logAction, extractRequestMetadata } from "../../../lib/auditLogger";

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }
  await dbConnect();
  const trials = await Trial.find({});
  return Response.json(trials);
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const data = await req.json();
  await dbConnect();

  const trial = new Trial(data);
  await trial.save();

  // Log trial creation
  const metadata = extractRequestMetadata(req);
  await logAction(
    session.user.id,
    "trial_created",
    {
      trialId: trial._id,
      title: trial.title,
      description: trial.description,
      status: trial.status,
      targetEnrollment: trial.targetEnrollment,
      arms: trial.arms,
    },
    { ...metadata, trialId: trial._id }
  );

  return Response.json(trial);
}
