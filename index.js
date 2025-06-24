// index.js
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const moment = require('moment-timezone');
const fs = require('fs');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox']
    }
});

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
    console.log('📱 סרוק את הקוד להתחברות');
});

client.on('ready', async () => {
    console.log('✅ הסוכן מחובר ומוכן!');
    try {
        const chats = await client.getChats();
        const adminChat = chats.find(chat => chat.id._serialized === ADMIN_NUMBER);
        if (adminChat) {
            await client.sendMessage(ADMIN_NUMBER, '🤖 הסוכן מחובר ופעיל כעת. ממתין להודעות מקבוצות.');
        } else {
            console.warn('⚠️ לא נמצא צ׳אט קיים עם מספר המנהל. ודא שהייתה שיחה קודמת עם המספר.');
        }
    } catch (error) {
        console.error('❌ שגיאה בשליחת הודעה למנהל:', error.message);
    }
});

const ADMIN_NUMBER = '0505511908@c.us';
const BOT_NUMBER = '0505511908@c.us'; // מספר הבוט עצמו לשיחה עצמית

const keywords = [
    'תל אביב', 'פתח תקווה', 'ראשון לציון', 'רמת גן', 'גבעתיים', 'בת ים', 'חולון', 'בני ברק', 'אור יהודה',
    'ראש העין', 'נס ציונה', 'רחובות', 'לוד', 'רמלה', 'מודיעין', 'שוהם', 'בית דגן', 'קריית עקרון',
    'אשקלון', 'אשדוד', 'באר שבע', 'נתיבות', 'אופקים', 'דימונה', 'ירוחם', 'ערד', 'אילת', 'להבים', 'מיתר',
    'חיפה', 'עכו', 'נהריה', 'צפת', 'טבריה', 'כרמיאל', 'קריית שמונה', 'מעלות תרשיחא', 'שלומי', 'מטולה',
    'ירושלים', 'מעלה אדומים', 'בית שמש', 'ביתר עילית', 'מודיעין עילית',
    'אריאל', 'מעלה שומרון', 'בית אל', 'כפר אדומים', 'גוש עציון', 'אלון מורה', 'שכם', 'חברון',
    'נתב"ג', 'ים המלח', 'כנרת', 'מצדה', 'צוקים', 'נווה זוהר', 'עין בוקק',
    'נהג', 'נסיעה', 'הסעה', 'שאטל', 'רכב', 'מיניבוס', 'ואן', 'חזור', 'הלוך', 'טרמפ'
];

function parseDateFromText(text) {
    const now = moment().tz('Asia/Jerusalem');
    const patterns = [
        { regex: /(\d{1,2})[./](\d{1,2})/, handler: (d, m) => now.clone().date(+d).month(+m - 1).hour(8).minute(0) },
        { regex: /מחר\s*(בבוקר)?/, handler: () => now.clone().add(1, 'day').hour(8).minute(0) },
        { regex: /מחר\s*בערב/, handler: () => now.clone().add(1, 'day').hour(20).minute(0) },
        { regex: /יום\s*(ראשון|שני|שלישי|רביעי|חמישי|שישי|שבת)\s*(בבוקר|בערב|בלילה)?/, handler: (day, time) => {
            const daysMap = {
                'ראשון': 0, 'שני': 1, 'שלישי': 2, 'רביעי': 3, 'חמישי': 4, 'שישי': 5, 'שבת': 6
            };
            const hourMap = {
                'בבוקר': 8,
                'בערב': 20,
                'בלילה': 22
            };
            const dayNum = daysMap[day];
            const target = now.clone().day(dayNum);
            if (target.isBefore(now)) target.add(7, 'days');
            target.hour(hourMap[time] || 8).minute(0);
            return target;
        }}
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern.regex);
        if (match) {
            return pattern.handler(...match.slice(1));
        }
    }
    return null;
}

client.on('message', async msg => {
        // תגובה לפקודות מהאדמין בלבד
    if (msg.from === ADMIN_NUMBER) {
        const body = msg.body.toLowerCase();

        if (body.startsWith('חפש לי')) {
            scanning = true;

            await client.sendMessage(ADMIN_NUMBER, '🔍 מתחיל חיפוש לפי הבקשה שלך...');
            await client.sendMessage(ADMIN_NUMBER, '📍 נמצאה נסיעה לדוגמה מאשקלון לירושלים ביום שני ב־21:00');
            return;
        }

        if (body === 'עצור חיפוש') {
            scanning = false;
            await client.sendMessage(ADMIN_NUMBER, '🛑 החיפוש הופסק לפי בקשתך.');
            return;
        }
    }

    const chat = await msg.getChat();
    const isGroup = chat.isGroup;
    const fromSelf = msg.from === BOT_NUMBER;
    if (!isGroup && !fromSelf) return;

    const content = msg.body.toLowerCase();
    const now = moment().tz('Asia/Jerusalem');
    const targetTime = parseDateFromText(content);

    const hasRoute = content.includes('אשקלון') && content.includes('אילת');

    if (targetTime && hasRoute) {
        const timestamp = msg.timestamp * 1000;
        const messageTime = moment(timestamp).tz('Asia/Jerusalem');

        if (messageTime.isBefore(targetTime)) {
            const reply = `🧠 קיבלתי! אני בודק נסיעה מאשקלון לאילת לטווח: ${targetTime.format('DD/MM HH:mm')}`;
            await client.sendMessage(ADMIN_NUMBER,
                `🚌 נמצאה בקשה לנסיעה מאשקלון לאילת לטווח: ${targetTime.format('DD/MM HH:mm')}`);
        } else {
        }
        return;
    }

 for (const keyword of keywords) {
  if (content.includes(keyword)) {
    console.log(`🔍 מילה פתוחה: ${keyword}`);
    break;
  }
}

message.reply(`🔍 מילות מפתח פתוחות בקבוצה: ${keywords.join(', ')}`);
    }
});

client.initialize();
