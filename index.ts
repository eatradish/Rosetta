import Oauth from 'oauth';
import Koa from 'koa';
import KoaRouter from 'koa-router';
import Config from './tools/getConfig';

const config = Config();

const consumerKey = config.twitter.consumer_key;
const consumerSecret = config.twitter.consumer_secret;

const consumer = new Oauth.OAuth(
    "https://twitter.com/oauth/request_token",
    "https://twitter.com/oauth/access_token",
    consumerKey,
    consumerSecret,
    "1.0A",
    "http://localhost:8080/session/callback",
    "HMAC-SHA1",
);

const app = new Koa();
const router = new KoaRouter();

let oauthRequestToken = '';
let oauthRequestTokenSecret = '';
let oauthAccessToken = '';
let oauthAccessTokenSecret = '';

app.use(async (ctx, next) => {
    console.log(`Process ${ctx.request.method} ${ctx.request.url}...`);
    await next();
});

router.get('/session/connect', async (ctx, next) => {
    consumer.getOAuthRequestToken((err, oauthToken, oauthTokenSecret) => {
        if (err) ctx.body = 'GET /session/connect failed';
        else {
            oauthRequestToken = oauthToken;
            oauthRequestTokenSecret = oauthTokenSecret;
            ctx.response.redirect('https://twitter.com/oauth/authorize?oauth_token=' + oauthRequestToken);
        }
    });
    await sleep(1000);
    await next();
});

router.get('/session/callback', async (ctx, next) => {
    let oauthAccessVerifier;
    const params = ctx.request.query;
    if (params.oauth_verifier) oauthAccessVerifier = params.oauth_verifier;
    consumer.getOAuthAccessToken(
        oauthRequestToken,
        oauthRequestTokenSecret,
        oauthAccessVerifier,
        (err, _oauthAccessToken, _oauthAccessTokenSecret) => {
            if (err) ctx.body = 'GET /session/callback failed';
            else {
                oauthAccessToken = _oauthAccessToken;
                oauthAccessTokenSecret = _oauthAccessTokenSecret;
                ctx.response.redirect('/');
            }
        });
    await sleep(1000);
    await next();
});

router.get('/', async (ctx, next) => {
    consumer.get(
        "https://api.twitter.com/1.1/account/verify_credentials.json",
        oauthAccessToken,
        oauthAccessTokenSecret,
        (err, data) => {
            if (err) {
                console.log(err);
                ctx.response.redirect('/session/connect');
            }
            else {
                ctx.body = data;
            }
        });
    await sleep(1000);
    await next();
});

app.use(router.routes());
app.use(router.allowedMethods());
app.listen(8080);

function sleep(ms: number) {
    return new Promise((res) => {
        setTimeout(res, ms);
    });
}