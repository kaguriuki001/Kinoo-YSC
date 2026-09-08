import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import { redirect } from "next/navigation";

export default async function MemberDashboard() {
  const session = await auth();
  if (!session) redirect("/");

  await connectDB();
  const events = await Event.find({ date: { $gte: new Date() } }).sort('date').limit(5);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Member Dashboard</h1>
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-lg font-semibold mb-3">Upcoming Events</h2>
        {events.length === 0 ? (
          <p className="text-gray-500">No upcoming events</p>
        ) : (
          events.map((e: any) => (
            <div key={e._id} className="border-b py-2">
              <p className="font-medium">{e.title}</p>
              <p className="text-sm text-gray-500">{new Date(e.date).toDateString()} - {e.venue}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}