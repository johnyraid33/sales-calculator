import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const prisma = db;
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
        extraIncomes: {
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

    const balance = totalCommissionDue + totalExtraIncome - totalPaid;

    return NextResponse.json({
      ...agent,
      totalCommissionDue,
      totalExtraIncome,
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
    const prisma = db;
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
    const prisma = db;
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
