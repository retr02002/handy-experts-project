export interface User {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "vendor" | "technician" | "customer";
  status: "active" | "inactive" | "pending";
  joinedDate: string;
  avatarUrl?: string;
}

export interface ServiceCall {
  id: string;
  customerName: string;
  serviceType: string;
  date: string;
  time: string;
  status: "pending" | "assigned" | "in_progress" | "completed" | "cancelled";
  technicianName?: string;
  vendorName?: string;
  amount: number;
  location: string;
}

export interface Vendor {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  status: "active" | "inactive" | "pending";
  joinedDate: string;
  rating: number;
  completedJobs: number;
}

export interface Technician {
  id: string;
  name: string;
  skills: string[];
  vendorId?: string;
  vendorName?: string;
  status: "available" | "on_job" | "offline";
  rating: number;
  completedJobs: number;
}

export const mockServiceCalls: ServiceCall[] = [
  {
    id: "SRV-1001",
    customerName: "Alice Smith",
    serviceType: "Plumbing Inspection",
    date: "2023-11-20",
    time: "10:00 AM",
    status: "completed",
    technicianName: "John Doe",
    vendorName: "FixIt Plumbing Inc.",
    amount: 150.00,
    location: "123 Main St, New York, NY",
  },
  {
    id: "SRV-1002",
    customerName: "Bob Johnson",
    serviceType: "Electrical Wiring",
    date: "2023-11-21",
    time: "02:30 PM",
    status: "in_progress",
    technicianName: "Mike Smith",
    vendorName: "ElectroTech",
    amount: 320.50,
    location: "456 Oak Ave, Brooklyn, NY",
  },
  {
    id: "SRV-1003",
    customerName: "Charlie Brown",
    serviceType: "AC Repair",
    date: "2023-11-22",
    time: "09:00 AM",
    status: "assigned",
    technicianName: "Sarah Connor",
    vendorName: "CoolBreeze HVAC",
    amount: 210.00,
    location: "789 Pine Rd, Queens, NY",
  },
  {
    id: "SRV-1004",
    customerName: "Diana Prince",
    serviceType: "Home Cleaning",
    date: "2023-11-23",
    time: "01:00 PM",
    status: "pending",
    amount: 85.00,
    location: "101 Maple Dr, Bronx, NY",
  },
  {
    id: "SRV-1005",
    customerName: "Evan Wright",
    serviceType: "Carpentry - Door Fix",
    date: "2023-11-19",
    time: "11:15 AM",
    status: "cancelled",
    amount: 120.00,
    location: "202 Birch Ln, Staten Island, NY",
  },
  {
    id: "SRV-1006",
    customerName: "Fiona Gallagher",
    serviceType: "Pest Control",
    date: "2023-11-24",
    time: "04:00 PM",
    status: "assigned",
    technicianName: "Leo Valdez",
    vendorName: "BugBusters",
    amount: 195.00,
    location: "303 Cedar Ct, New York, NY",
  },
  {
    id: "SRV-1007",
    customerName: "George Miller",
    serviceType: "Painting (1 Room)",
    date: "2023-11-25",
    time: "08:30 AM",
    status: "pending",
    amount: 450.00,
    location: "404 Elm St, Brooklyn, NY",
  },
];

export const mockVendors: Vendor[] = [
  {
    id: "VND-001",
    companyName: "FixIt Plumbing Inc.",
    contactPerson: "Robert Fixer",
    email: "contact@fixit.com",
    phone: "+1 (555) 123-4567",
    status: "active",
    joinedDate: "2022-01-15",
    rating: 4.8,
    completedJobs: 1240,
  },
  {
    id: "VND-002",
    companyName: "ElectroTech",
    contactPerson: "Jane Spark",
    email: "hello@electrotech.net",
    phone: "+1 (555) 987-6543",
    status: "active",
    joinedDate: "2022-03-22",
    rating: 4.6,
    completedJobs: 890,
  },
  {
    id: "VND-003",
    companyName: "CoolBreeze HVAC",
    contactPerson: "Tom Chiller",
    email: "support@coolbreeze.com",
    phone: "+1 (555) 456-7890",
    status: "pending",
    joinedDate: "2023-10-05",
    rating: 0,
    completedJobs: 0,
  },
  {
    id: "VND-004",
    companyName: "BugBusters",
    contactPerson: "Billy Exterminator",
    email: "bugs@bugbusters.com",
    phone: "+1 (555) 321-0987",
    status: "inactive",
    joinedDate: "2021-11-10",
    rating: 4.2,
    completedJobs: 450,
  }
];

export const mockTechnicians: Technician[] = [
  {
    id: "TECH-001",
    name: "John Doe",
    skills: ["Plumbing", "Pipe Fitting"],
    vendorId: "VND-001",
    vendorName: "FixIt Plumbing Inc.",
    status: "offline",
    rating: 4.9,
    completedJobs: 430,
  },
  {
    id: "TECH-002",
    name: "Mike Smith",
    skills: ["Electrical", "Smart Home"],
    vendorId: "VND-002",
    vendorName: "ElectroTech",
    status: "on_job",
    rating: 4.7,
    completedJobs: 310,
  },
  {
    id: "TECH-003",
    name: "Sarah Connor",
    skills: ["HVAC", "AC Repair"],
    vendorId: "VND-003",
    vendorName: "CoolBreeze HVAC",
    status: "available",
    rating: 4.8,
    completedJobs: 215,
  },
  {
    id: "TECH-004",
    name: "Leo Valdez",
    skills: ["Pest Control"],
    vendorId: "VND-004",
    vendorName: "BugBusters",
    status: "available",
    rating: 4.5,
    completedJobs: 180,
  },
  {
    id: "TECH-005",
    name: "Independent Dan",
    skills: ["Carpentry", "Handyman"],
    status: "available",
    rating: 4.6,
    completedJobs: 89,
  }
];

