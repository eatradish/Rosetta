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
                mentionTable.insert({ username: user.username, mention: [[data[0].id_str, data[0].text]]});
            }
            const LastMentionList = mentionTable.find({ username: user.username })[0].mention[0];
            const sinceId = LastMentionList[0];
            const data2 = await twitter.getNewMention(50, sinceId);
            if (data2.length !== 0) {
                mentionTable.findAndUpdate({ username: user.username }, (res) => {
                    res.mention.push([data[0].id_str, data[0].text]);
                });
                for (let i = 0; i < data2.length; i++) {
                    if (user.tgId !== '') {
                        tgBot.telegram.sendMessage(
                            Number(user.tgId),
                            `${data2[i].user.name} (@${data2[i].user.screen_name}): ${data2[i].text}`
                        );
                    }
                }
            }
        }
        await sleep(1000);
    }
}

export default loopGetNewReply;