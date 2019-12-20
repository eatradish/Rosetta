function tgGetMessageArgs(message: string): String[] {
    return message.split(' ').slice(1);
}

export default tgGetMessageArgs;