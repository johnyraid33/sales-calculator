import { NextResponse } from "next/server";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/prisma/generated/prisma/client/client";

const getClient = () => {
  const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
  return new PrismaClient({ adapter });
};

export async function GET(request: Request) {
  try {
    const prisma = getClient();
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get("agentId");

    const whereClause = agentId ? { agentId } : {};

    const payments = await prisma.payment.findMany({
      where: whereClause,
      orderBy: { date: "desc" },
      include: {
        agent: {
          select: { name: true },
        },
      },
    });

    return NextResponse.json(payments);
  } catch (error: any) {
    console.error("GET payments error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const prisma = getClient();
    const body = await request.json();
    const { date, amount, type, memo, agentId } = body;

    if (!amount || !type || !agentId) {
      return NextResponse.json(
        { error: "Amount, type, and agentId are required" },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.create({
      data: {
        date: date ? new Date(date) : new Date(),
        amount: parseFloat(amount),
        type,
        memo: memo || null,
        agentId,
      },
    });

    return NextResponse.json(payment);
  } catch (error: any) {
    console.error("POST payment error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const prisma = getClient();
    const body = await request.json();
    const { id, date, amount, type, memo, agentId } = body;

    if (!id) {
      return NextResponse.json({ error: "Payment ID is required" }, { status: 400 });
    }

    const payment = await prisma.payment.update({
      where: { id },
      data: {
        date: date ? new Date(date) : undefined,
        amount: amount ? parseFloat(amount) : undefined,
        type,
        memo,
        agentId,
      },
    });

    return NextResponse.json(payment);
  } catch (error: any) {
    console.error("PUT payment error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const prisma = getClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Payment ID is required" }, { status: 400 });
    }

    await prisma.payment.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE payment error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
