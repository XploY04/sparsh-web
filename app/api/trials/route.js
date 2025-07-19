import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import dbConnect from "../../../lib/dbConnect";
import Trial from "../../../models/Trial";

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
  return Response.json(trial);
}
