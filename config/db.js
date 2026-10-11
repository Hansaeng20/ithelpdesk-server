const mongoose = require("mongoose");
const dns = require("node:dns");

const DEFAULT_DNS_SERVERS = ["1.1.1.1", "8.8.8.8"];

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
    } catch (error) {
        const isSrvDnsRefusal = process.env.MONGO_URI?.startsWith("mongodb+srv://")
            && error.code === "ECONNREFUSED"
            && error.syscall === "querySrv";

        if (!isSrvDnsRefusal) {
            throw error;
        }

        const dnsServers = process.env.MONGO_DNS_SERVERS
            ? process.env.MONGO_DNS_SERVERS.split(",").map((server) => server.trim()).filter(Boolean)
            : DEFAULT_DNS_SERVERS;

        console.warn("MongoDB SRV lookup was refused by the system DNS; retrying with fallback DNS servers.");
        dns.setServers(dnsServers);
        await mongoose.connect(process.env.MONGO_URI);
    }

    console.log("MongoDB connected successfully");
};

module.exports = connectDB;
