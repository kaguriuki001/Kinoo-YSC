import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LiturgistDashboard() {
  const session = await auth();
  if (!session) redirect("/");

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Liturgist Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-semibold mb-3">Liturgy Calendar</h2>
          <p className="text-gray-500">Next Sunday: Reader - Mary Wanjiku</p>
          <p className="text-gray-500">Intercessor: John Kamau</p>
          <p className="text-gray-500">Choir: Youth Praise Team</p>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-semibold mb-3">Prayer Wall</h2>
          <p className="text-gray-500">2 new prayer requests</p>
          <p className="text-gray-500">3 answered prayers this month</p>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-semibold mb-3">Homily Notes</h2>
          <p className="text-gray-500">Theme: Faith in Action</p>
          <p className="text-gray-500">Reading: Hebrews 11:1-6</p>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-semibold mb-3">Spiritual Committee</h2>
          <p className="text-gray-500">Chair: Liturgist</p>
          <p className="text-gray-500">Secretary: Jane Muthoni</p>
          <p className="text-gray-500">Members: 4</p>
        </div>
      </div>
    </div>
  );
}