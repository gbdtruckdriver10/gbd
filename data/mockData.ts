export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  method: 'Credit Card' | 'Cash' | 'Check' | 'Bank Transfer' | 'Stripe';
  notes?: string;
  recordedBy: string;
  stripePaymentIntentId?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  parentId: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  childId: string;
  childName: string;
  issueDate: string;
  dueDate: string;
  status: 'Paid' | 'Unpaid' | 'Overdue' | 'Partial';
  lineItems: InvoiceLineItem[];
  subtotal: number;
  discountPercent?: number;
  discountAmount?: number;
  lateFee?: number;
  total: number;
  amountPaid: number;
  balance: number;
  payments: PaymentRecord[];
  notes?: string;
  paymentPlan?: {
    frequency: 'Weekly' | 'Biweekly' | 'Monthly';
    installments: number;
    installmentAmount: number;
  };
  remindersSent: {
    type: 'Initial' | '7DayBefore' | 'DueDate' | '7DayAfter' | 'FinalNotice';
    date: string;
  }[];
}

export const mockInvoices: Invoice[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'GBD-2026-001',
    parentId: 'parent-1',
    parentName: 'Sarah Johnson',
    parentEmail: 'sarah.johnson@email.com',
    parentPhone: '(555) 123-4567',
    childId: 'child-1',
    childName: 'Emma Johnson',
    issueDate: '2026-03-01',
    dueDate: '2026-03-15',
    status: 'Paid',
    lineItems: [
      { id: 'li-1', description: 'Preschool Tuition - March', quantity: 1, unitPrice: 1000, total: 1000 },
      { id: 'li-2', description: 'Basketball Program', quantity: 1, unitPrice: 150, total: 150 },
      { id: 'li-3', description: 'Field Trip Fee', quantity: 1, unitPrice: 25, total: 25 }
    ],
    subtotal: 1175,
    discountPercent: 10,
    discountAmount: 117.50,
    total: 1057.50,
    amountPaid: 1057.50,
    balance: 0,
    payments: [
      {
        id: 'pay-1',
        date: '2026-03-10',
        amount: 1057.50,
        method: 'Credit Card',
        notes: 'Paid in full via Stripe',
        recordedBy: 'System',
        stripePaymentIntentId: 'pi_test_123456'
      }
    ],
    notes: 'Sibling discount applied (10%)',
    remindersSent: [
      { type: '7DayBefore', date: '2026-03-08' }
    ]
  },
  {
    id: 'inv-2',
    invoiceNumber: 'GBD-2026-002',
    parentId: 'parent-2',
    parentName: 'Maria Martinez',
    parentEmail: 'maria.martinez@email.com',
    parentPhone: '(555) 234-5678',
    childId: 'child-3',
    childName: 'Sophia Martinez',
    issueDate: '2026-03-01',
    dueDate: '2026-03-20',
    status: 'Partial',
    lineItems: [
      { id: 'li-4', description: 'Toddler Care - March', quantity: 1, unitPrice: 950, total: 950 },
      { id: 'li-5', description: 'Lunch Program', quantity: 1, unitPrice: 100, total: 100 }
    ],
    subtotal: 1050,
    total: 1050,
    amountPaid: 500,
    balance: 550,
    payments: [
      {
        id: 'pay-2',
        date: '2026-03-15',
        amount: 500,
        method: 'Check',
        notes: 'First installment - payment plan',
        recordedBy: 'Patricia Martinez'
      }
    ],
    paymentPlan: {
      frequency: 'Biweekly',
      installments: 2,
      installmentAmount: 525
    },
    remindersSent: [
      { type: '7DayBefore', date: '2026-03-13' }
    ]
  },
  {
    id: 'inv-3',
    invoiceNumber: 'GBD-2026-003',
    parentId: 'parent-3',
    parentName: 'Wei Chen',
    parentEmail: 'wei.chen@email.com',
    parentPhone: '(555) 345-6789',
    childId: 'child-4',
    childName: 'Liam Chen',
    issueDate: '2026-02-01',
    dueDate: '2026-02-28',
    status: 'Overdue',
    lineItems: [
      { id: 'li-6', description: 'Infant Care - February', quantity: 1, unitPrice: 1200, total: 1200 }
    ],
    subtotal: 1200,
    lateFee: 50,
    total: 1250,
    amountPaid: 0,
    balance: 1250,
    payments: [],
    notes: 'Late fee added after 14 days overdue',
    remindersSent: [
      { type: '7DayBefore', date: '2026-02-21' },
      { type: 'DueDate', date: '2026-02-28' },
      { type: '7DayAfter', date: '2026-03-07' },
      { type: 'FinalNotice', date: '2026-03-15' }
    ]
  },
  {
    id: 'inv-4',
    invoiceNumber: 'GBD-2026-004',
    parentId: 'parent-4',
    parentName: 'James Wilson',
    parentEmail: 'james.wilson@email.com',
    parentPhone: '(555) 456-7890',
    childId: 'child-5',
    childName: 'Olivia Wilson',
    issueDate: '2026-03-01',
    dueDate: '2026-03-30',
    status: 'Unpaid',
    lineItems: [
      { id: 'li-7', description: 'Pre-K Tuition - March', quantity: 1, unitPrice: 900, total: 900 },
      { id: 'li-8', description: 'Tutoring Program', quantity: 4, unitPrice: 40, total: 160 },
      { id: 'li-9', description: 'Art Supplies Fee', quantity: 1, unitPrice: 15, total: 15 }
    ],
    subtotal: 1075,
    discountAmount: 75,
    total: 1000,
    amountPaid: 0,
    balance: 1000,
    payments: [],
    notes: 'New family discount applied',
    remindersSent: []
  },
  {
    id: 'inv-5',
    invoiceNumber: 'GBD-2026-005',
    parentId: 'parent-5',
    parentName: 'Amanda Rodriguez',
    parentEmail: 'amanda.rodriguez@email.com',
    parentPhone: '(555) 567-8901',
    childId: 'child-6',
    childName: 'Noah Rodriguez',
    issueDate: '2026-03-01',
    dueDate: '2026-03-10',
    status: 'Overdue',
    lineItems: [
      { id: 'li-10', description: 'Childcare - March', quantity: 1, unitPrice: 1100, total: 1100 },
      { id: 'li-11', description: 'Late Pickup Fee (Feb)', quantity: 3, unitPrice: 25, total: 75 }
    ],
    subtotal: 1175,
    lateFee: 25,
    total: 1200,
    amountPaid: 0,
    balance: 1200,
    payments: [],
    notes: 'Late fees from previous month included',
    remindersSent: [
      { type: '7DayBefore', date: '2026-03-03' },
      { type: 'DueDate', date: '2026-03-10' },
      { type: '7DayAfter', date: '2026-03-17' }
    ]
  }
];

