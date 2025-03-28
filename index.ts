import { Bot } from "@maxhub/max-bot-api";
import { makeDbService } from "./dbService";

const { BOT_TOKEN } = process.env;

const bot = new Bot(BOT_TOKEN!);

const db = await makeDbService();

bot.command("start", (ctx) => {
  const user = ctx.message?.sender;
  const userName = user?.name || user?.username || "незнакомец";
  if (user) {
    db.addUser({
      id: user.user_id,
      name: user.name,
      userName: user.username || "",
    });
    ctx.reply(`✋ Привет, ${userName}! 
Я помогу тебе провести розыгрыш в групповом чате. Просто добавь меня в чат и дай команду /draw`);
  }
});

bot.on("bot_added", async (ctx) => {
  let chat = undefined;
  try {
    chat = await ctx.getChat();
  } catch (error) {}
  db.addGroup({
    id: ctx.update.chat_id,
    info: chat,
    user: {
      id: ctx.update.user.user_id,
      name: ctx.update.user.name,
      userName: ctx.update.user.username || "",
    },
  });
});

bot.command("draw", async (ctx) => {
  const chatId = ctx.chatId;
  try {
    const { members: allMembers } = await bot.api.getChatMembers(chatId);
    const members = allMembers.filter((member) => !member.is_bot);
    const randomUser = members[Math.floor(Math.random() * members.length)];
    bot.api.sendMessageToChat(
      chatId,
      `**Победитель:** ${randomUser.name} @${
        randomUser.username || randomUser.user_id
      } !`,
      { format: "markdown" }
    );
  } catch (error) {
    console.log("error", error);
    bot.api.sendMessageToChat(
      chatId,
      "Что-то пошло не так, не могу получить участников чата"
    );
  }
});

console.log("bot started");

void bot.start();
