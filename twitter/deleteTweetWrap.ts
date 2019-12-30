import Twitter from './bot';
import { TwitterResponse } from './interface';

export async function deleteTweetByDay(twitter: Twitter, day: number): Promise<TwitterResponse[]> {
    const user = twitter.user;
    const deleteTweetList = [];
    try {
        const now = Date.now();
        const timeline = await twitter.getUserTimeline(user.username);
        for (let i = 0; i < timeline.length; i++) {
            if (timeline[i].created_at && now - new Date(timeline[i].created_at).getTime() <= day * 86400000) {
                deleteTweetList.push(await twitter.deleteTweet(timeline[i].id_str));
            }
        }
        return deleteTweetList;
    } catch (err) {
        throw err;
    }
}

export async function deleteTweetByCount(twitter: Twitter, count: number): Promise<TwitterResponse[]> {
    const user = twitter.user;
    const deleteTweetList = [];
    try {
        const timeline = await twitter.getUserTimeline(user.username);
        for (let i = 0; i < timeline.length; i++) {
            if (timeline[i].created_at && i <= count) {
                deleteTweetList.push(await twitter.deleteTweet(timeline[i].id_str));
            }
        }
        return deleteTweetList;
    } catch (err) {
        throw err;
    }
}

export async function deleteAllTweet(twitter: Twitter): Promise<TwitterResponse[]> {
    const user = twitter.user;
    const deleteTweetList = [];
    try {
        while (true) {
            const timeline = await twitter.getUserTimeline(user.username);
            if (timeline.length === 0) return deleteTweetList;
            else {
                for (let i = 0; i < timeline.length; i++) {
                    if (timeline[i].created_at) {
                        deleteTweetList.push(await twitter.deleteTweet(timeline[i].id_str));
                    }
                }
            }
        }
    } catch (err) {
        throw err;
    }
}