// Admin Mock Data
export const mockSystemHealth = [
  { service: "API Gateway", status: "operational", uptime: "99.99%", latency: "45ms" },
  { service: "Database Cluster", status: "operational", uptime: "99.95%", latency: "12ms" },
  { service: "Payment Processor", status: "degraded", uptime: "98.50%", latency: "250ms" },
  { service: "Notification Service", status: "operational", uptime: "99.90%", latency: "30ms" },
];

export const mockPlatformStats = {
  totalRevenue: 125000,
  activeUsers: 8430,
  completedJobs: 15420,
  vendorCount: 142
};

export const mockNotifications = [
  { id: 1, title: "New Vendor Registration", message: "FixIt Plumbing Inc. has requested approval.", time: "10 mins ago", unread: true },
  { id: 2, title: "System Alert", message: "Payment processor experiencing high latency.", time: "1 hour ago", unread: true },
  { id: 3, title: "Payout Processed", message: "Weekly vendor payouts completed successfully.", time: "3 hours ago", unread: false },
];

export const mockBills = [
  { id: "INV-001", vendor: "FixIt Plumbing", amount: 1500, date: "2023-11-20", status: "paid" },
  { id: "INV-002", vendor: "ElectroTech", amount: 3200, date: "2023-11-21", status: "pending" },
  { id: "INV-003", vendor: "CoolBreeze HVAC", amount: 850, date: "2023-11-22", status: "overdue" },
];

export const mockReviews = [
  { id: "REV-1", customer: "Alice Smith", rating: 5, comment: "Excellent service, very professional.", date: "2023-11-20", vendor: "FixIt Plumbing" },
  { id: "REV-2", customer: "Bob Johnson", rating: 4, comment: "Good job, but arrived a bit late.", date: "2023-11-19", vendor: "ElectroTech" },
  { id: "REV-3", customer: "Charlie Brown", rating: 5, comment: "Fixed my AC perfectly!", date: "2023-11-18", vendor: "CoolBreeze HVAC" },
];

// Technician Mock Data
export const mockRouteStops = [
  { id: "STOP-1", time: "09:00 AM", location: "123 Main St, New York, NY", status: "completed", customer: "Alice Smith", task: "Plumbing Inspection" },
  { id: "STOP-2", time: "11:30 AM", location: "456 Oak Ave, Brooklyn, NY", status: "in_progress", customer: "Bob Johnson", task: "Pipe Repair" },
  { id: "STOP-3", time: "02:00 PM", location: "789 Pine Rd, Queens, NY", status: "pending", customer: "Charlie Brown", task: "Water Heater Setup" },
];

export const mockEarnings = {
  today: 150,
  thisWeek: 850,
  thisMonth: 3200,
  balance: 450
};

// Customer Mock Data
export const mockCustomerOrders = [
  { id: "ORD-1", service: "Plumbing Inspection", date: "2023-11-20", status: "completed", amount: 150, technician: "John Doe" },
  { id: "ORD-2", service: "AC Maintenance", date: "2023-10-15", status: "completed", amount: 85, technician: "Sarah Connor" },
  { id: "ORD-3", service: "Electrical Wiring", date: "2023-11-25", status: "scheduled", amount: 320, technician: "Mike Smith" },
];

export const mockCustomerRewards = {
  points: 1250,
  tier: "Gold",
  nextTierPoints: 2000,
  availableRewards: [
    { id: 1, title: "₹10 Off Next Service", cost: 500 },
    { id: 2, title: "Free Priority Booking", cost: 1000 },
  ]
};

export interface AvailableService {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  duration: string;
  icon: string;
}

export interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  services: string[]; // array of service IDs included
  discountPercentage: number;
}

export const mockAvailableServices: AvailableService[] = [
  { id: "s1", name: "Basic Plumbing Fix", description: "Fix minor leaks and clogs", price: 80, category: "Plumbing", duration: "1 hr", icon: "ph:drop" },
  { id: "s2", name: "Deep Home Cleaning", description: "Comprehensive cleaning of all rooms", price: 150, category: "Cleaning", duration: "3 hrs", icon: "ph:broom" },
  { id: "s3", name: "AC Maintenance", description: "Filter change and performance check", price: 120, category: "HVAC", duration: "1.5 hrs", icon: "ph:thermometer-cold" },
  { id: "s4", name: "Electrical Inspection", description: "Check wiring and panels for safety", price: 90, category: "Electrical", duration: "1 hr", icon: "ph:lightning" },
  { id: "s5", name: "Pest Control Assessment", description: "Identify and plan treatment for pests", price: 60, category: "Pest Control", duration: "1 hr", icon: "ph:bug" },
  { id: "s6", name: "Furniture Assembly", description: "Assemble flat-pack furniture", price: 70, category: "Handyman", duration: "2 hrs", icon: "ph:chair" },
];

export const mockPackages: Package[] = [
  { id: "p1", name: "Home Maintenance Starter", description: "Basic plumbing, electrical, and AC check", price: 250, services: ["s1", "s3", "s4"], discountPercentage: 15 },
  { id: "p2", name: "Move-In Special", description: "Deep cleaning and pest assessment", price: 180, services: ["s2", "s5"], discountPercentage: 10 },
  { id: "p3", name: "The Works", description: "Comprehensive coverage of all basic services", price: 400, services: ["s1", "s2", "s3", "s4", "s5"], discountPercentage: 20 },
];