export const mockChildren = [
  {
    id: 'child-1',
    firstName: 'Emma',
    lastName: 'Johnson',
    dateOfBirth: '2020-03-15',
    age: 5,
    classroom: 'Preschool A',
    image: '/children/emma.png',
    allergies: ['Peanuts', 'Tree nuts'],
    emergencyContacts: [
      { name: 'Sarah Johnson', relationship: 'Mother', phone: '(555) 123-4567' },
      { name: 'John Johnson', relationship: 'Father', phone: '(555) 123-4568' }
    ],
    authorizedPickup: ['Sarah Johnson', 'John Johnson', 'Margaret Smith'],
    programs: ['Basketball', 'Childcare']
  },
  {
    id: 'child-2',
    firstName: 'Noah',
    lastName: 'Johnson',
    dateOfBirth: '2021-08-22',
    age: 3,
    classroom: 'Toddler B',
    image: '/children/noah.png',
    allergies: [],
    emergencyContacts: [
      { name: 'Sarah Johnson', relationship: 'Mother', phone: '(555) 123-4567' },
      { name: 'John Johnson', relationship: 'Father', phone: '(555) 123-4568' }
    ],
    authorizedPickup: ['Sarah Johnson', 'John Johnson', 'Margaret Smith'],
    programs: ['Childcare']
  }
];

export const mockAttendance = [
  {
    id: 'att-1',
    childId: 'child-1',
    date: '2026-03-09',
    checkIn: '8:30 AM',
    checkOut: '4:45 PM',
    checkedInBy: 'Emily Davis',
    checkedOutBy: 'Sarah Johnson',
    meals: { breakfast: true, lunch: true, snack: true },
    nap: { start: '1:00 PM', end: '2:30 PM' },
    notes: 'Emma had a great day! Enjoyed painting and outdoor play.',
    mood: 'happy'
  }
];

export const mockApplications = [
  {
    id: 'app-1',
    childName: 'Sophia Martinez',
    parentName: 'Maria Martinez',
    email: 'maria.martinez@email.com',
    phone: '(555) 234-5678',
    status: 'More Info Needed',
    submittedDate: '2026-02-28',
    program: 'Preschool',
    desiredStartDate: '2026-04-01',
    tourScheduled: true,
    tourDate: '2026-03-15'
  },
  {
    id: 'app-2',
    childName: 'Liam Chen',
    parentName: 'Wei Chen',
    email: 'wei.chen@email.com',
    phone: '(555) 345-6789',
    status: 'Waitlist',
    submittedDate: '2026-03-01',
    program: 'Toddler',
    desiredStartDate: '2026-05-01',
    tourScheduled: true,
    tourDate: '2026-03-12'
  },
  {
    id: 'app-3',
    childName: 'Olivia Brown',
    parentName: 'Jessica Brown',
    email: 'jessica.brown@email.com',
    phone: '(555) 456-7890',
    status: 'Submitted',
    submittedDate: '2026-03-05',
    program: 'Infant',
    desiredStartDate: '2026-06-01',
    tourScheduled: false
  }
];

