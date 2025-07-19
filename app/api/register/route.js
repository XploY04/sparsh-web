import dbConnect from "../../../lib/dbConnect";
import User from "../../../models/User";
import bcrypt from "bcryptjs";

export async function POST(req) {
  const { email, password, role } = await req.json();
  await dbConnect();
  const existing = await User.findOne({ email });
  if (existing) {
    return new Response("User already exists", { status: 400 });
  }
  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ email, password: hashed, role: role || "admin" });
  await user.save();
  return Response.json({ id: user._id, email: user.email, role: user.role });
}
