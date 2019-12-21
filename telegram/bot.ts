import Telegraf from 'telegraf';
import Config from '../tools/getConfig';
import getMessageArgs from '../tools/tgGetMessageArgs';
import db from '../tools/datebase';

const config = Config('./config.json');


const tgBot = new Telegraf(config.tgBotToken);

tgBot.command('login', (ctx) => {
    if (ctx.chat) {
        const tgId = ctx.chat.id.toString();
        const result = db.getCollection('tgIds').find({ tgId });
        if (result.length === 0) {
            ctx.reply(`Please Open ${config.twitter.oauth_url}/session/connect?tgId=${ctx.chat.id} authorize Rosetta`);
        } else {
            ctx.reply('Hi, you account is exist');
        }
    }
});

tgBot.command('myinfo', (ctx) => {
    if (!ctx.chat) throw new Error('oops, cannot get chat id');
    const tgId = ctx.chat.id.toString();
    const result = db.getCollection('tgIds').find({ tgId });
    if (result.length === 0) ctx.reply('You account does not exist');
    else {
        let account = '\n';
        for (let i = 0; i < result.length; i++) {
            if (i !== result.length - 1) account += result[i].twitter + '\n';
            else account += result[i].twitter;
        }
        ctx.reply(`You Telegram account: ${result[0].tgId} and you Twitter account: ${account}`);
    }
})

tgBot.launch();

export default tgBot;