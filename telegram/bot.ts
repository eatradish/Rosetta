import Telegraf from 'telegraf';
import Config from '../tools/getConfig';
import getMessageArgs from '../tools/tgGetMessageArgs';
import Tgids from '../tools/datebase';

const config = Config('./config.json');


const tgBot = new Telegraf(config.tgBotToken);

tgBot.command('login', async (ctx) => {
    if (ctx.chat) {
        const tgId = ctx.chat.id.toString();
        const result = Tgids.find({ tgId });
        if (result.length === 0) {
            ctx.reply(`Please Open ${config.twitter.oauth_url}/session/connect?tgId=${ctx.chat.id} authorize Rosetta`);
        } else {
            ctx.reply('Hi, you account is exist');
        }
    }
});

tgBot.launch();

export default tgBot;