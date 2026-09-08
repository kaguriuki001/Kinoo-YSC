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

async function rejectMember(id: string) {
  "use server";
  await connectDB();
  await User.findByIdAndUpdate(id, { status: 'dismissed' });
  revalidatePath('/dashboard/secretary');
}

async function assignRole(id: string, role: string) {
  "use server";
  await connectDB();
  await User.findByIdAndUpdate(id, { 
    $addToSet: { roles: role },
    status: 'active'
  });
  revalidatePath('/dashboard/secretary');
}

async function removeRole(id: string, role: string) {
  "use server";
  await connectDB();
  await User.findByIdAndUpdate(id, { 
    $pull: { roles: role }
  });
  revalidatePath('/dashboard/secretary');
}

export default async function SecretaryDashboard() {
  const session = await auth();
  if (!session) redirect("/");

  await connectDB();
  const pendingUsers = await User.find({ status: 'pending' });
  const activeUsers = await User.find({ status: 'active' }).sort({ createdAt: 1 });

  const assignableRoles = [
    'secretary', 'treasurer', 'organizing_secretary', 
    'vice_secretary', 'liturgist', 'vice_moderator'
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Secretary Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-yellow-50 p-6 rounded-lg shadow border border-yellow-200">
          <h2 className="text-lg font-semibold text-yellow-800">Pending Approvals</h2>
          <p className="text-3xl font-bold text-yellow-600">{pendingUsers.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold">Active Members</h2>
          <p className="text-3xl font-bold">{activeUsers.length}</p>
        </div>
      </div>

      {pendingUsers.length > 0 ? (
        <div className="bg-white rounded shadow mb-6">
          <h2 className="text-lg font-semibold p-4 border-b bg-yellow-50">
            Awaiting Approval ({pendingUsers.length})
          </h2>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Phone</th>
                <th className="p-3 text-left">ID Number</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingUsers.map((u: any) => (
                <tr key={u._id} className="border-b">
                  <td className="p-3">{u.fullName}</td>
                  <td className="p-3">{u.phone}</td>
                  <td className="p-3">{u.idNumber || 'N/A'}</td>
                  <td className="p-3 flex gap-2">
                    <form action={approveMember.bind(null, u._id.toString())}>
                      <button className="bg-green-600 text-white px-3 py-1 rounded text-sm">
                        Approve as Member
                      </button>
                    </form>
                    <form action={rejectMember.bind(null, u._id.toString())}>
                      <button className="bg-red-600 text-white px-3 py-1 rounded text-sm">
                        Reject
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-green-50 p-4 rounded mb-6 text-green-700">
          ✅ No pending approvals. All caught up!
        </div>
      )}

      <div className="bg-white rounded shadow">
        <h2 className="text-lg font-semibold p-4 border-b">
          Active Members & Role Assignment ({activeUsers.length})
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Phone</th>
                <th className="p-3 text-left">Current Roles</th>
                <th className="p-3 text-left">Add Role</th>
                <th className="p-3 text-left">Remove Role</th>
              </tr>
            </thead>
            <tbody>
              {activeUsers.map((u: any) => (
                <tr key={u._id} className="border-b">
                  <td className="p-3">{u.fullName}</td>
                  <td className="p-3">{u.phone}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {u.roles.map((role: string) => (
                        <span key={role} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">
                          {role.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {assignableRoles.filter(role => !u.roles.includes(role)).map(role => (
                        <form key={role} action={assignRole.bind(null, u._id.toString(), role)}>
                          <button className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs hover:bg-green-200">
                            + {role.replace('_', ' ')}
                          </button>
                        </form>
                      ))}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {u.roles.filter(role => role !== 'member').map(role => (
                        <form key={role} action={removeRole.bind(null, u._id.toString(), role)}>
                          <button className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs hover:bg-red-200">
                            - {role.replace('_', ' ')}
                          </button>
                        </form>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
s