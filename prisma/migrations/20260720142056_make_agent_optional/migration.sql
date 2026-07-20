-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "client" TEXT NOT NULL,
    "partnerAgency" TEXT,
    "type" TEXT,
    "project" TEXT,
    "price" REAL NOT NULL,
    "rate" REAL NOT NULL,
    "commission" REAL NOT NULL,
    "dealType" TEXT NOT NULL,
    "paymentStatus" TEXT NOT NULL,
    "agentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Transaction_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Transaction" ("agentId", "client", "commission", "createdAt", "date", "dealType", "id", "partnerAgency", "paymentStatus", "price", "project", "rate", "type", "updatedAt") SELECT "agentId", "client", "commission", "createdAt", "date", "dealType", "id", "partnerAgency", "paymentStatus", "price", "project", "rate", "type", "updatedAt" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
