import Oauth from 'oauth';
import Koa from 'koa';
import KoaRouter from 'koa-router';
import Config from './tools/getConfig';
import Sleep from './tools/sleep';
import tgIds from './tools/datebase';
import tgBot from './telegram/bot';

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

let tgId = '';

app.use(async (ctx, next) => {
    console.log(`Process ${ctx.request.method} ${ctx.request.url}...`);
    await next();
});

router.get('/session/connect', async (ctx, next) => {
    if (ctx.request.query.tgId) tgId = ctx.request.query.tgId;
    consumer.getOAuthRequestToken((err, oauthToken, oauthTokenSecret) => {
        if (err) ctx.body = 'GET /session/connect failed';
        else {
            oauthRequestToken = oauthToken;
            oauthRequestTokenSecret = oauthTokenSecret;
            ctx.response.redirect('https://twitter.com/oauth/authorize?oauth_token=' + oauthRequestToken);
        }
    });
    await Sleep(1000);
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
    await Sleep(1000);
    await next();
});

router.get('/', async (ctx, next) => {
    consumer.get(
        "https://api.twitter.com/1.1/account/verify_credentials.json",
        oauthAccessToken,
        oauthAccessTokenSecret,
        async (err, data) => {
            if (err) ctx.response.redirect('/session/connect');
            else {
                if (data && typeof data === 'string') {
                    try {
                        const json = JSON.parse(data);
                        const twitter = json.id_str;
                        tgIds.insert({ tgId, twitter, oauthAccessToken, oauthAccessTokenSecret });
                        await Sleep(1000);
                        tgBot.telegram.sendMessage(Number(tgId), `Hi, ${json.name}`);
                        ctx.body = 'Success!';
                    } catch (err) {
                        ctx.body = err;
                    }
                }
            }
        });
    await Sleep(1000);
    await next();
});

app.use(router.routes());
app.use(router.allowedMethods());
app.listen(8080);