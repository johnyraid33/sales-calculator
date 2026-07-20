import { PrismaClient } from "./generated/prisma/client/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import * as fs from "fs";
import * as path from "path";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  const agentCount = await prisma.agent.count();
  if (agentCount > 0) {
    console.log("Database already has agent data. Skipping seeding to prevent overwriting.");
    return;
  }

  // 1. Create default Agent (Johny)
  const agent = await prisma.agent.create({
    data: {
      name: "Johny",
      email: "johny.raid@gmail.com",
      phone: "+357 99 000000",
      baseSalary: 2150,
      rentAllowance: 1650,
      socialSecurity: 0,
    },
  });

  console.log(`Created default agent: ${agent.name} (${agent.id})`);

  // 2. Read financial_data.json
  const jsonPath = path.join(__dirname, "financial_data.json");

  if (fs.existsSync(jsonPath)) {
    const rawData = fs.readFileSync(jsonPath, "utf-8");
    const parsedData = JSON.parse(rawData);

    // Seed Sales (Transactions)
    const sales = parsedData.sales || [];
    let salesCount = 0;
    for (const s of sales) {
      let rateFloat = 0.01;
      if (s.rate) {
        const rateClean = s.rate.replace("%", "").trim();
        rateFloat = parseFloat(rateClean) / 100.0;
      }
      if (isNaN(rateFloat)) rateFloat = 0.01;

      // Classify type
      let dealType = "SALE";
      if (s.item_type === "rental_charge") {
        dealType = "RENT";
        rateFloat = 0.50; // Rent commission is always 50%
      }

      await prisma.transaction.create({
        data: {
          date: new Date(s.date_iso || s.date || Date.now()),
          client: s.client || "Unknown",
          partnerAgency: s.partner || null,
          type: s.type || null,
          project: s.project || null,
          price: s.sale_price || 0,
          rate: rateFloat,
          commission: s.commission || 0,
          dealType: dealType,
          paymentStatus: s.status === "Deposit Paid" ? "PARTIALLY_PAID" : "PAID",
          agentId: agent.id,
        },
      });
      salesCount++;
    }
    console.log(`Successfully seeded ${salesCount} transactions.`);

    // Seed Payments
    const payments = parsedData.payments || [];
    let pmtCount = 0;
    for (const p of payments) {
      // Determine type
      let pmtType = "COMMISSION";
      if (p.type === "salary") pmtType = "SALARY";
      else if (p.type === "direct_rent") pmtType = "RENT_ALLOWANCE";
      else if (p.type === "rental_cash") pmtType = "COMMISSION"; // cash payments of rent are commission cash
      else if (p.type === "deduction") pmtType = "DEDUCTION";
      else if (p.type === "car_rental") pmtType = "EXPENSE";
      else if (p.type === "bonus") pmtType = "BONUS";

      await prisma.payment.create({
        data: {
          date: new Date(p.date_iso || p.date || Date.now()),
          amount: p.amount || 0,
          type: pmtType,
          memo: p.desc || null,
          agentId: agent.id,
        },
      });
      pmtCount++;
    }
    console.log(`Successfully seeded ${pmtCount} payments.`);
  } else {
    console.log("financial_data.json not found, skipping historical data seed.");
  }

  console.log("Seeding finished successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
