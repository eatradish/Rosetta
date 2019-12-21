import Oauth from 'oauth';

class AsyncOauth extends Oauth.OAuth {
    public getOAuthRequestTokenAsync(): any {
        return new Promise((resolve, reject) => {
            this.getOAuthRequestToken((err, oauthToken, oauthTokenSecret) => {
                if (err) reject(err);
                else resolve({ oauthToken, oauthTokenSecret });
            });
        });
    }

    public getOAuthAccessTokenAsync(oauthRequestToken: any,
        oauthRequestTokenSecret: any,
        oauthAccessVerifier: any): any {
        return new Promise((resolve, reject) => {
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

    public getAsync(url: string, oauthToken: string, oauthTokenSecret: string): any {
        return new Promise((resolve, reject) => {
            this.get(url, oauthToken, oauthTokenSecret, (err, data) => {
                if (err) reject(err);
                else resolve(data);
            });
        });
    }
}

export default AsyncOauth;