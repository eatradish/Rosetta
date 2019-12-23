import Telegraf from 'telegraf';
import Config from '../tools/getConfig';
import getMessageArgs from '../tools/tgGetMessageArgs';
import db from '../tools/datebase';
import Twitter from '../twitter/bot';
import { User } from '../interface';

const config = Config('./config.json');

const tgBot = new Telegraf(config.tgBotToken);

tgBot.command('login', async (ctx, next: any) => {
    if (ctx.chat) {
        const tgId = ctx.chat.id.toString();
        const result = db.getCollection('Users').find({ tgId });
        if (result.length === 0) {
            ctx.reply(`Please Open ${config.twitter.oauth_url}/session/connect?tgId=${ctx.chat.id} authorize Rosetta`);
        } else {
            ctx.reply('Hi, you account is exist');
        }
    } else {
        throw new Error('oops cannoy get your chat');
    }
    await next();
});

tgBot.command('myinfo', async (ctx, next: any) => {
    if (!ctx.chat) throw new Error('oops, cannot your get chat id');
    const tgId = ctx.chat.id.toString();
    const result = db.getCollection('Users').find({ tgId });
    if (result.length === 0) ctx.reply('You account does not exist');
    else {
        let account = '\n';
        for (let i = 0; i < result.length; i++) {
            if (i !== result.length - 1) account += result[i].twitter + '\n';
            else account += result[i].twitter;
        }
        ctx.reply(`You Telegram account: ${result[0].tgId} and you Twitter account: ${account}`);
    }
    await next();
});

tgBot.command('tweet', async (ctx, next: any) => {
    if (!ctx.chat || !ctx.message || !ctx.message.text) throw new Error('oops, cannot your get your text message');
    const tgId = ctx.chat.id.toString();
    const result = db.getCollection('Users').find({ tgId });
    if (result.length === 0) ctx.reply('You account does not exist');
    else {
        const args = ctx.message.text;
        const text = getMessageArgs(args).join(' ');
        const user = result[0] as User;
        const twitter = new Twitter(user);
        try {
            const tweet = await twitter.tweet(text);
            if (tweet) ctx.reply(tweet);
        } catch (err) {
            console.log(err.message);
            ctx.reply('failed');
        }
    }
    await next();
});

tgBot.catch((err: any, ctx: any) => {
    console.log(`Ooops, ecountered an error for ${ctx.updateType}`, err);
});

tgBot.launch();

export default tgBot;