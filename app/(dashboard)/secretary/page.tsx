import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function approveMember(id: string) {
  "use server";
  await connectDB();
  await User.findByIdAndUpdate(id, { status: 'active' });
  revalidatePath('/dashboard/secretary');
}

async function assignRole(id: string, role: string) {
  "use server";
  await connectDB();
  await User.findByIdAndUpdate(id, { $addToSet: { roles: role }, status: 'active' });
  revalidatePath('/dashboard/secretary');
}

export default async function SecretaryDashboard() {
  const session = await auth();
  if (!session) redirect("/");

  await connectDB();
  const pendingUsers = await User.find({ status: 'pending' });
  const activeUsers = await User.find({ status: 'active' });

  const assignableRoles = ['secretary', 'treasurer', 'organizing_secretary', 'vice_secretary', 'liturgist', 'vice_moderator'];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Secretary Dashboard</h1>

      {pendingUsers.length > 0 && (
        <div className="bg-white rounded shadow mb-6">
          <h2 className="text-lg font-semibold p-4 border-b bg-yellow-50">Pending Approvals ({pendingUsers.length})</h2>
          {pendingUsers.map((u: any) => (
            <div key={u._id} className="p-4 border-b flex justify-between items-center">
              <div>
                <p className="font-medium">{u.fullName}</p>
                <p className="text-sm text-gray-500">{u.phone}</p>
              </div>
              <form action={approveMember.bind(null, u._id.toString())}>
                <button className="bg-green-600 text-white px-4 py-2 rounded">Approve</button>
              </form>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded shadow">
        <h2 className="text-lg font-semibold p-4 border-b">Active Members ({activeUsers.length})</h2>
        {activeUsers.map((u: any) => (
          <div key={u._id} className="p-4 border-b">
            <p className="font-medium">{u.fullName}</p>
            <p className="text-sm text-gray-500">{u.phone}</p>
            <p className="text-xs text-gray-400">Roles: {u.roles.join(', ')}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {assignableRoles.filter((r: string) => !u.roles.includes(r)).map((r: string) => (
                <form key={r} action={assignRole.bind(null, u._id.toString(), r)}>
                  <button className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">+ {r.replace('_', ' ')}</button>
                </form>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}