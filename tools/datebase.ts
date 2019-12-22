import Loki from 'lokijs';

const db = new Loki('./datebase.db', {
    autoloadCallback: databaseInitialize,
    autoload: true,
    autosave: true,
    autosaveInterval: 4000
});

function databaseInitialize() {
    let tgIds = db.getCollection("tgIds");
    if (!tgIds) {
        tgIds = db.addCollection(
            "tgIds",
            { indices: ['tgId', 'twitter', 'oauthAccessToken', 'oauthAccessTokenSecret'] }
        );
    }
}

export default db;
//console.log(tgIds.data);
