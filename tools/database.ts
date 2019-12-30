import Loki from 'lokijs';

class DataStore extends Loki {
    public setTimeRuleByUsername(username: string, time: string, tweet: string, date?: string, UTC?: string) {
        const regTime = new RegExp(/^(20|21|22|23|[0-1]\d):[0-5]\d$/);
        const regDate = new RegExp(/^[1-9]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/);
        if (!username) throw new Error('Your account does not exist');
        if (!date) date = '*';
        if (!UTC) UTC = '+8';
        else if (Number(UTC) <= -12 && Number(UTC) >= 12) throw new Error('Oops, Time zone within -12 < UTC < 12');
        if (!regDate.test(date) && date !== '*') throw new Error('Oops, date example: 2019-12-21');
        if (!regTime.test(time)) throw new Error('Oops, time example: 13:00');
        this.getCollection('Users').findAndUpdate({ username }, (data) => {
            data.timeRule.push({ time, date, tweet, UTC });
        });
        const timeRule = this.getCollection('Users').find({ username })[0].timeRule;
        for (let i = 0; i < timeRule.length; i++) {
            if (JSON.stringify(timeRule[i]) === JSON.stringify({ time, date, tweet, UTC })) {
                return `Hi. set ${date} ${time} (${UTC}) send tweet: ${tweet} success!`;
            }
        }
        throw new Error(`Failed, maybe repeat?`);
    }
}

const db = new DataStore('./database.json', {
    autoloadCallback: databaseInitialize,
    autoload: true,
    autosave: true,
    autosaveInterval: 4000
});

function databaseInitialize() {
    let users = db.getCollection("Users");
    let mention = db.getCollection("Mention");
    if (!users) {
        users = db.addCollection(
            "Users",
            {
                indices: [
                    'username',
                    'password',
                    'tgId',
                    'twitter',
                    'oauthAccessToken',
                    'oauthAccessTokenSecret',
                    'timeRule',
                    'blockRule'
                ],
            }
        );
    }
    if (!mention) mention = db.addCollection('Mention', { indices: ['username', 'mention'] });
}

export default db;
