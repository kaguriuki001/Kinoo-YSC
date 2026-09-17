const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://kinoo_admin:KinooYSC2026@cluster0.vdiee9f.mongodb.net/kinoo_ysc?retryWrites=true&w=majority';

(async () => {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  // Event yesterday
  const eventDate = new Date();
  eventDate.setDate(eventDate.getDate() - 1);
  eventDate.setHours(18, 0, 0, 0);

  const eventResult = await db.collection('events').insertOne({
    title: 'Youth Retreat Test — Feedback Demo',
    date: eventDate,
    time: '18:00',
    venue: 'Kinoo Church Hall',
    description: 'A completed test event to demonstrate the 24-hour feedback window',
    ticketPrice: 0,
    status: 'completed',
    createdAt: new Date(),
    __v: 0
  });

  const eventId = eventResult.insertedId;
  console.log('✅ Event created:', eventId.toString());
  console.log('   Title: Youth Retreat Test — Feedback Demo');
  console.log('   Date (yesterday):', eventDate.toISOString());
  console.log('   Status: completed');

  // Mark 3 users as present at this event
  const users = await db.collection('users')
    .find({ status: 'active' })
    .limit(3)
    .toArray();

  for (const u of users) {
    await db.collection('attendance').insertOne({
      eventId: eventId,
      memberId: u._id,
      status: 'present',
      date: new Date(),
      __v: 0
    });
    console.log('   ✅ Marked present:', u.fullName, '(' + u.phone + ')');
  }

  // Show the feedback window info
  const eventEnd = new Date(eventDate);
  eventEnd.setHours(23, 59, 59, 999);
  const windowEnd = new Date(eventEnd.getTime() + 24 * 60 * 60 * 1000);
  const hoursLeft = Math.max(0, Math.floor((windowEnd.getTime() - Date.now()) / (60 * 60 * 1000)));

  console.log('');
  console.log('📅 Feedback window:');
  console.log('   Event end:   ', eventEnd.toISOString());
  console.log('   Window closes:', windowEnd.toISOString());
  console.log('   Hours left:  ', hoursLeft);

  process.exit(0);
})().catch(e => { console.log('ERR:', e.message); process.exit(1); });
