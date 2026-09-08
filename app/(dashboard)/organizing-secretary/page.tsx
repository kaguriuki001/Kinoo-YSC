import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import { redirect } from "next/navigation";

export default async function OrganisingSecretaryDashboard() {
  const session = await auth();
  if (!session) redirect("/");

  await connectDB();
  const events = await Event.find().sort({ date: 1 });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Organising Secretary Dashboard</h1>

      <div className="bg-white rounded shadow mb-6">
        <h2 className="text-lg font-semibold p-4 border-b">All Events</h2>
        {events.length === 0 ? (
          <p className="p-4 text-gray-500">No events created yet</p>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Venue</th>
                <th className="p-3 text-left">Ticket Price</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e: any) => (
                <tr key={e._id} className="border-b">
                  <td className="p-3">{e.title}</td>
                  <td className="p-3">{new Date(e.date).toDateString()}</td>
                  <td className="p-3">{e.venue}</td>
                  <td className="p-3">KES {e.ticketPrice}</td>
                  <td className="p-3">{e.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Venue Management</h3>
          <p className="text-sm text-gray-500">Book and manage event venues</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Transport</h3>
          <p className="text-sm text-gray-500">Plan routes and buses</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Catering</h3>
          <p className="text-sm text-gray-500">Menu and headcount planning</p>
        </div>
      </div>
    </div>
  );
}