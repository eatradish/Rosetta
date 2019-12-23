import Loki from 'lokijs';

const db = new Loki('./datebase.db', {
    autoloadCallback: databaseInitialize,
    autoload: true,
    autosave: true,
    autosaveInterval: 4000
});

function databaseInitialize() {
    let users = db.getCollection("Users");
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
}

export default db;
//console.log(tgIds.data);
