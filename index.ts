import { Bot } from "@maxhub/max-bot-api";
import { err, ok } from "neverthrow";
import { makeDbService } from "./dbService";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const { BOT_TOKEN } = process.env;

const bot = new Bot(BOT_TOKEN!);

const db = await makeDbService();

const getRandomNum = (len: number) =>
  ((len * crypto.getRandomValues(new Uint32Array(1))[0]) / 2 ** 32) | 0;

bot.api.setMyCommands([
  { name: "start", description: "Начать работу с ботом" },
  { name: "draw", description: "Начать розыгрыш" },
  {
    name: "rand",
    description: "max Сгенерировать случайное число от 1 до max",
  },
]);

bot.catch((err, ctx) => {
  console.error(err, ctx);
});

const prepareMax = (maxStr: string) => {
  const max = parseInt(maxStr.trim().slice(0, 6));
  if (isNaN(max) || max < 1) {
    return err("Неверный формат. max должен быть числом от 1 до 999999");
  }
  return ok(getRandomNum(max));
};

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

bot.hears(/rand (.*)/, async (ctx) => {
  const maxStr = ctx.match?.[1] || "";

  prepareMax(maxStr).match(
    (num) => ctx.reply(`${getRandomNum(num) + 1}`),
    (err) => ctx.reply(err)
  );
});

bot.command("draw", async (ctx) => {
  const chatId = ctx.chatId;
  try {
    const { members: allMembers } = await bot.api.getChatMembers(chatId);
    const members = allMembers.filter((member) => !member.is_bot);
    const randomUser = members[getRandomNum(members.length)];
    bot.api.sendMessageToChat(chatId, `**Победитель:** ${randomUser.name}!`, {
      format: "markdown",
      attachments: [
        {
          type: "contact",
          payload: {
            name: randomUser.name,
            contact_id: randomUser.user_id,
          },
        },
      ],
    });
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
