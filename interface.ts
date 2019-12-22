export interface Config {
    tgBotToken: string;
    twitter: {
        consumer_key: string;
        consumer_secret: string;
        access_token: string;
        access_token_secret: string;
        oauth_url: string;
    }
}

export interface User {
    tgId: string;
    twitter: string;
    oauthAccessToken: string;
    oauthAccessTokenSecret: string;
}