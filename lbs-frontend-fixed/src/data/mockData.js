export const mockUsers = [
  { id: 'f1', name: 'Dr. Priya Sharma', email: 'priya@college.edu', role: 'faculty', department: 'Computer Science', phone: '+91 98765 43210' },
  { id: 'f2', name: 'Prof. Rahul Verma', email: 'rahul@college.edu', role: 'faculty', department: 'Electronics', phone: '+91 98765 43211' },
  { id: 'f3', name: 'Dr. Anita Desai', email: 'anita@college.edu', role: 'faculty', department: 'Mechanical', phone: '+91 98765 43212' },
  { id: 'f4', name: 'Prof. Karan Singh', email: 'karan@college.edu', role: 'faculty', department: 'Civil', phone: '+91 98765 43213' },
  { id: 's1', name: 'Rajesh Kumar', email: 'rajesh@college.edu', role: 'staff', department: 'Maintenance', phone: '+91 98765 43220' },
  { id: 's2', name: 'Suresh Patel', email: 'suresh@college.edu', role: 'staff', department: 'IT Support', phone: '+91 98765 43221' },
  { id: 'a1', name: 'Dr. Meena Iyer', email: 'meena@college.edu', role: 'admin', department: 'Administration', phone: '+91 98765 43200' },
];

export const mockVenues = [
  { id: 'v1', name: 'Room 101', type: 'classroom', capacity: 60, building: 'Main Block', floor: 1, equipment: ['Projector', 'Whiteboard', 'AC', 'Sound System'], status: 'available', assignedStaff: 's1' },
  { id: 'v2', name: 'Room 102', type: 'classroom', capacity: 40, building: 'Main Block', floor: 1, equipment: ['Projector', 'Whiteboard'], status: 'available', assignedStaff: 's1' },
  { id: 'v3', name: 'CS Lab A', type: 'lab', capacity: 30, building: 'CS Block', floor: 2, equipment: ['Computers', 'Projector', 'LAN', 'AC'], status: 'available', assignedStaff: 's2' },
  { id: 'v4', name: 'CS Lab B', type: 'lab', capacity: 25, building: 'CS Block', floor: 2, equipment: ['Computers', 'Projector', 'LAN'], status: 'maintenance', assignedStaff: 's2' },
  { id: 'v5', name: 'Electronics Lab', type: 'lab', capacity: 35, building: 'EC Block', floor: 1, equipment: ['Oscilloscopes', 'Multimeters', 'Projector', 'AC'], status: 'available', assignedStaff: 's1' },
  { id: 'v6', name: 'Seminar Hall', type: 'hall', capacity: 200, building: 'Main Block', floor: 0, equipment: ['Projector', 'Sound System', 'AC', 'Stage', 'Podium', 'Recording'], status: 'available', assignedStaff: 's1' },
  { id: 'v7', name: 'Mini Auditorium', type: 'hall', capacity: 120, building: 'Admin Block', floor: 1, equipment: ['Projector', 'Sound System', 'AC', 'Stage'], status: 'available', assignedStaff: 's2' },
  { id: 'v8', name: 'Room 201', type: 'classroom', capacity: 50, building: 'Main Block', floor: 2, equipment: ['Projector', 'Whiteboard', 'AC'], status: 'occupied', assignedStaff: 's1' },
];

export const mockTimeSlots = [
  { id: 'ts1', startTime: '08:00', endTime: '09:00', label: '8:00 AM - 9:00 AM' },
  { id: 'ts2', startTime: '09:00', endTime: '10:00', label: '9:00 AM - 10:00 AM' },
  { id: 'ts3', startTime: '10:00', endTime: '11:00', label: '10:00 AM - 11:00 AM' },
  { id: 'ts4', startTime: '11:00', endTime: '12:00', label: '11:00 AM - 12:00 PM' },
  { id: 'ts5', startTime: '12:00', endTime: '13:00', label: '12:00 PM - 1:00 PM' },
  { id: 'ts6', startTime: '13:00', endTime: '14:00', label: '1:00 PM - 2:00 PM' },
  { id: 'ts7', startTime: '14:00', endTime: '15:00', label: '2:00 PM - 3:00 PM' },
  { id: 'ts8', startTime: '15:00', endTime: '16:00', label: '3:00 PM - 4:00 PM' },
  { id: 'ts9', startTime: '16:00', endTime: '17:00', label: '4:00 PM - 5:00 PM' },
];