export const mockPrograms = [
  {
    id: 'prog-1',
    name: 'Basketball',
    description: 'Fun basketball skills and drills for ages 4-8',
    ageRange: '4-8 years',
    schedule: 'Tuesdays & Thursdays, 3:30-4:30 PM',
    capacity: 15,
    enrolled: 12,
    cost: '$120/month',
    instructor: 'Coach Marcus',
    image: "/programs/basketball.png"
  },
  {
    id: 'prog-2',
    name: 'Tutoring',
    description: 'One-on-one academic support for reading and math',
    ageRange: '5-10 years',
    schedule: 'Flexible scheduling',
    capacity: 10,
    enrolled: 8,
    cost: '$50/session',
    instructor: 'Ms. Patricia',
    image: "/programs/tutoring.png"
  },
  {
    id: 'prog-3',
    name: 'Childcare',
    description: 'Full-time care with structured learning activities',
    ageRange: '6 months - 5 years',
    schedule: 'Monday-Friday, 7:00 AM - 6:00 PM',
    capacity: 60,
    enrolled: 52,
    cost: '$1,200/month',
    instructor: 'Multiple staff',
    image: "/programs/childcare.png"
  },
  {
    id: 'prog-4',
    name: 'Summer Camp',
    description: 'Exciting summer adventures with field trips and activities',
    ageRange: '5-12 years',
    schedule: 'June-August, 8:00 AM - 5:00 PM',
    capacity: 30,
    enrolled: 18,
    cost: '$300/week',
    instructor: 'Camp Team',
    image: "/programs/summercamp.png"
  }
];

export const mockAnnouncements: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Spring Break Closure',
    content: 'GBD will be closed March 20-24 for Spring Break. We will resume normal operations on Monday, March 27.',
    date: '2026-03-01',
    audience: 'all',
    priority: 'high',
    author: 'Michael Chen'
  },
  {
    id: 'ann-2',
    title: 'New Basketball Session Starting',
    content: 'Our spring basketball program begins next week! Contact the office if your child would like to join.',
    date: '2026-03-05',
    audience: 'parents',
    priority: 'normal',
    author: 'Emily Davis'
  },
  {
    id: 'ann-3',
    title: 'Staff Training Day',
    content: 'Reminder: All staff members are required to attend the professional development training on March 15.',
    date: '2026-03-08',
    audience: 'staff',
    priority: 'high',
    author: 'Michael Chen'
  }
];

export type Announcement = {
  id: string;
  title: string;
  content: string;
  date: string;
  audience: "all" | "parents" | "staff";
  priority: "normal" | "high";
  author: string;
};

export type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  time: string;
  category: "activity" | "special" | "notice" | "closure";
  description?: string;
};

export const mockCalendarEvents: CalendarEvent[] = [
  {
    id: "evt-1",
    title: "Parent-Teacher Conferences",
    date: "2026-03-15",
    time: "4:00–7:00 PM",
    category: "activity",
    description: "Meet with your child’s teacher to review progress and goals.",
  },
  {
    id: "evt-2",
    title: "Spring Break - Center Closed",
    date: "2026-03-20",
    endDate: "2026-03-24",
    time: "All Day",
    category: "closure",
    description: "GBD will be closed for Spring Break.",
  },
  {
    id: "evt-3",
    title: "Easter Egg Hunt",
    date: "2026-04-05",
    time: "10:00 AM",
    category: "special",
    description: "Family event with games and egg hunt activities.",
  },
  {
    id: "evt-4",
    title: "Staff PD Day",
    date: "2026-04-10",
    time: "12:00 PM",
    category: "notice",
    description: "Early close for staff professional development.",
  },
  {
    id: "evt-5",
    title: "Earth Day Activities",
    date: "2026-04-22",
    time: "2:00 PM",
    category: "activity",
    description: "Classroom and outdoor Earth Day activities.",
  },
  {
    id: "evt-6",
    title: "Mother’s Day Tea",
    date: "2026-05-10",
    time: "11:00 AM",
    category: "special",
    description: "A family celebration for Mother’s Day.",
  },
  {
    id: "evt-7",
    title: "Field Trip",
    date: "2026-05-15",
    time: "9:30 AM",
    category: "activity",
    description: "Off-site learning trip for enrolled children.",
  },
  {
    id: "evt-8",
    title: "Memorial Day - Closed",
    date: "2026-05-25",
    time: "All Day",
    category: "closure",
    description: "Center closed in observance of Memorial Day.",
  },
  {
    id: "evt-9",
    title: "Summer Camp Begins",
    date: "2026-06-01",
    time: "8:00 AM",
    category: "special",
    description: "First day of summer camp programming.",
  },
  {
    id: "evt-10",
    title: "Water Play Day",
    date: "2026-06-15",
    time: "10:00 AM",
    category: "activity",
    description: "Outdoor summer water activities.",
  },
];

