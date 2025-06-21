const { Client, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');
const qrcode = require('qrcode-terminal');
const config = JSON.parse(fs.readFileSync('config.json'));
const groups = JSON.parse(fs.readFileSync('groups.json'));

const scannedMessages = new Set(); // למניעת כפילויות

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', qr => {
    console.log('📱 סרוק את ה-QR:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ התחברות הושלמה! מחובר ל-WhatsApp Web.');
});

function hasKeyword(text) {
    return config.keywords.some(keyword => text.includes(keyword));
}

client.on('message', async msg => {
    const chat = await msg.getChat();

    // ודא שמדובר בקבוצת וואטסאפ
    if (!chat.isGroup) return;

    const groupId = chat.id._serialized;

    const group = groups.find(g => g.groupId === groupId);
    if (!group) return;

    if (hasKeyword(msg.body) && !scannedMessages.has(msg.id._serialized)) {
        scannedMessages.add(msg.id._serialized);

        console.log('🚨 נמצאה הודעה רלוונטית!');
        console.log(`📌 קבוצה: ${group.groupName}`);
        console.log(`👤 מפרסם: ${msg.author || msg.from}`);
        console.log(`💬 הודעה: ${msg.body}`);
        console.log(`📎 [ 🟤 שלח עכשיו תגובה | 🔗 קישור להודעה ]\n`);
    }
});
