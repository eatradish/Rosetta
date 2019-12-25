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

    public async tweet(text: string): Promise<string> {
        try {
            const body = { status: text };
            const data = await this.consumer.postAsync(
                this.url + "/statuses/update.json",
                this.oauthAccessToken,
                this.oauthAccessTokenSecret,
                body,
                'application/json'
            );
            if (typeof data !== 'string') return 'cannot get tweet data';
            const json = JSON.parse(data);
            if (json.id_str) {
                return '' +
                    `Success~ your tweet link: https://twitter.com/${json.user.screen_name}/status/${json.id_str}`;
            } else {
                return 'failed';
            }
        } catch (err) {
            throw err;
        }
    }

    public async getNewMention(count?: number, sinceId?: number): Promise<any | any[]> {
        const countArg = count ? `count=${count}&` : '';
        const sinceIdArg = sinceId ? `since_id=${sinceId}&` : '';
        try {
            const data = await this.consumer.getAsync(
                this.url + `/statuses/mentions_timeline.json?${countArg}${sinceIdArg}`,
                this.oauthAccessToken,
                this.oauthAccessTokenSecret
            );
            if (typeof data !== 'string') return 'cannot get tweet data';
            const json = JSON.parse(data);
            return json;
        } catch (err) {
            throw err;
        }
    }

    public async replyToTweet(tweetId: string, tweetScreenName: string ,text: string): Promise<string> {
        try {
            const data = await this.consumer.postAsync(
                this.url + '/statuses/update.json',
                this.oauthAccessToken,
                this.oauthAccessTokenSecret,
                { in_reply_to_status_id: tweetId, status: `@${tweetScreenName} ${text}` },
                'application/json'
            );
            if (typeof data !== 'string') return 'cannot get tweet data';
            const json = JSON.parse(data);
            if (json.id_str) {
                return `Success~ your tweet link: https://twitter.com/${json.user.screen_name}/status/${json.id_str}`;
            } else {
                return 'failed';
            }
        } catch (err) {
            throw err;
        }
    }

    public async deleteTweet(tweetId: string) {
        try {
            const data = await  this.consumer.postAsync(
                this.url + `/statuses/destroy/${tweetId}.json`,
                this.oauthAccessToken,
                this.oauthAccessTokenSecret,
                null,
                'application/json'
            )
            if (typeof data !== 'string') return 'cannot get tweet data';
            const json = JSON.parse(data);
            if (data) return `Tweet https://twitter.com/${json.user.screen_name}/status/${tweetId} removed`;
            else return `cannot remove ${tweetId}`;
        } catch (err) {
            throw err;
        }
    }
}

export default Twitter;