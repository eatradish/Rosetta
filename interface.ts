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