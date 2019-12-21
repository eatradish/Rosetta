import Koa from 'koa';
import KoaRouter from 'koa-router';
import Config from './tools/getConfig';
import tgIds from './tools/datebase';
import tgBot from './telegram/bot';
import AsyncOauth from './tools/asyncOauth';
import Sleep from './tools/sleep';

const config = Config();

const consumerKey = config.twitter.consumer_key;
const consumerSecret = config.twitter.consumer_secret;

const consumer = new AsyncOauth(
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

let tgId = '';

app.use(async (ctx, next) => {
    console.log(`Process ${ctx.request.method} ${ctx.request.url}...`);
    await next();
});

router.get('/session/connect', async (ctx, next) => {
    if (ctx.request.query.tgId) tgId = ctx.request.query.tgId;
    try {
        const oauthRequest = await consumer.getOAuthRequestTokenAsync();
        if (oauthRequest.oauthToken && oauthRequest.oauthTokenSecret) {
            oauthRequestToken = oauthRequest.oauthToken;
            oauthRequestTokenSecret = oauthRequest.oauthTokenSecret;
            ctx.response.redirect('https://twitter.com/oauth/authorize?oauth_token=' + oauthRequestToken);
        } else {
            throw new Error('getOAuthRequestToken failed');
        }
    } catch (err) {
        ctx.body = err.message;
    }
    await next();
});

router.get('/session/callback', async (ctx, next) => {
    let oauthAccessVerifier;
    const params = ctx.request.query;
    if (params.oauth_verifier) oauthAccessVerifier = params.oauth_verifier;
    try {
        const oauthAccess = await consumer.getOAuthAccessTokenAsync(
            oauthRequestToken, 
            oauthRequestTokenSecret, 
            oauthAccessVerifier
        );
        oauthAccessToken = oauthAccess.oauthAccessToken;
        oauthAccessTokenSecret = oauthAccess.oauthAccessTokenSecret;
        ctx.response.redirect('/');
    } catch (err) {
        ctx.body = err.message;
    }
    await next();
});

router.get('/', async (ctx, next) => {
    try {
        const data = await consumer.getAsync(
            "https://api.twitter.com/1.1/account/verify_credentials.json",
            oauthAccessToken,
            oauthAccessTokenSecret
        );
        const json = JSON.parse(data);
        const twitter = json.id_str;
        tgIds.insert({ tgId, twitter, oauthAccessToken, oauthAccessTokenSecret });
        tgBot.telegram.sendMessage(Number(tgId), `Hi, ${json.name}`);
        ctx.body = 'Success!';
    } catch (err) {
        ctx.body = err.message;
    }
    await next();
});

app.use(router.routes());
app.use(router.allowedMethods());
app.listen(8080);