const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://kinoo_admin:KinooYSC2026@cluster0.vdiee9f.mongodb.net/kinoo_ysc?retryWrites=true&w=majority';

const NAMES = [
  'John Kamau', 'Mary Wanjiku', 'Peter Otieno', 'Grace Njeri', 'David Mwangi',
  'Sarah Achieng', 'James Kipchoge', 'Faith Muthoni', 'Brian Omondi', 'Lucy Wairimu',
  'Michael Njoroge', 'Ruth Adhiambo', 'Samuel Kariuki', 'Esther Wangari', 'Daniel Kiptoo',
  'Cynthia Atieno', 'Joseph Mutua', 'Purity Chebet', 'Kevin Odhiambo', 'Mercy Wambui',
  'Victor Mwenda', 'Nancy Auma', 'Patrick Maina', 'Joyce Nyambura', 'Isaac Kemboi',
  'Rose Akinyi', 'Anthony Mbugua', 'Beatrice Wanjiru', 'Simon Barasa', 'Alice Moraa'
];

const ROLES_POOL = [
  ['member'],
  ['member'],
  ['member'],
  ['secretary', 'member'],
  ['treasurer', 'member'],
  ['organizing_secretary', 'member'],
  ['vice_secretary', 'member'],
  ['liturgist', 'member'],
  ['vice_moderator', 'member'],
  ['patron_matron', 'member'],
];

const PURPOSES = ['Tithe', 'Offering', 'Event Fee', 'Welfare', 'Building Fund', 'Missions', 'Youth Camp'];
const EVENTS_TITLES = [
  'Youth Retreat 2026', 'Annual Sports Day', 'Leadership Training', 'Christmas Carols',
  'Easter Convention', 'Career Day', 'Community Service', 'Bible Study Series',
  'Talent Show', 'Fundraising Dinner', 'Youth Camp', 'Prayer Summit'
];
const VENUES = ['Church Hall', 'Kinoo Grounds', 'Nairobi Retreat Center', 'Main Sanctuary', 'Community Center'];
const FRAGO_OPS = [
  'Operation Tumaini', 'Operation Amani', 'Operation Nguvu', 'Operation Baraka',
  'Operation Upendo', 'Operation Mwanga', 'Operation Neema', 'Operation Furaha'
];

function randomFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomDate(monthsAgo, monthsBack) {
  const now = new Date();
  const past = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
  const end = new Date(now.getFullYear(), now.getMonth() - (monthsBack || 0), 28);
  return new Date(past.getTime() + Math.random() * (end.getTime() - past.getTime()));
}

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  console.log('Clearing old test data...');
  await db.collection('users').deleteMany({});
  await db.collection('events').deleteMany({});
  await db.collection('transactions').deleteMany({});
  await db.collection('fragos').deleteMany({});
  await db.collection('budgets').deleteMany({});
  await db.collection('notifications').deleteMany({});
  await db.collection('attendance').deleteMany({});
  await db.collection('settings').deleteMany({});
  await db.collection('subcommittees').deleteMany({});

  // ===== USERS =====
  console.log('Creating users...');
  const bcrypt = require('bcryptjs');
  const users = [];

  // Supreme admin
  const adminHash = await bcrypt.hash('Kinoo123!', 12);
  const adminId = new mongoose.Types.ObjectId();
  users.push({
    _id: adminId,
    fullName: 'Kaguru Kariuki',
    phone: '254795827853',
    idNumber: '40031422',
    passwordHash: adminHash,
    roles: ['father', 'moderator', 'member'],
    status: 'active',
    createdAt: new Date(new Date().getFullYear(), new Date().getMonth() - 12, 1),
    __v: 0
  });

  // 30 members
  for (let i = 0; i < NAMES.length; i++) {
    const hash = await bcrypt.hash('Kinoo123!', 12);
    const roles = i < ROLES_POOL.length ? ROLES_POOL[i] : ['member'];
    users.push({
      _id: new mongoose.Types.ObjectId(),
      fullName: NAMES[i],
      phone: `2547${randomInt(10000000, 99999999)}`,
      idNumber: `${randomInt(20000000, 40000000)}`,
      passwordHash: hash,
      roles,
      status: 'active',
      createdAt: randomDate(11, 0),
      __v: 0
    });
  }

  // Pending members
  for (let i = 0; i < 5; i++) {
    const hash = await bcrypt.hash('Kinoo123!', 12);
    users.push({
      _id: new mongoose.Types.ObjectId(),
      fullName: `Pending User ${i + 1}`,
      phone: `2547${randomInt(10000000, 99999999)}`,
      idNumber: `${randomInt(20000000, 40000000)}`,
      passwordHash: hash,
      roles: ['member'],
      status: 'pending',
      createdAt: randomDate(1, 0),
      __v: 0
    });
  }

  await db.collection('users').insertMany(users);
  const activeUsers = users.filter(u => u.status === 'active');
  console.log(`✓ Created ${users.length} users (${activeUsers.length} active, ${users.length - activeUsers.length} pending)`);

  // ===== EVENTS =====
  console.log('Creating events...');
  const events = [];
  for (let month = 11; month >= 0; month--) {
    const eventsThisMonth = randomInt(1, 2);
    for (let e = 0; e < eventsThisMonth; e++) {
      const eventDate = new Date(new Date().getFullYear(), new Date().getMonth() - month, randomInt(5, 25));
      events.push({
        _id: new mongoose.Types.ObjectId(),
        title: `${randomFrom(EVENTS_TITLES)}`,
        date: eventDate,
        time: `${randomInt(9, 15)}:00`,
        venue: randomFrom(VENUES),
        description: 'Test event for demonstration',
        ticketPrice: randomInt(0, 1) ? randomInt(100, 500) : 0,
        status: eventDate < new Date() ? 'completed' : 'upcoming',
        createdAt: new Date(eventDate.getTime() - 14 * 24 * 60 * 60 * 1000),
        __v: 0
      });
    }
  }
  await db.collection('events').insertMany(events);
  console.log(`✓ Created ${events.length} events`);

  // ===== TRANSACTIONS =====
  console.log('Creating transactions...');
  const transactions = [];
  for (let month = 11; month >= 0; month--) {
    const txCount = randomInt(8, 15);
    for (let t = 0; t < txCount; t++) {
      const isExpense = Math.random() < 0.3;
      const user = randomFrom(activeUsers);
      transactions.push({
        _id: new mongoose.Types.ObjectId(),
        fromUser: isExpense ? null : user._id,
        toAccount: 'Kinoo YSC Main',
        amount: isExpense ? randomInt(500, 5000) : randomInt(50, 1500),
        purpose: isExpense ? randomFrom(['Transport', 'Catering', 'Equipment', 'Venue', 'Printing']) : randomFrom(PURPOSES),
        type: isExpense ? 'expense' : 'income',
        description: '',
        verified: true,
        date: new Date(new Date().getFullYear(), new Date().getMonth() - month, randomInt(1, 28)),
        __v: 0
      });
    }
  }
  await db.collection('transactions').insertMany(transactions);
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  console.log(`✓ Created ${transactions.length} transactions (Income: KES ${totalIncome}, Expenses: KES ${totalExpense}, Balance: KES ${totalIncome - totalExpense})`);

  // ===== FRAGOS =====
  console.log('Creating FRAGOs...');
  const fragos = [];
  for (let month = 11; month >= 0; month--) {
    const numFragos = randomInt(0, 2);
    for (let f = 0; f < numFragos; f++) {
      const attended = activeUsers.slice(0, randomInt(8, 20)).map(u => ({
        memberId: u._id.toString(),
        name: u.fullName,
        role: u.roles[0] || 'Member'
      }));
      const budget = [
        { name: 'Transport', amount: randomInt(1000, 3000) },
        { name: 'Food', amount: randomInt(2000, 6000) },
        { name: 'Equipment', amount: randomInt(500, 2000) },
        { name: 'Misc', amount: randomInt(300, 1000) },
      ];
      const reconciliation = budget.map(b => ({
        name: b.name,
        actual: String(randomInt(b.amount * 0.8, b.amount * 1.2)),
        note: Math.random() < 0.3 ? 'Slight variance' : ''
      }));
      const verdicts = ['Successful', 'Mixed', 'Needs Improvement'];
      const verdict = randomFrom(verdicts);
      fragos.push({
        _id: new mongoose.Types.ObjectId(),
        opName: randomFrom(FRAGO_OPS),
        situation: 'Youth group event activity',
        missionStmt: 'Execute event safely and successfully',
        assemblyTime: '07:00',
        departTime: '07:30',
        arriveTime: '09:00',
        redeployTime: '17:00',
        returnTime: '18:30',
        busCompany: 'Kinoo Travels',
        busPhone: `2547${randomInt(10000000, 99999999)}`,
        busDetails: 'Bus KDA 123X',
        oicContact: randomFrom(activeUsers).fullName,
        ncoic1Contact: randomFrom(activeUsers).fullName,
        ncoic2Contact: randomFrom(activeUsers).fullName,
        medicContact: 'St. John Ambulance',
        comms: 'WhatsApp Group',
        budget,
        attendees: attended,
        checklist: [
          { text: 'First aid kit', done: true },
          { text: 'Water bottles', done: true },
          { text: 'Roll call done', done: Math.random() < 0.7 },
        ],
        strengths: 'Good coordination, punctuality',
        weaknesses: 'Slight delay in transport',
        recommendations: 'Book buses earlier',
        incidents: 'None',
        verdict,
        noShows: String(randomInt(0, 3)),
        lateArrivals: String(randomInt(1, 5)),
        reconciliation,
        signatures: {
          moderator: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
          fic: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
        },
        status: 'completed',
        createdAt: new Date(new Date().getFullYear(), new Date().getMonth() - month, randomInt(1, 28)),
        updatedAt: new Date(),
        __v: 0
      });
    }
  }
  if (fragos.length > 0) {
    await db.collection('fragos').insertMany(fragos);
  }
  console.log(`✓ Created ${fragos.length} FRAGOs`);

  // ===== BUDGETS =====
  console.log('Creating budgets...');
  const budgets = [];
  for (let i = 0; i < 6; i++) {
    const items = [
      { name: 'Venue', estimatedCost: randomInt(2000, 8000), actualCost: 0 },
      { name: 'Food', estimatedCost: randomInt(5000, 15000), actualCost: 0 },
      { name: 'Transport', estimatedCost: randomInt(2000, 5000), actualCost: 0 },
      { name: 'Entertainment', estimatedCost: randomInt(1000, 3000), actualCost: 0 },
    ];
    const total = items.reduce((s, i) => s + i.estimatedCost, 0);
    budgets.push({
      _id: new mongoose.Types.ObjectId(),
      title: `${randomFrom(EVENTS_TITLES)} Budget`,
      items,
      totalAmount: total,
      status: randomFrom(['draft', 'approved', 'rejected']),
      createdAt: randomDate(6, 0),
      updatedAt: new Date(),
      __v: 0
    });
  }
  await db.collection('budgets').insertMany(budgets);
  console.log(`✓ Created ${budgets.length} budgets`);

  // ===== NOTIFICATIONS =====
  console.log('Creating notifications...');
  const notifications = [];
  const notifTemplates = [
    { title: 'New Event', message: 'Youth Retreat has been scheduled', type: 'event' },
    { title: 'FRAGO Updated', message: 'Operation Tumaini has been updated', type: 'frago' },
    { title: 'Payment Received', message: 'Contribution confirmed', type: 'transaction' },
    { title: 'New Member', message: 'A new member has joined', type: 'member' },
  ];
  for (let i = 0; i < 20; i++) {
    const t = randomFrom(notifTemplates);
    notifications.push({
      id: Date.now().toString() + i,
      title: t.title,
      message: t.message,
      type: t.type,
      userId: randomFrom(activeUsers)._id.toString(),
      timestamp: randomDate(3, 0),
      read: Math.random() < 0.5
    });
  }
  await db.collection('notifications').insertMany(notifications);
  console.log(`✓ Created ${notifications.length} notifications`);

  // ===== M-PESA SETTINGS =====
  await db.collection('settings').insertOne({
    key: 'mpesa',
    paybill: '247247',
    tillNumber: '5123456',
    accountNumber: 'KINOOYSC',
    accountName: 'Kinoo Youth Sports Club',
    organizationName: 'Kinoo YSC',
    updatedAt: new Date()
  });
  console.log('✓ Created M-Pesa settings');

  // ===== SUMMARY =====
  console.log('\n=== SEED COMPLETE ===');
  console.log(`Users: ${users.length}`);
  console.log(`  - Admin: 1 (phone: 254795827853, password: Kinoo123!)`);
  console.log(`  - Active: ${activeUsers.length - 1}`);
  console.log(`  - Pending: 5`);
  console.log(`Events: ${events.length}`);
  console.log(`Transactions: ${transactions.length}`);
  console.log(`FRAGOs: ${fragos.length}`);
  console.log(`Budgets: ${budgets.length}`);
  console.log(`Notifications: ${notifications.length}`);
  console.log(`\nLogin with:`);
  console.log(`  Phone: 0795827853 (or 254795827853)`);
  console.log(`  Password: Kinoo123!`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});