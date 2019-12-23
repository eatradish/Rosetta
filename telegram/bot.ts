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
        if (args.length === 0) ctx.reply('oops! Usage: /tweet + status, E.g: /tweet Meow');
        const text = getMessageArgs(args).join(' ');
        const user = result[0] as User;
        const twitter = new Twitter(user);
        try {
            const tweet = await twitter.tweet(text);
            if (tweet) ctx.reply(tweet);
        } catch (err) {
            ctx.reply('failed');
        }
    }
    await next();
});

tgBot.command('add_time_rule_tweet', async (ctx, next: any) => {
    if (!ctx.chat || !ctx.message || !ctx.message.text) throw new Error('oops, cannot your get your text message');
    const tgId = ctx.chat.id.toString();
    const users = db.getCollection('Users');
    const result = users.find({ tgId });
    if (result.length === 0) ctx.reply('You account does not exist');
    else {
        const regTime = new RegExp(/^(20|21|22|23|[0-1]\d):[0-5]\d$/);
        const regDate = new RegExp(/^[1-9]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/);
        const msg = ctx.message.text;
        const args = getMessageArgs(msg);
        try {
            if (args.length === 2 && regTime.test(args[0])) {
                users.findAndUpdate({ tgId }, (data) => {
                    data.timeRule.push({ time: args[0], date: '*', text: args[1], UTC: '+8' });
                });
                ctx.reply(`Hi. set everyday send tweet: ${args[1]} success!`);
            } else if (
                args.length === 3 &&
                regTime.test(args[0]) &&
                regDate.test(args[1])
            ) {
                if (Date.now() > Date.parse(new Date(args[1]).toString())) {
                    ctx.reply('Oops! your set date is old');
                } else {
                    users.findAndUpdate({ tgId }, (data) => {
                        data.timeRule.push({ time: args[0], date: args[1], text: args[2], UTC: '+8' });
                    });
                    ctx.reply(`Hi. set ${args[0]} ${args[1]} send tweet: ${args[2]} success!`);
                }
            } else if (
                args.length === 3 &&
                regTime.test(args[0]) &&
                Number(args[2]) >= -12 &&
                Number(args[2]) <= 12  
            ) {
                users.findAndUpdate({ tgId }, (data) => {
                    data.timeRule.push({ time: args[0], date: '*', text: args[1], UTC: args[2] });
                });
                ctx.reply(`Hi. set ${args[0]} everyday (${args[2]}) send tweet: ${args[1]} success!`);
            } else if (
                args.length === 4 &&
                regTime.test(args[0]) &&
                regDate.test(args[1]) &&
                Number(args[3]) >= -12 &&
                Number(args[3]) <= 12  
            ) {
                if (Date.now() > Date.parse(new Date(args[1]).toString())) {
                    ctx.reply('Oops! your set date is old');
                } else {
                    users.findAndUpdate({ tgId }, (data) => {
                        data.timeRule.push({ time: args[0], date: args[1], text: args[2], UTC: args[3] });
                    });
                    ctx.reply(`Hi. set ${args[0]} ${args[1]} (${args[3]}) send tweet: ${args[2]} success!`);
                }
            } else {
                const str = 'Oops! Usage:,\n' +
                    '/add_rule_time_tweet 6:00 Meow\n' +
                    '/add_rule_time_tweet 2019-12-21 6:00 Meow\n' +
                    '/add_rule_time_tweet 6:00 Meow +8\n' +
                    '/add_rule_time_tweet 2019-12-21 6:00 Meow +8\n' +
                    'default: UTC+8';
                ctx.reply(str);
            }
        } catch (err) {
            console.log(err);
        }
    }
    await next();
});

tgBot.catch((err: any, ctx: any) => {
    console.log(`Ooops, ecountered an error for ${ctx.updateType}`, err);
});

tgBot.launch();

export default tgBot;