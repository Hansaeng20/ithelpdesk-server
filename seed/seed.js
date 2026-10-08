const dotenv = require("dotenv");
const mongoose = require("mongoose");

const connectDB = require("../config/db");

const Department = require("../models/Department");
const Ticket = require("../models/Ticket");
const TicketComment = require("../models/TicketComment");

dotenv.config();

const departments = [
    {
        name: "Information Technology",
        code: "IT",
        description: "Technology, systems, hardware, software, and network support."
    },
    {
        name: "Human Resources",
        code: "HR",
        description: "Employee and human resource operations."
    },
    {
        name: "Finance",
        code: "FIN",
        description: "Financial and accounting operations."
    },
    {
        name: "Marketing",
        code: "MKT",
        description: "Marketing, promotions, and communications."
    },
    {
        name: "Operations",
        code: "OPS",
        description: "Store and business operations."
    }
];

const seedDatabase = async () => {
    try {
        await connectDB();

        console.log("Clearing existing seed data...");

        await TicketComment.deleteMany({});
        await Ticket.deleteMany({});
        await Department.deleteMany({});

        const createdDepartments = await Department.insertMany(departments);

        const departmentMap = {};

        createdDepartments.forEach((department) => {
            departmentMap[department.code] = department._id;
        });

        const now = new Date();

        const tickets = [
            {
                ticketNumber: "IT-000001",
                title: "Laptop cannot connect to Wi-Fi",
                description:
                    "The employee laptop cannot connect to the office Wi-Fi network.",
                requesterName: "Juan Dela Cruz",
                requesterEmail: "juan@example.com",
                department: departmentMap.OPS,
                category: "Network",
                priority: "High",
                status: "In Progress",
                assignedTo: "IT Support",
                slaHours: 8,
                dueAt: new Date(now.getTime() + 2 * 60 * 60 * 1000)
            },
            {
                ticketNumber: "IT-000002",
                title: "Printer is not responding",
                description:
                    "The department printer is powered on but does not respond to print jobs.",
                requesterName: "Maria Santos",
                requesterEmail: "maria@example.com",
                department: departmentMap.FIN,
                category: "Printer",
                priority: "Medium",
                status: "Assigned",
                assignedTo: "IT Support",
                slaHours: 24,
                dueAt: new Date(now.getTime() + 12 * 60 * 60 * 1000)
            },
            {
                ticketNumber: "IT-000003",
                title: "Cannot access company email",
                description:
                    "The employee is unable to sign in to the company email account.",
                requesterName: "Pedro Reyes",
                requesterEmail: "pedro@example.com",
                department: departmentMap.HR,
                category: "Email",
                priority: "High",
                status: "Open",
                assignedTo: "",
                slaHours: 8,
                dueAt: new Date(now.getTime() + 6 * 60 * 60 * 1000)
            },
            {
                ticketNumber: "IT-000004",
                title: "Microsoft Excel application crashes",
                description:
                    "Excel closes unexpectedly when opening larger spreadsheet files.",
                requesterName: "Ana Garcia",
                requesterEmail: "ana@example.com",
                department: departmentMap.FIN,
                category: "Software",
                priority: "Medium",
                status: "Resolved",
                assignedTo: "IT Support",
                slaHours: 24,
                dueAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
                resolvedAt: new Date(now.getTime() - 8 * 60 * 60 * 1000)
            },
            {
                ticketNumber: "IT-000005",
                title: "New employee account request",
                description:
                    "A new employee needs access to the required company systems.",
                requesterName: "Grace Lim",
                requesterEmail: "grace@example.com",
                department: departmentMap.HR,
                category: "Account Access",
                priority: "Low",
                status: "Open",
                assignedTo: "",
                slaHours: 72,
                dueAt: new Date(now.getTime() + 48 * 60 * 60 * 1000)
            },
            {
                ticketNumber: "IT-000006",
                title: "POS terminal has stopped responding",
                description:
                    "The POS terminal is frozen and cannot process transactions.",
                requesterName: "Michael Tan",
                requesterEmail: "michael@example.com",
                department: departmentMap.OPS,
                category: "Hardware",
                priority: "Critical",
                status: "In Progress",
                assignedTo: "IT Support",
                slaHours: 4,
                dueAt: new Date(now.getTime() + 1 * 60 * 60 * 1000)
            },
            {
                ticketNumber: "IT-000007",
                title: "Shared network drive unavailable",
                description:
                    "The department cannot access the shared network drive.",
                requesterName: "Lisa Cruz",
                requesterEmail: "lisa@example.com",
                department: departmentMap.MKT,
                category: "Network",
                priority: "High",
                status: "Open",
                assignedTo: "",
                slaHours: 8,
                dueAt: new Date(now.getTime() - 2 * 60 * 60 * 1000)
            },
            {
                ticketNumber: "IT-000008",
                title: "Request for new workstation",
                description:
                    "A workstation is required for a newly assigned employee.",
                requesterName: "Robert Diaz",
                requesterEmail: "robert@example.com",
                department: departmentMap.OPS,
                category: "Hardware",
                priority: "Medium",
                status: "Closed",
                assignedTo: "IT Support",
                slaHours: 24,
                dueAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
                resolvedAt: new Date(now.getTime() - 30 * 60 * 60 * 1000)
            }
        ];

        const createdTickets = await Ticket.insertMany(tickets);

        const comments = [
            {
                ticket: createdTickets[0]._id,
                authorName: "IT Support",
                message: "We are checking the network connection and adapter settings.",
                authorType: "Support"
            },
            {
                ticket: createdTickets[0]._id,
                authorName: "Juan Dela Cruz",
                message: "The issue started this morning after connecting to the office network.",
                authorType: "Requester"
            },
            {
                ticket: createdTickets[3]._id,
                authorName: "IT Support",
                message: "The application was repaired and updated successfully.",
                authorType: "Support"
            },
            {
                ticket: createdTickets[5]._id,
                authorName: "IT Support",
                message: "The POS terminal has been restarted and is currently being tested.",
                authorType: "Support"
            },
            {
                ticket: createdTickets[7]._id,
                authorName: "IT Support",
                message: "The new workstation was configured and handed over.",
                authorType: "Support"
            }
        ];

        await TicketComment.insertMany(comments);

        console.log("Database seeded successfully.");
        console.log(`Departments: ${createdDepartments.length}`);
        console.log(`Tickets: ${createdTickets.length}`);
        console.log(`Comments: ${comments.length}`);

        await mongoose.connection.close();

        process.exit(0);
    } catch (error) {
        console.error("Database seeding failed:");
        console.error(error);

        await mongoose.connection.close();

        process.exit(1);
    }
};

seedDatabase();