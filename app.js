const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');
dotenv.config({ path: "./config.env" });

const TOKEN = process.env.TOKEN;
const bot = new TelegramBot(TOKEN, { polling: true });

console.log('Bot is running...');

// IDs
const qalbiChatId = Number(process.env.QALBI); // Sender 1
const janniChatId = Number(process.env.JANNI); // Sender 2
const groupChatId = Number(process.env.GROUP_ID); // Destination group

// Put allowed private chats in an array
const allowedSenders = [qalbiChatId, janniChatId];

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text || '';

  console.log(`From: ${msg.from.first_name} ${msg.from.last_name || ''}`);
  console.log(`Chat ID: ${chatId}`);
  console.log(`Message: ${text}`);

  // Only forward if message is from allowed senders and contains "TRADE IDEA"
  if (allowedSenders.includes(chatId) && text.includes('TRADE IDEA')) {
    const formattedMessage = formatTradeIdea(text);
    if (formattedMessage) {
      bot.sendMessage(groupChatId, formattedMessage, { parse_mode: 'Markdown' });
    }
  }
});

// Function to parse and format the trade message
function formatTradeIdea(message) {
  const directionMatch = message.match(/📉\s*:\s*(.+)/);
  const entryMatch = message.match(/Entry point\s*[:：]\s*([0-9\-.–\s]+)/i);
  const stopLossMatch = message.match(/Stop Loss\s*[:：]\s*([0-9.]+)/i);
  const tpMatches = [...message.matchAll(/TP\s*(\d+)\s*[:：]\s*([0-9.]+)/gi)];

  let formatted = 
`
💹 *TRADE IDEA*
\n`;

  if (directionMatch) {
    formatted += `📍 *Direction:* \`${directionMatch[1].trim()}\`\n\n`;
  }
  if (entryMatch) {
    formatted += `💵 *Entry:* \`${entryMatch[1].trim()}\`\n\n`;
  }
  if (stopLossMatch) {
    formatted += `🛑 *Stop Loss:* \`${stopLossMatch[1].trim()}\`\n\n`;
  }
  if (tpMatches.length) {
    formatted += `🎯 *Take Profits:*\n`;
    tpMatches.forEach(tp => {
      formatted += `   ➤ TP${tp[1]}: \`${tp[2]}\`\n`;
    });
    formatted += `\n`;
  }

  formatted += 
`
⚠️ _Educational purposes only. Not financial advice._
`;

  return formatted;
}

