import Fs from 'fs';
import { Config } from '../interface';

function getConfig(path = './config.json'): Config {
    const file = Fs.readFileSync(path, 'utf-8');
    return JSON.parse(file);
}

export default getConfig;