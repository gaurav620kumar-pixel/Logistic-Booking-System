require('dotenv').config();
const mongoose         = require('mongoose');
const bcrypt           = require('bcryptjs');
const User             = require('./src/models/User');
const Venue            = require('./src/models/Venue');
const Booking          = require('./src/models/Booking');
const Notification     = require('./src/models/Notification');
const EquipmentRequest = require('./src/models/EquipmentRequest');
const CompromiseRequest = require('./src/models/CompromiseRequest');
const TimeSlot         = require('./src/models/TimeSlot');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/Logistics_booking_system';

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Clear all collections
  await Promise.all([
    User.deleteMany({}), Venue.deleteMany({}), Booking.deleteMany({}),
    Notification.deleteMany({}), EquipmentRequest.deleteMany({}),
    CompromiseRequest.deleteMany({}), TimeSlot.deleteMany({}),
  ]);
  console.log('🗑️  Cleared existing data');

  const pwd = bcrypt.hashSync('college@123', 10);

  await User.insertMany([
    { id: 'f1', name: 'Dr. Priya Sharma',  email: 'priya@college.edu',  password: pwd, role: 'faculty', department: 'Computer Science', phone: '+91 98765 43210' },
    { id: 'f2', name: 'Prof. Rahul Verma', email: 'rahul@college.edu',  password: pwd, role: 'faculty', department: 'Electronics',      phone: '+91 98765 43211' },
    { id: 'f3', name: 'Dr. Anita Desai',   email: 'anita@college.edu',  password: pwd, role: 'faculty', department: 'Mechanical',       phone: '+91 98765 43212' },
    { id: 'f4', name: 'Prof. Karan Singh', email: 'karan@college.edu',  password: pwd, role: 'faculty', department: 'Civil',            phone: '+91 98765 43213' },
    { id: 's1', name: 'Rajesh Kumar',      email: 'rajesh@college.edu', password: pwd, role: 'staff',   department: 'Maintenance',      phone: '+91 98765 43220' },
    { id: 's2', name: 'Suresh Patel',      email: 'suresh@college.edu', password: pwd, role: 'staff',   department: 'IT Support',       phone: '+91 98765 43221' },
    { id: 'a1', name: 'Dr. Meena Iyer',    email: 'meena@college.edu',  password: pwd, role: 'admin',   department: 'Administration',   phone: '+91 98765 43200' },
  ]);

  await Venue.insertMany([
    { id: 'v1', name: 'Room 101',        type: 'classroom', capacity: 60,  building: 'Main Block',  floor: 1, equipment: ['Projector','Whiteboard','AC','Sound System'], status: 'available',   assignedStaff: 's1' },
    { id: 'v2', name: 'Room 102',        type: 'classroom', capacity: 40,  building: 'Main Block',  floor: 1, equipment: ['Projector','Whiteboard'],                    status: 'available',   assignedStaff: 's1' },
    { id: 'v3', name: 'CS Lab A',        type: 'lab',       capacity: 30,  building: 'CS Block',    floor: 2, equipment: ['Computers','Projector','LAN','AC'],           status: 'available',   assignedStaff: 's2' },
    { id: 'v4', name: 'CS Lab B',        type: 'lab',       capacity: 25,  building: 'CS Block',    floor: 2, equipment: ['Computers','Projector','LAN'],               status: 'maintenance', assignedStaff: 's2' },
    { id: 'v5', name: 'Electronics Lab', type: 'lab',       capacity: 35,  building: 'EC Block',    floor: 1, equipment: ['Oscilloscopes','Multimeters','Projector','AC'],status: 'available',  assignedStaff: 's1' },
    { id: 'v6', name: 'Seminar Hall',    type: 'hall',      capacity: 200, building: 'Main Block',  floor: 0, equipment: ['Projector','Sound System','AC','Stage','Podium','Recording'], status: 'available', assignedStaff: 's1' },
    { id: 'v7', name: 'Mini Auditorium', type: 'hall',      capacity: 120, building: 'Admin Block', floor: 1, equipment: ['Projector','Sound System','AC','Stage'],      status: 'available',   assignedStaff: 's2' },
    { id: 'v8', name: 'Room 201',        type: 'classroom', capacity: 50,  building: 'Main Block',  floor: 2, equipment: ['Projector','Whiteboard','AC'],               status: 'available',   assignedStaff: 's1' },
  ]);

  await TimeSlot.insertMany([
    { id: 'ts1', startTime: '08:00', endTime: '09:00', label: '8:00 AM - 9:00 AM'   },
    { id: 'ts2', startTime: '09:00', endTime: '10:00', label: '9:00 AM - 10:00 AM'  },
    { id: 'ts3', startTime: '10:00', endTime: '11:00', label: '10:00 AM - 11:00 AM' },
    { id: 'ts4', startTime: '11:00', endTime: '12:00', label: '11:00 AM - 12:00 PM' },
    { id: 'ts5', startTime: '12:00', endTime: '13:00', label: '12:00 PM - 1:00 PM'  },
    { id: 'ts6', startTime: '13:00', endTime: '14:00', label: '1:00 PM - 2:00 PM'   },
    { id: 'ts7', startTime: '14:00', endTime: '15:00', label: '2:00 PM - 3:00 PM'   },
    { id: 'ts8', startTime: '15:00', endTime: '16:00', label: '3:00 PM - 4:00 PM'   },
    { id: 'ts9', startTime: '16:00', endTime: '17:00', label: '4:00 PM - 5:00 PM'   },
  ]);

  await Booking.insertMany([
    { id: 'b1', venueId: 'v1', venueName: 'Room 101',        facultyId: 'f1', facultyName: 'Dr. Priya Sharma',  date: '2026-04-21', timeSlotId: 'ts2', timeSlotLabel: '9:00 AM - 10:00 AM',  purpose: 'Data Structures Seminar',  status: 'confirmed', notes: '', equipmentNeeded: ['Projector','Whiteboard'], createdAt: '2026-04-18T10:00:00Z' },
    { id: 'b2', venueId: 'v6', venueName: 'Seminar Hall',    facultyId: 'f2', facultyName: 'Prof. Rahul Verma', date: '2026-04-22', timeSlotId: 'ts3', timeSlotLabel: '10:00 AM - 11:00 AM', purpose: 'Guest Lecture on IoT',     status: 'confirmed', notes: '', equipmentNeeded: ['Projector','Sound System'], createdAt: '2026-04-18T11:00:00Z' },
    { id: 'b3', venueId: 'v3', venueName: 'CS Lab A',        facultyId: 'f1', facultyName: 'Dr. Priya Sharma',  date: '2026-04-23', timeSlotId: 'ts7', timeSlotLabel: '2:00 PM - 3:00 PM',   purpose: 'Python Workshop',          status: 'confirmed', notes: '', equipmentNeeded: ['Computers','Projector'], createdAt: '2026-04-17T09:00:00Z' },
    { id: 'b4', venueId: 'v7', venueName: 'Mini Auditorium', facultyId: 'f4', facultyName: 'Prof. Karan Singh',  date: '2026-04-24', timeSlotId: 'ts5', timeSlotLabel: '12:00 PM - 1:00 PM',  purpose: 'Civil Dept. Orientation', status: 'confirmed', notes: '', equipmentNeeded: [], createdAt: '2026-04-18T08:00:00Z' },
  ]);

  await Notification.insertMany([
    { id: 'n1', userId: 'f1', title: 'Booking Confirmed',     message: 'Your booking for Room 101 on Apr 21 is confirmed.',          type: 'booking',   read: false, createdAt: '2026-04-18T12:00:00Z' },
    { id: 'n2', userId: 'f2', title: 'Booking Confirmed',     message: 'Your booking for Seminar Hall on Apr 22 is confirmed.',      type: 'booking',   read: false, createdAt: '2026-04-18T11:30:00Z' },
    { id: 'n3', userId: 'a1', title: 'New Booking',           message: 'Dr. Priya Sharma booked Room 101 for Apr 21.',              type: 'booking',   read: false, createdAt: '2026-04-18T10:00:00Z' },
    { id: 'n4', userId: 's1', title: 'Equipment Request',     message: 'Dr. Priya Sharma needs projector setup in Room 101.',       type: 'equipment', read: false, createdAt: '2026-04-18T10:30:00Z' },
  ]);

  await EquipmentRequest.insertMany([
    { id: 'er1', facultyId: 'f1', facultyName: 'Dr. Priya Sharma', venueId: 'v1', venueName: 'Room 101', staffId: 's1', items: ['Projector','HDMI Cable','Whiteboard Markers'], date: '2026-04-21', timeSlot: '9:00 AM - 10:00 AM', status: 'pending', notes: '', createdAt: '2026-04-18T10:30:00Z' },
  ]);

  await CompromiseRequest.insertMany([
    { id: 'cr1', fromFacultyId: 'f2', fromFacultyName: 'Prof. Rahul Verma', toFacultyId: 'f1', toFacultyName: 'Dr. Priya Sharma', bookingId: 'b3', venueId: 'v3', venueName: 'CS Lab A', date: '2026-04-23', timeSlot: '2:00 PM - 3:00 PM', timeSlotId: 'ts7', reason: 'Need the lab for an IoT practical session urgently.', status: 'pending', createdAt: '2026-04-18T15:00:00Z' },
  ]);

  console.log('✅ Seed complete!');
  console.log('\n📋 Login credentials (all use password: college@123)');
  console.log('   Admin:   meena@college.edu');
  console.log('   Faculty: priya@college.edu  |  rahul@college.edu');
  console.log('   Staff:   rajesh@college.edu\n');
  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
