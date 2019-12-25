import Telegraf from 'telegraf';
import Config from '../tools/getConfig';
import getMessageArgs from '../tools/tgGetMessageArgs';
import db from '../tools/database';
import Twitter from '../twitter/bot';
import { User } from '../interface';
import sleep from '../tools/sleep';

const config = Config('./config.json');

const tgBot = new Telegraf(config.tgBotToken);

tgBot.command('login', async (ctx, next) => {
    if (ctx.chat) {
        const users = db.getCollection('Users');
        const tgId = ctx.chat.id.toString();
        const result = users.find({ tgId });
        if (result.length === 0) {
            ctx.reply(`Please Open ${config.twitter.oauth_url}/session/connect?tgId=${ctx.chat.id} authorize Rosetta`);
        } else {
            ctx.reply('Hi, you account is exist');
        }
    } else {
        throw new Error('oops cannoy get your chat');
    }
    await next!();
});

tgBot.command('myinfo', async (ctx, next) => {
    const users = db.getCollection('Users');
    if (!ctx.chat) throw new Error('oops, cannot your get chat id');
    const tgId = ctx.chat.id.toString();
    const result = users.find({ tgId });
    if (result.length === 0) ctx.reply('You account does not exist');
    else {
        let account = '\n';
        for (let i = 0; i < result.length; i++) {
            if (i !== result.length - 1) account += result[i].twitter + '\n';
            else account += result[i].twitter;
        }
        ctx.reply(`You Telegram account: ${result[0].tgId} and you Twitter account: ${account}`);
    }
    await next!();
});

tgBot.command('tweet', async (ctx, next) => {
    const users = db.getCollection('Users');
    if (!ctx.chat || !ctx.message || !ctx.message.text) throw new Error('oops, cannot your get your text message');
    const tgId = ctx.chat.id.toString();
    const result = users.find({ tgId });
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
    await next!();
});

tgBot.command('add_time_rule_tweet', async (ctx, next) => {
    const users = db.getCollection('Users');
    if (!ctx.chat || !ctx.message || !ctx.message.text) throw new Error('oops, cannot your get your text message');
    const tgId = ctx.chat.id.toString();
    const result = users.find({ tgId });
    if (result.length === 0) ctx.reply('You account does not exist');
    else {
        const msg = ctx.message.text;
        const args = getMessageArgs(msg);
        try {
            if (args.length === 0 || args.length === 1) {
                const str = 'Usage:,\n' +
                    '/add_rule_time_tweet 6:00 Meow\n' +
                    '/add_rule_time_tweet 2019-12-21 6:00 Meow\n' +
                    '/add_rule_time_tweet 6:00 Meow +8\n' +
                    '/add_rule_time_tweet 2019-12-21 6:00 Meow +8\n' +
                    'default: UTC+8';
                ctx.reply(str);
            } else if (args.length === 2) {
                const result = db.setTimeRuleByTgId(tgId, args[0], args[1]);
                ctx.reply(result);
            } else if (args.length === 3) {
                if (Number(args[2]) !== NaN) {
                    const result = db.setTimeRuleByTgId(tgId, args[0], args[1], undefined, args[2]);
                    ctx.reply(result);
                } else {
                    const result = db.setTimeRuleByTgId(tgId, args[0], args[1], args[2]);
                    ctx.reply(result);
                }
            }
        } catch (err) {
            console.log(err);
        }
    }
    await next!();
});

tgBot.command('delete_tweet', async (ctx, next) => {
    if (!ctx.message || !ctx.message.text || !ctx.chat) return;
    const tgId = ctx.chat.id.toString();
    const users = db.getCollection('Users').find({ tgId });
    if (users.length === 0) ctx.reply('Your telegram id does not exist');
    const user = users[0];
    const args = getMessageArgs(ctx.message.text);
    try {
        const twitter = new Twitter(user);
        let res = '';
        if (!isNaN(Number(args[0]))) {
            res = await twitter.deleteTweet(args[0]);
        } else if (!isNaN(Number(args[0].split('/')[args[0].split('/').length - 1]))) {
            res = await twitter.deleteTweet(args[0].split('/')[args[0].split('/').length - 1]);
        }
        if (res !== '') ctx.reply(res);
    } catch (err) {
        throw err;
    }
    await next!();
});

tgBot.on('text', async (ctx, next) => {
    if (!ctx.message || !ctx.message.text || !ctx.chat) return;
    if (!ctx.message.reply_to_message || !ctx.message.reply_to_message.text) return;
    await sleep(100);
    const users = db.getCollection('Users');
    const mention = db.getCollection('Mention');
    const message = ctx.message.reply_to_message.text;
    const tgId = ctx.chat.id.toString();
    if (users.find({ tgId }).length === 0) return;
    const user = users.find({ tgId })[0];
    const username = user.username;
    const mentionList = mention.find({ username })[0].mention;
    let tweetId = '';
    let tweetScreenName = '';
    for (const m of mentionList) {
        if (m[2] === message) {
            tweetId = m[0];
            tweetScreenName = m[1];
        }
    }
    if (tweetId === '' || tweetScreenName === '') return;
    else {
        try {
            const twitter = new Twitter(user);
            const res = await twitter.replyToTweet(tweetId, tweetScreenName, ctx.message.text);
            if (res) ctx.reply(res);
        } catch (err) {
            throw err;
        }
    }
    await next!();
});

tgBot.catch((err: any, ctx: any) => {
    console.log(`Ooops, ecountered an error for ${ctx.updateType}`, err);
});

tgBot.launch();

export default tgBot;