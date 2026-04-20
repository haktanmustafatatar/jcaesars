
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateVareno() {
  const chatbotId = 'cmnvyww3k000tr2q05wj1t5jm';
  
  console.log('--- Updating Chatbot Persona ---');
  await prisma.chatbot.update({
    where: { id: chatbotId },
    data: {
      systemPrompt: `Sen Vareno'nun resmi yapay zeka asistanısın. 
Vareno, yüksek kaliteli erkek giyimi ve moda konusunda uzmanlaşmış bir markadır. 
SADECE ERKEK GİYİMİ, trençkotlar, ceketler, pantolonlar ve aksesuar konusunda bilgi ver. 
Asla mobilya veya ilgisiz sektörlerden bahsetme. 
Müşterilere stil önerileri sun ve ürün detayları (fiyat, kumaş, stok durumu) hakkında bilgi ver. 
Cevaplarını her zaman Knowledge Hub'daki güncel bilgilere dayandır.`,
      welcomeMessage: "Vareno stiline hoş geldiniz! Erkek giyim koleksiyonumuz ve ürün detayları hakkında size nasıl yardımcı olabilirim?",
      description: "Vareno Erkek Giyim Uzmanı",
      status: "TRAINING"
    }
  });
  console.log('Chatbot persona updated successfully.');
  
  // Find the DataSource ID
  const ds = await prisma.dataSource.findFirst({
    where: { chatbotId, type: 'WEBSITE' }
  });
  
  if (ds) {
    console.log(`Found Data Source: ${ds.id} (${ds.url})`);
    // Crucial: Set status to PROCESSING so any manual check shows it's working
    await prisma.dataSource.update({
      where: { id: ds.id },
      data: { status: 'CRAWLING', crawlStatus: 'Force-sync started...' }
    });
    console.log('Data Source status updated to CRAWLING.');
  } else {
    console.log('No WEBSITE data source found for this chatbot.');
  }
}

updateVareno()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
