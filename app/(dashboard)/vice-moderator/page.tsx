import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Subcommittee from "@/models/Subcommittee";
import { redirect } from "next/navigation";

export default async function ViceModeratorDashboard() {
  const session = await auth();
  if (!session) redirect("/");

  await connectDB();
  const subcommittees = await Subcommittee.find()
    .populate('chairUserId', 'fullName')
    .populate('secretaryUserId', 'fullName')
    .populate('members', 'fullName');

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Vice Moderator Dashboard</h1>

      <div className="bg-white rounded shadow mb-6">
        <h2 className="text-lg font-semibold p-4 border-b">Subcommittees</h2>
        {subcommittees.length === 0 ? (
          <p className="p-4 text-gray-500">No subcommittees created yet</p>
        ) : (
          <div className="p-4 space-y-4">
            {subcommittees.map((s: any) => (
              <div key={s._id} className="border rounded p-4">
                <h3 className="font-semibold text-lg">{s.name}</h3>
                <p className="text-sm text-gray-500">Chair: {s.chairUserId?.fullName}</p>
                <p className="text-sm text-gray-500">Secretary: {s.secretaryUserId?.fullName}</p>
                <p className="text-sm text-gray-500">Members: {s.members.length}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Create Subcommittee</h3>
          <p className="text-sm text-gray-500">Form new committees and assign leaders</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Moderator Succession</h3>
          <p className="text-sm text-gray-500">Voting system for leadership changes</p>
        </div>
      </div>
    </div>
  );
}