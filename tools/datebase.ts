import DataStore from 'lokijs';

const db = new DataStore('../datebase.db');

const tgIds = db.addCollection(
    'tgIds', 
    { indices: ['tgId', 'twitter', 'oauthAccessToken', 'oauthAccessTokenSecret'] }
);

export default tgIds;