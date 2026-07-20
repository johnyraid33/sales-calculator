import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const prisma = db;
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get("agentId");

    const whereClause = agentId && agentId !== "all" && agentId !== "none"
      ? { agentId }
      : agentId === "none"
        ? { agentId: null }
        : {};

    const items = await prisma.extraIncome.findMany({
      where: whereClause,
      orderBy: { date: "desc" },
      include: {
        agent: {
          select: { name: true },
        },
      },
    });

    return NextResponse.json(items);
  } catch (error: any) {
    console.error("GET extra-incomes error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const prisma = db;
    const body = await request.json();
    const { date, amount, type, memo, agentId } = body;

    if (!amount || !type) {
      return NextResponse.json(
        { error: "Amount and type are required" },
        { status: 400 }
      );
    }

    const item = await prisma.extraIncome.create({
      data: {
        date: date ? new Date(date) : new Date(),
        amount: parseFloat(amount),
        type,
        memo: memo || null,
        agentId: agentId === "none" || !agentId ? null : agentId,
      },
    });

    return NextResponse.json(item);
  } catch (error: any) {
    console.error("POST extra-income error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const prisma = db;
    const body = await request.json();
    const { id, date, amount, type, memo, agentId } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const item = await prisma.extraIncome.update({
      where: { id },
      data: {
        date: date ? new Date(date) : undefined,
        amount: amount ? parseFloat(amount) : undefined,
        type,
        memo,
        agentId: agentId === "none" || !agentId ? null : agentId,
      },
    });

    return NextResponse.json(item);
  } catch (error: any) {
    console.error("PUT extra-income error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const prisma = db;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await prisma.extraIncome.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE extra-income error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
