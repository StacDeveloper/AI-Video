import dotenv from "dotenv"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../generated/prisma/client.js"
dotenv.config()
const connectionString = process.env.DATABASE_URL

const adapter: PrismaPg = new PrismaPg({ connectionString })
const prisma: PrismaClient = new PrismaClient({ adapter })
export { prisma }

