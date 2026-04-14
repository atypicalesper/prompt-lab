-- CreateTable
CREATE TABLE "request_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "model" TEXT NOT NULL,
    "systemPrompt" TEXT,
    "prompt" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "inputTokens" INTEGER NOT NULL,
    "outputTokens" INTEGER NOT NULL,
    "totalTokens" INTEGER NOT NULL,
    "ttft" REAL NOT NULL,
    "totalTime" REAL NOT NULL,
    "tokensPerSec" REAL NOT NULL,
    "contextWindow" INTEGER NOT NULL,
    "contextUsagePct" REAL NOT NULL,
    "estimatedCostUsd" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
