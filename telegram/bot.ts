import Telegraf from 'telegraf';
import Config from '../tools/getConfig';
import getMessageArgs from '../tools/tgGetMessageArgs';
import Tgids from '../tools/datebase';

const config = Config('./config.json');


const tgBot = new Telegraf(config.tgBotToken);

tgBot.command('login', async (ctx) => {
    if (ctx.chat) {
        ctx.reply(`Please Open ${config.twitter.oauth_url}/session/connect?tgId=${ctx.chat.id} authorize Rosetta`);
    }
});

tgBot.launch();

export default tgBot;