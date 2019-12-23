import Oauth from 'oauth';
import { OAuthRequestValue, OAuthAccessValue } from '../interface';

class AsyncOauth extends Oauth.OAuth {
    public getOAuthRequestTokenAsync(): Promise<OAuthRequestValue> {
        return new Promise<OAuthRequestValue>((resolve, reject) => {
            this.getOAuthRequestToken((err, oauthRequestToken, oauthRequestTokenSecret) => {
                if (err) reject(err);
                else resolve({ oauthRequestToken, oauthRequestTokenSecret });
            });
        });
    }

    public getOAuthAccessTokenAsync(oauthRequestToken: string,
        oauthRequestTokenSecret: string,
        oauthAccessVerifier: string): Promise<OAuthAccessValue> {
        return new Promise<OAuthAccessValue>((resolve, reject) => {
            this.getOAuthAccessToken(
                oauthRequestToken,
                oauthRequestTokenSecret,
                oauthAccessVerifier,
                (err, oauthAccessToken, oauthAccessTokenSecret) => {
                    if (err) reject(err);
                    else resolve({ oauthAccessToken, oauthAccessTokenSecret });
                }
            )
        });
    }

    public getAsync(
        url: string,
        oauthAccessToken: string,
        oauthAccessTokenSecret: string
    ): Promise<string | Buffer | undefined> {
        return new Promise<string | Buffer | undefined>((resolve, reject) => {
            this.get(url, oauthAccessToken, oauthAccessTokenSecret, (err, data) => {
                if (err) reject(err);
                else resolve(data);
            });
        });
    }

    public postAsync(
        url: string,
        oauthAccessToken: string,
        oauthAccessTokenSecret: string,
        body?: any,
        connectType?: string
    ): Promise<string | Buffer | undefined> {
        return new Promise<string | Buffer | undefined>((resolve, reject) => {
            this.post(
                url,
                oauthAccessToken,
                oauthAccessTokenSecret,
                body,
                connectType,
                (err, data) => {
                    if (err) reject(err);
                    else resolve(data);
                });
        });
    }
}

export default AsyncOauth;