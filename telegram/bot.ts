import Telegraf from 'telegraf';
import Config from '../tools/getConfig';
import getMessageArgs from '../tools/tgGetMessageArgs';
import Axios from 'axios';
const config = Config('../config.json');

const tgBot = new Telegraf(config.tgBotToken);

tgBot.command('login', async (ctx) => {
    const oauthUrl = await Axios.get('http://localhost:8080/session/connect');
    ctx.reply(`Please Open ${oauthUrl} authorize Rosetta`);
});

tgBot.launch();

export default tgBot;