export const mockBookings = [
  { id: 'b1', venueId: 'v1', venueName: 'Room 101', facultyId: 'f1', facultyName: 'Dr. Priya Sharma', date: '2026-03-10', timeSlotId: 'ts2', timeSlotLabel: '9:00 AM - 10:00 AM', purpose: 'Data Structures Seminar', status: 'approved', createdAt: '2026-03-07T10:00:00Z', equipmentNeeded: ['Projector', 'Whiteboard'] },
  { id: 'b2', venueId: 'v6', venueName: 'Seminar Hall', facultyId: 'f2', facultyName: 'Prof. Rahul Verma', date: '2026-03-11', timeSlotId: 'ts3', timeSlotLabel: '10:00 AM - 11:00 AM', purpose: 'Guest Lecture on IoT', status: 'pending', createdAt: '2026-03-07T11:00:00Z', equipmentNeeded: ['Projector', 'Sound System', 'Recording'] },
  { id: 'b3', venueId: 'v3', venueName: 'CS Lab A', facultyId: 'f1', facultyName: 'Dr. Priya Sharma', date: '2026-03-12', timeSlotId: 'ts7', timeSlotLabel: '2:00 PM - 3:00 PM', purpose: 'Python Workshop', status: 'approved', createdAt: '2026-03-06T09:00:00Z', equipmentNeeded: ['Computers', 'Projector'] },
  { id: 'b4', venueId: 'v1', venueName: 'Room 101', facultyId: 'f3', facultyName: 'Dr. Anita Desai', date: '2026-03-10', timeSlotId: 'ts4', timeSlotLabel: '11:00 AM - 12:00 PM', purpose: 'CAD/CAM Special Class', status: 'rejected', createdAt: '2026-03-07T14:00:00Z', notes: 'Venue under maintenance during this slot' },
  { id: 'b5', venueId: 'v7', venueName: 'Mini Auditorium', facultyId: 'f4', facultyName: 'Prof. Karan Singh', date: '2026-03-13', timeSlotId: 'ts5', timeSlotLabel: '12:00 PM - 1:00 PM', purpose: 'Civil Dept. Orientation', status: 'pending', createdAt: '2026-03-08T08:00:00Z' },
];

export const mockNotifications = [
  { id: 'n1', userId: 'f1', title: 'Booking Approved', message: 'Your booking for Room 101 on March 10 has been approved.', type: 'booking', read: false, createdAt: '2026-03-07T12:00:00Z' },
  { id: 'n2', userId: 'f1', title: 'New Compromise Request', message: 'Prof. Rahul Verma has requested to use CS Lab A on March 12.', type: 'request', read: false, createdAt: '2026-03-07T15:00:00Z' },
  { id: 'n3', userId: 'f2', title: 'Booking Pending', message: 'Your booking for Seminar Hall is awaiting admin approval.', type: 'booking', read: true, createdAt: '2026-03-07T11:30:00Z' },
  { id: 'n4', userId: 'a1', title: 'New Booking Request', message: 'Prof. Rahul Verma requests Seminar Hall for March 11.', type: 'booking', read: false, createdAt: '2026-03-07T11:00:00Z' },
  { id: 'n5', userId: 's1', title: 'Equipment Request', message: 'Dr. Priya Sharma needs projector setup in Room 101 by March 10.', type: 'equipment', read: false, createdAt: '2026-03-07T10:30:00Z' },
  { id: 'n6', userId: 'f3', title: 'Booking Rejected', message: 'Your booking for Room 101 on March 10 has been rejected.', type: 'cancellation', read: false, createdAt: '2026-03-07T16:00:00Z' },
  { id: 'n7', userId: 'a1', title: 'Timetable Updated', message: 'CS Department timetable has been modified for next week.', type: 'timetable', read: true, createdAt: '2026-03-06T09:00:00Z' },
];

export const mockCompromiseRequests = [
  { id: 'cr1', fromFacultyId: 'f2', fromFacultyName: 'Prof. Rahul Verma', toFacultyId: 'f1', toFacultyName: 'Dr. Priya Sharma', bookingId: 'b3', venueName: 'CS Lab A', date: '2026-03-12', timeSlot: '2:00 PM - 3:00 PM', reason: 'Need the lab for an IoT practical session urgently.', status: 'pending', createdAt: '2026-03-07T15:00:00Z' },
];

export const mockEquipmentRequests = [
  { id: 'er1', facultyId: 'f1', facultyName: 'Dr. Priya Sharma', venueId: 'v1', venueName: 'Room 101', staffId: 's1', items: ['Projector', 'HDMI Cable', 'Whiteboard Markers'], date: '2026-03-10', timeSlot: '9:00 AM - 10:00 AM', status: 'pending', createdAt: '2026-03-07T10:30:00Z' },
  { id: 'er2', facultyId: 'f2', facultyName: 'Prof. Rahul Verma', venueId: 'v6', venueName: 'Seminar Hall', staffId: 's1', items: ['Sound System', 'Recording Setup', 'Podium Mic'], date: '2026-03-11', timeSlot: '10:00 AM - 11:00 AM', status: 'acknowledged', notes: 'Will set up 30 mins before', createdAt: '2026-03-07T11:15:00Z' },
];