export const mockIncidents = [
  {
    id: 'inc-1',
    childId: 'child-1',
    childName: 'Emma Johnson',
    date: '2026-03-08',
    time: '10:30 AM',
    type: 'Minor Injury',
    description: 'Small scratch on left knee from playground fall. Cleaned and bandaged.',
    reportedBy: 'Emily Davis',
    actionTaken: 'Applied first aid, notified parent',
    parentNotified: true,
    parentSignature: 'Sarah Johnson'
  }
];

export const mockStaffRoster = [
  {
    id: 'staff-1',
    name: 'Emily Davis',
    role: 'Lead Teacher',
    classroom: 'Preschool A',
    email: 'emily.davis@gbd.com',
    phone: '(555) 111-2222'
  },
  {
    id: 'staff-2',
    name: 'Marcus Thompson',
    role: 'Program Coordinator',
    classroom: 'Basketball',
    email: 'marcus.t@gbd.com',
    phone: '(555) 222-3333'
  },
  {
    id: 'staff-3',
    name: 'Patricia Wong',
    role: 'Tutor',
    classroom: 'Tutoring',
    email: 'patricia.wong@gbd.com',
    phone: '(555) 333-4444'
  }
];

export const mockClassrooms = [
  {
    id: 'class-1',
    name: 'Infant Room',
    ageRange: '6-12 months',
    capacity: 8,
    enrolled: 6,
    staff: ['Ms. Jennifer', 'Ms. Amy'],
    schedule: '7:00 AM - 6:00 PM'
  },
  {
    id: 'class-2',
    name: 'Toddler A',
    ageRange: '1-2 years',
    capacity: 12,
    enrolled: 11,
    staff: ['Ms. Rachel', 'Ms. Lisa'],
    schedule: '7:00 AM - 6:00 PM'
  },
  {
    id: 'class-3',
    name: 'Toddler B',
    ageRange: '2-3 years',
    capacity: 12,
    enrolled: 10,
    staff: ['Ms. Sandra', 'Ms. Kim'],
    schedule: '7:00 AM - 6:00 PM'
  },
  {
    id: 'class-4',
    name: 'Preschool A',
    ageRange: '3-4 years',
    capacity: 15,
    enrolled: 14,
    staff: ['Ms. Emily', 'Ms. Sarah'],
    schedule: '7:00 AM - 6:00 PM'
  },
  {
    id: 'class-5',
    name: 'Pre-K',
    ageRange: '4-5 years',
    capacity: 15,
    enrolled: 12,
    staff: ['Ms. Michelle', 'Ms. Laura'],
    schedule: '7:00 AM - 6:00 PM'
  }
];

export interface TeamMember {
  id: string;
  name: string;
  title: string;
  bio: string;
  image: string;
  facebookUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  displayOrder: number;
  isActive: boolean;
}

export const mockTeamMembers: TeamMember[] = [
  {
    id: 'team-1',
    name: 'Dr. Patricia Martinez',
    title: 'Director & Founder',
    bio: 'Dr. Martinez founded GBD in 2026 with a vision to create a nurturing learning environment where every child is valued. With over 20 years of experience in early childhood education and a Ph.D. in Child Development, she leads our team with passion and expertise.',
    image: '/teammembers/director.png',
    facebookUrl: 'https://facebook.com',
    linkedinUrl: 'https://linkedin.com',
    twitterUrl: 'https://twitter.com',
    displayOrder: 1,
    isActive: true
  },
  {
    id: 'team-2',
    name: 'Marcus Thompson',
    title: 'Assistant Director',
    bio: 'Marcus brings 10 years of childcare administration experience to GBD. His background in curriculum development and staff training ensures our programs remain innovative and engaging. Marcus is dedicated to fostering strong partnerships between families and educators.',
    image: '/teammembers/assistant-director.png',
    facebookUrl: 'https://facebook.com',
    linkedinUrl: 'https://linkedin.com',
    twitterUrl: 'https://twitter.com',
    displayOrder: 2,
    isActive: true
  }
];