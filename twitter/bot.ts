import AsyncOauth from '../tools/asyncOauth';
import Config from '../tools/getConfig';
import { User } from '../interface';

class Twitter {
    private consumer: AsyncOauth;
    private user: User;
    private oauthAccessToken: string;
    private oauthAccessTokenSecret: string;
    private url = 'https://api.twitter.com/1.1';

    public constructor(user: User) {
        const config = Config();

        const consumerKey = config.twitter.consumer_key;
        const consumerSecret = config.twitter.consumer_secret;

        this.consumer = new AsyncOauth(
            "https://twitter.com/oauth/request_token",
            "https://twitter.com/oauth/access_token",
            consumerKey,
            consumerSecret,
            "1.0A",
            "http://localhost:8080/session/callback",
            "HMAC-SHA1",
        );

        this.user = user;
        this.oauthAccessToken = user.oauthAccessToken;
        this.oauthAccessTokenSecret = user.oauthAccessTokenSecret;
    }

    public async tweet(text: string) {
        try {
            const body = { status: text };
            const data = await this.consumer.postAsync(
                this.url + "/statuses/update.json",
                this.oauthAccessToken,
                this.oauthAccessTokenSecret,
                body,
                'application/json'
            );
            const json = JSON.parse(data);
            if (json.id_str) {
                return `Success~ your tweet link: https://twitter.com/${json.user.screen_name}/status/${json.id_str}`;               
            }
        } catch (err) {
            throw new Error(err.message);
        }
    }

    public async getTweet(id: string) {
        try {
            const tweet = await this.consumer.getAsync(
                this.url + `/statuses/show.json?id=${id}&`,
                this.oauthAccessToken,
                this.oauthAccessTokenSecret
            )
            if (tweet) return JSON.parse(tweet);
        } catch (err) {
            throw new Error(err.message);
        }
    }
}

export default Twitter;