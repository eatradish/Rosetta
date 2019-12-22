function tgGetMessageArgs(message: string): string[] {
    return message.split(' ').slice(1);
}

export default tgGetMessageArgs;