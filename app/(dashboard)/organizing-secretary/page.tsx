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
      <h1 className="text-2xl font-bold mb-4">Organising Secretary</h1>
      <div className="bg-white rounded shadow">
        <h2 className="text-lg font-semibold p-4 border-b">All Events</h2>
        {events.length === 0 ? (
          <p className="p-4 text-gray-500">No events yet</p>
        ) : (
          events.map((e: any) => (
            <div key={e._id} className="p-4 border-b">
              <p className="font-medium">{e.title}</p>
              <p className="text-sm text-gray-500">{new Date(e.date).toDateString()} - {e.venue}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}