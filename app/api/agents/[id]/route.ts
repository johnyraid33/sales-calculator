import { NextResponse } from "next/server";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/prisma/generated/prisma/client/client";

const getClient = () => {
  const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
  return new PrismaClient({ adapter });
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const prisma = getClient();
    const { id } = await params;

    const agent = await prisma.agent.findUnique({
      where: { id },
      include: {
        transactions: {
          orderBy: { date: "desc" },
        },
        payments: {
          orderBy: { date: "desc" },
        },
      },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

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

    return NextResponse.json({
      ...agent,
      totalCommissionDue,
      totalPaid,
      balance,
    });
  } catch (error: any) {
    console.error("GET agent error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const prisma = getClient();
    const { id } = await params;
    const body = await request.json();
    const { name, email, phone, baseSalary, rentAllowance, socialSecurity } = body;

    const agent = await prisma.agent.update({
      where: { id },
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
    console.error("PUT agent error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const prisma = getClient();
    const { id } = await params;

    await prisma.agent.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE agent error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
