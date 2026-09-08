import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import Transaction from "@/models/Transaction";
import { redirect } from "next/navigation";

export default async function MemberDashboard() {
  const session = await auth();
  if (!session) redirect("/");

  await connectDB();
  const events = await Event.find({ date: { $gte: new Date() } })
    .sort('date')
    .limit(5);

  const transactions = await Transaction.find({ fromUser: session.user.id })
    .sort({ date: -1 })
    .limit(10);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Member Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-3">Upcoming Events</h2>
          {events.length === 0 ? (
            <p className="text-gray-500">No upcoming events</p>
          ) : (
            <ul className="space-y-2">
              {events.map((e: any) => (
                <li key={e._id} className="border-b pb-2">
                  <p className="font-medium">{e.title}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(e.date).toDateString()} - {e.venue}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-3">My Recent Contributions</h2>
          {transactions.length === 0 ? (
            <p className="text-gray-500">No contributions yet</p>
          ) : (
            <ul className="space-y-2">
              {transactions.map((t: any) => (
                <li key={t._id} className="flex justify-between border-b pb-2">
                  <span>{t.purpose}</span>
                  <span className="font-medium">KES {t.amount}</span>
                  <span className={t.verified ? "text-green-600 text-sm" : "text-yellow-600 text-sm"}>
                    {t.verified ? "✓" : "Pending"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}