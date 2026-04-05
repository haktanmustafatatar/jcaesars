import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  try {
    // pgvector extension'ı aktif et
    await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS vector;`);
    console.log("✅ pgvector extension enabled successfully");
  } catch (error) {
    console.error("❌ Error enabling pgvector extension:", error);
    console.log("Not: Eğer yetki hatası alıyorsanız, veritabanı kullanıcısının superuser olması gerekir.");
  } finally {
    await prisma.$disconnect();
  }
}

main();
