const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://kinoo_admin:KinooYSC2026@cluster0.vdiee9f.mongodb.net/kinoo_ysc?retryWrites=true&w=majority';

(async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;

    const admin = await db.collection('users').findOne({ phone: '254795827853' });
    const event = await db.collection('events').findOne({ title: 'Youth Retreat Test — Feedback Demo' });

    if (!admin || !event) {
      console.log('Missing admin or event');
      process.exit(1);
    }

    const existing = await db.collection('attendance').findOne({
      eventId: event._id,
      memberId: admin._id
    });

    if (existing) {
      console.log('Already marked present for:', admin.fullName);
      console.log('Event:', event.title);
      process.exit(0);
    }

    await db.collection('attendance').insertOne({
      eventId: event._id,
      memberId: admin._id,
      status: 'present',
      date: new Date(),
      __v: 0
    });

    console.log('✅ Marked present:');
    console.log('   User:  ' + admin.fullName + ' (' + admin.phone + ')');
    console.log('   Event: ' + event.title);

    process.exit(0);
  } catch (e) {
    console.log('ERR:', e.message);
    process.exit(1);
  }
})();
