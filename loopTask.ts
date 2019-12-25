import db from './tools/database';
import sleep from './tools/sleep';
import Twitter from './twitter/bot';
import tgBot from './telegram/bot';
import { User } from './interface';

const loopGetNewReply = async () => {
    await sleep(100);
    const users = db.getCollection('Users').data as User[];
    const mentionTable = db.getCollection('Mention');
    while (true) {
        for (const user of users) {
            const twitter = new Twitter(user);
            const data = await twitter.getNewMention(1);
            const userMentiom = mentionTable.find({ username: user.username });
            if (userMentiom.length === 0) {
                mentionTable.insert({
                    username: user.username,
                    mention: [[data[0].id_str, data[0].user.screen_name, data[0].text]]
                });
            }
            const LastMentionList = mentionTable.find({ username: user.username })[0].mention;
            const sinceId = LastMentionList[LastMentionList.length - 1][0];
            const data2 = await twitter.getNewMention(50, sinceId);
            if (data2.length !== 0) {
                for (let i = data2.length - 1; i >= 0; i--) {
                    const s = `${data2[i].user.name} (@${data2[i].user.screen_name}): ${data2[i].text}`;
                    mentionTable.findAndUpdate({ username: user.username }, (res) => {
                        res.mention.push([data2[i].id_str, data2[i].user.screen_name, s]);
                    });
                    if (user.tgId !== '') await tgBot.telegram.sendMessage(Number(user.tgId), s);
                }
            }
        }
        if (users.length !== 0) await sleep(180000);
    }
}

export default loopGetNewReply;