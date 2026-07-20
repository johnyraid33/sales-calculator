import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const prisma = db;
    const agents = await prisma.agent.findMany({
      include: {
        transactions: true,
        payments: true,
        extraIncomes: true,
      },
    });

    const summary = agents.map((agent) => {
      // Math:
      // Due = Commissions (Sales & Rentals) + Extra Incomes/Claims
      // Paid = Payments made to agent (deductions act negative)
      const totalCommissionDue = agent.transactions.reduce(
        (sum, tx) => sum + (tx.commission || 0),
        0
      );

      const totalExtraIncome = agent.extraIncomes.reduce(
        (sum, item) => sum + item.amount,
        0
      );

      const totalPaid = agent.payments.reduce((sum, p) => {
        if (p.type === "DEDUCTION") {
          return sum - p.amount;
        }
        return sum + p.amount;
      }, 0);

      // Balance = Total commissions + Extra Incomes - Payments
      const balance = totalCommissionDue + totalExtraIncome - totalPaid;

      return {
        ...agent,
        totalCommissionDue,
        totalExtraIncome,
        totalPaid,
        balance,
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
    const prisma = db;
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
