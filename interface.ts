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
    username: string;
    password: string;
    tgId: string;
    twitter: string;
    oauthAccessToken: string;
    oauthAccessTokenSecret: string;
    timeRule: TimeRule[];
    blockRule: {}[];
}

export interface OAuthRequestValue {
    oauthRequestToken: string;
    oauthRequestTokenSecret: string;
}

export interface OAuthAccessValue {
    oauthAccessToken: string;
    oauthAccessTokenSecret: string;
}

export interface TimeRule {
    time: string;
    tweet: string;
    date: string;
    UTC: string;
}

export interface Mention {
    username: string;
    mention: string[][];
}