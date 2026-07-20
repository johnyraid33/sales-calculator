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

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      orderBy: { date: "desc" },
      include: {
        agent: {
          select: { name: true },
        },
      },
    });

    return NextResponse.json(transactions);
  } catch (error: any) {
    console.error("GET transactions error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const prisma = getClient();
    const body = await request.json();
    const {
      date,
      client,
      partnerAgency,
      type,
      project,
      price,
      rate,
      dealType,
      paymentStatus,
      agentId,
    } = body;

    if (!client || !price || !agentId || !dealType) {
      return NextResponse.json(
        { error: "Client, price, agentId, and dealType are required" },
        { status: 400 }
      );
    }

    // Validate rate
    const parsedPrice = parseFloat(price);
    const parsedRate = parseFloat(rate);
    
    // Automatically calculate commission
    const calculatedCommission = parsedPrice * parsedRate;

    const transaction = await prisma.transaction.create({
      data: {
        date: date ? new Date(date) : new Date(),
        client,
        partnerAgency: partnerAgency || null,
        type: type || null,
        project: project || null,
        price: parsedPrice,
        rate: parsedRate,
        commission: calculatedCommission,
        dealType,
        paymentStatus: paymentStatus || "UNPAID",
        agentId,
      },
    });

    return NextResponse.json(transaction);
  } catch (error: any) {
    console.error("POST transaction error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const prisma = getClient();
    const body = await request.json();
    const {
      id,
      date,
      client,
      partnerAgency,
      type,
      project,
      price,
      rate,
      dealType,
      paymentStatus,
      agentId,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Transaction ID is required" }, { status: 400 });
    }

    const parsedPrice = parseFloat(price);
    const parsedRate = parseFloat(rate);
    const calculatedCommission = parsedPrice * parsedRate;

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        date: date ? new Date(date) : undefined,
        client,
        partnerAgency: partnerAgency || null,
        type: type || null,
        project: project || null,
        price: parsedPrice,
        rate: parsedRate,
        commission: calculatedCommission,
        dealType,
        paymentStatus,
        agentId,
      },
    });

    return NextResponse.json(transaction);
  } catch (error: any) {
    console.error("PUT transaction error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const prisma = getClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Transaction ID is required" }, { status: 400 });
    }

    await prisma.transaction.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE transaction error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
