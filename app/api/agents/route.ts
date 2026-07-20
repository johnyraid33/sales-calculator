import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/prisma/generated/prisma/client/client";

// Ensure Prisma client is instantiated with adapter
const getClient = () => {
  const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
  return new PrismaClient({ adapter });
};

export async function GET() {
  try {
    const prisma = getClient();
    const agents = await prisma.agent.findMany({
      include: {
        transactions: true,
        payments: true,
      },
    });

    const summary = agents.map((agent) => {
      // Math:
      // Due = Commissions (Sales & Rentals)
      // Paid = Salaries + Commissions + Rent Allowances + Bonuses + Expenses - Deductions
      const totalCommissionDue = agent.transactions.reduce(
        (sum, tx) => sum + (tx.commission || 0),
        0
      );

      const totalPaid = agent.payments.reduce((sum, p) => {
        if (p.type === "DEDUCTION") {
          return sum - p.amount;
        }
        return sum + p.amount;
      }, 0);

      const balance = totalCommissionDue - agent.payments.filter(p => p.type === "COMMISSION" || p.type === "RENT_ALLOWANCE").reduce((sum, p) => {
        if (p.type === "DEDUCTION") return sum - p.amount;
        return sum + p.amount;
      }, 0);

      return {
        ...agent,
        totalCommissionDue,
        totalPaid,
        balance, // Outstanding commission/rent due
      };
    });

    return NextResponse.json(summary);
  } catch (error: any) {
    console.error("GET agents error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const prisma = getClient();
    const body = await request.json();
    const { name, email, phone, baseSalary, rentAllowance, socialSecurity } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const agent = await prisma.agent.create({
      data: {
        name,
        email,
        phone,
        baseSalary: parseFloat(baseSalary) || 0,
        rentAllowance: parseFloat(rentAllowance) || 0,
        socialSecurity: parseFloat(socialSecurity) || 0,
      },
    });

    return NextResponse.json(agent);
  } catch (error: any) {
    console.error("POST agent error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
