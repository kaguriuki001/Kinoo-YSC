const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb+srv://kinoo_admin:KinooYSC2026@cluster0.vdiee9f.mongodb.net/kinoo_ysc?retryWrites=true&w=majority';
const PHONE = '254795827853';
const NEW_PASSWORD = 'Kinoo123!';

(async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;

    const newHash = await bcrypt.hash(NEW_PASSWORD, 12);
    const r = await db.collection('users').updateOne(
      { phone: PHONE },
      { $set: { passwordHash: newHash, status: 'active', roles: ['father', 'moderator', 'member'] } }
    );
    console.log('Updated:', r.modifiedCount);

    const u = await db.collection('users').findOne({ phone: PHONE });
    const ok = await bcrypt.compare(NEW_PASSWORD, u.passwordHash);
    console.log('Password "' + NEW_PASSWORD + '" now matches:', ok);
    console.log('Roles:', JSON.stringify(u.roles));
    console.log('Status:', u.status);

    process.exit(0);
  } catch (e) {
    console.log('ERR:', e.message);
    process.exit(1);
  }
})();
