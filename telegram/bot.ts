import Telegraf from 'telegraf';
import Config from '../tools/getConfig';
import getMessageArgs from '../tools/tgGetMessageArgs';
import db from '../tools/database';
import Twitter from '../twitter/bot';
import { User } from '../interface';
import sleep from '../tools/sleep';

const config = Config('./config.json');

const tgBot = new Telegraf(config.tgBotToken);

const loginStr = (id: number): string => {
    return `Please Open ${config.twitter.oauth_url}/session/connect?tgId=${id} authorize Rosetta`;
};

const myinfoStr = (result: User[]): string => {
    let account = '\n';
    for (let i = 0; i < result.length; i++) {
        if (i !== result.length - 1) account += result[i].twitter + '\n';
        else account += result[i].twitter;
    }
    return `You Telegram account: ${result[0].tgId} and you Twitter account: ${account}`;
};

const tweetResultStr = (screenName: string, tweetId: string) => {
    return `Success~ your tweet link: https://twitter.com/${screenName}/status/${tweetId}`;
};

const deleteTweetResult = (screenName: string, tweetId: string) => {
    return `Tweet https://twitter.com/${screenName}/status/${tweetId} removed`;
}



const accountIsExist = 'Hi, you account is exist';
const cannotGetChatId = 'Ooops, cannot your get chat id';
const accountDoesNotExist = 'Your account does not exist';
const tweetUsage = 'oops! Usage: /tweet + status, E.g: /tweet Meow';
const addRuleTimeTweetUsage = 'Usage:,\n' +
    '/add_rule_time_tweet 6:00 Meow\n' +
    '/add_rule_time_tweet 2019-12-21 6:00 Meow\n' +
    '/add_rule_time_tweet 6:00 Meow +8\n' +
    '/add_rule_time_tweet 2019-12-21 6:00 Meow +8\n' +
    'default: UTC+8';
const notificationIsOpen = 'Your notification is already opened';
const notificationAlreadyOpened = 'Your notification is already opened';
const notificationAlreadyClosed = 'Your notification is already closed';
const notificationIsClosed = 'Mention Notifications is closed';


tgBot.command('login', async (ctx, next) => {
    if (ctx.chat) {
        const users = db.getCollection('Users');
        if (!users) return;
        const tgId = ctx.chat.id.toString();
        const result = users.find({ tgId });
        if (result.length === 0) {
            ctx.reply(loginStr(ctx.chat.id));
        } else {
            ctx.reply(accountIsExist);
        }
    } else {
        throw new Error(cannotGetChatId);
    }
    await next!();
});

tgBot.command('myinfo', async (ctx, next) => {
    const users = db.getCollection('Users');
    if (!users) return;
    if (!ctx.chat) throw new Error(cannotGetChatId);
    const tgId = ctx.chat.id.toString();
    const result = users.find({ tgId });
    if (result.length === 0) ctx.reply(accountDoesNotExist);
    else {
        const res = myinfoStr(result);
        ctx.reply(res);
    }
    await next!();
});

tgBot.command('tweet', async (ctx, next) => {
    const users = db.getCollection('Users');
    if (!users) return;
    if (!ctx.chat || !ctx.message || !ctx.message.text) throw new Error(cannotGetChatId);
    const tgId = ctx.chat.id.toString();
    const result = users.find({ tgId });
    if (result.length === 0) ctx.reply(accountDoesNotExist);
    else {
        const args = ctx.message.text;
        if (args.length === 0) ctx.reply(tweetUsage);
        const text = getMessageArgs(args).join(' ');
        if (text === '') ctx.reply(tweetUsage);
        const user = result[0] as User;
        const twitter = new Twitter(user);
        try {
            const tweet = await twitter.tweet(text);
            if (tweet) ctx.reply(tweetResultStr(tweet.user.screen_name, tweet.id_str));
        } catch (err) {
            throw err;
        }
    }
    await next!();
});

