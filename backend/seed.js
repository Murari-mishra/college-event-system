require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');
const Event = require('./models/Event');
const Registration = require('./models/Registration');

const seedData = async () => {
  await connectDB();

  // Clear existing data
  await User.deleteMany();
  await Event.deleteMany();
  await Registration.deleteMany();

  console.log('🗑️  Cleared existing data');

  // Create admin user
  const admin = await User.create({
    name: 'Dr. Admin Kumar',
    email: 'admin@college.edu',
    password: 'admin123',
    role: 'admin',
    department: 'Administration',
  });

  // Create student user
  const student = await User.create({
    name: 'Rahul Sharma',
    email: 'student@college.edu',
    password: 'student123',
    role: 'student',
    department: 'Computer Science',
    rollNo: 'CS2024001',
  });

  console.log('👤 Created users');

  // Create sample events
  const event1 = await Event.create({
    title: 'Annual Tech Fest 2025',
    description:
      'Join us for the biggest technology festival of the year! Featuring hackathons, coding competitions, robotics demos, and talks from industry experts. Open to all departments.',
    date: new Date('2025-03-15'),
    time: '09:00 AM',
    venue: 'Main Auditorium',
    category: 'Technical',
    maxParticipants: 200,
    createdBy: admin._id,
  });

  const event2 = await Event.create({
    title: 'Cultural Night 2025',
    description:
      'Celebrate diversity and talent at our Annual Cultural Night. Music, dance, drama, and art performances by students from all departments. Don\'t miss the spectacular show!',
    date: new Date('2025-03-22'),
    time: '06:00 PM',
    venue: 'Open Air Theatre',
    category: 'Cultural',
    maxParticipants: 500,
    createdBy: admin._id,
  });

  const event3 = await Event.create({
    title: 'Workshop on AI & Machine Learning',
    description:
      'A hands-on workshop covering the fundamentals of Artificial Intelligence and Machine Learning. Participants will work on real projects with guidance from expert faculty.',
    date: new Date('2025-04-05'),
    time: '10:00 AM',
    venue: 'Computer Lab Block A',
    category: 'Workshop',
    maxParticipants: 50,
    createdBy: admin._id,
  });

  console.log('📅 Created events');

  // Register student for event1
  await Registration.create({
    userId: student._id,
    eventId: event1._id,
    status: 'confirmed',
  });

  console.log('📝 Created registrations');

  console.log('\n✅ Seed data inserted successfully!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔐 Login Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👨‍💼 ADMIN:');
  console.log('   Email:    admin@college.edu');
  console.log('   Password: admin123');
  console.log('');
  console.log('🎓 STUDENT:');
  console.log('   Email:    student@college.edu');
  console.log('   Password: student123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  process.exit(0);
};

seedData().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
