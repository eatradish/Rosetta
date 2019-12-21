import DataStore from './AsyncLoki';
import Sleep from './sleep';


const db = new DataStore('../datebase.db');

const load = async () => {
    await db.loadDatabaseAsync();
};

load();

let tgIds = db.getCollection('tgIds');
if (!tgIds) {
    tgIds = db.addCollection(
        'tgIds', 
        { indices: ['tgId', 'twitter', 'oauthAccessToken', 'oauthAccessTokenSecret'] }
    );
}
//tgIds.insert( { tgId: '123', twitter: '456', oauthAccessToken: '789', oauthAccessTokenSecret: '111' } );
//console.log(tgIds.data);
const save = async () => {
    await db.saveDatabaseAsync();
};

save();

export default tgIds;