tgBot.command('add_time_rule_tweet', async (ctx, next) => {
    const users = db.getCollection('Users');
    if (!users) return;
    if (!ctx.chat || !ctx.message || !ctx.message.text) throw new Error(cannotGetChatId);
    const tgId = ctx.chat.id.toString();
    const result = users.find({ tgId });
    if (result.length === 0) ctx.reply(accountDoesNotExist);
    else {
        const user = result[0].username;
        const msg = ctx.message.text;
        const args = getMessageArgs(msg);
        if (args.length === 0) ctx.reply(addRuleTimeTweetUsage);
        try {
            if (args.length === 0 || args.length === 1) ctx.reply(addRuleTimeTweetUsage);
            else if (args.length === 2) {
                const result = db.setTimeRuleByUsername(user, args[0], args[1]);
                ctx.reply(result);
            } else if (args.length === 3) {
                if (Number(args[2]) !== NaN) {
                    const result = db.setTimeRuleByUsername(user, args[0], args[1], undefined, args[2]);
                    ctx.reply(result);
                } else {
                    const result = db.setTimeRuleByUsername(user, args[0], args[1], args[2]);
                    ctx.reply(result);
                }
            }
        } catch (err) {
            throw err;
        }
    }
    await next!();
});

tgBot.command('open_notifications', async (ctx, next) => {
    if (!ctx.chat) return;
    const users = db.getCollection('Users');
    const mention = db.getCollection('Mention');
    if (!users) return;
    const tgId = ctx.chat.id.toString();
    const result = users.find({ tgId });
    if (result.length === 0) ctx.reply(accountDoesNotExist);
    const user = result[0];
    const username = user.username;

    const userMention = mention.find({ username })[0];
    if (userMention.isOpen) ctx.reply(notificationAlreadyOpened);
    else {
        mention.findAndUpdate({ username }, (data) => {
            data.isOpen = true;
            if (data.isOpen) ctx.reply(notificationIsOpen);
        });
    }
    await next!();
});

tgBot.command('close_notifications', async (ctx, next) => {
    if (!ctx.chat) throw new Error(accountDoesNotExist);
    const users = db.getCollection('Users');
    const mention = db.getCollection('Mention');
    if (!users) return;
    const tgId = ctx.chat.id.toString();
    const result = users.find({ tgId });
    if (result.length === 0) ctx.reply(accountDoesNotExist);
    const user = result[0];
    const username = user.username;
    const userMention = mention.find({ username })[0];

    if (!userMention.isOpen) ctx.reply(notificationAlreadyClosed);
    else {
        mention.findAndUpdate({ username }, (data) => {
            data.isOpen = false;
            if (!data.isOpen) ctx.reply(notificationIsClosed);
        });
    }
    await next!();
});

tgBot.command('delete_tweet', async (ctx, next) => {
    if (!ctx.message || !ctx.message.text || !ctx.chat) throw new Error(cannotGetChatId);
    const tgId = ctx.chat.id.toString();
    const users = db.getCollection('Users');
    if (!users) return;
    const result = users.find({ tgId });
    if (result.length === 0) ctx.reply(accountDoesNotExist);
    const user = result[0];
    const args = getMessageArgs(ctx.message.text);
    try {
        const twitter = new Twitter(user);
        let res;
        if (!isNaN(Number(args[0]))) {
            res = await twitter.deleteTweet(args[0]);
        } else if (!isNaN(Number(args[0].split('/')[args[0].split('/').length - 1]))) {
            res = await twitter.deleteTweet(args[0].split('/')[args[0].split('/').length - 1]);
        }
        if (res) ctx.reply(deleteTweetResult(res.user.screen_name, res.id_str));
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
    if (users.find({ tgId }).length === 0) throw new Error(accountDoesNotExist);
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
            if (res) ctx.reply(tweetResultStr(res.user.screen_name, res.id_str));
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