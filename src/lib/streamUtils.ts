export const getStreamUrl = (player: any) => {
    if (player.main_platform === 'twitch' && player.twitch_stream_link) {
        const channel = player.twitch_stream_link.split('/').pop();
        return `https://player.twitch.tv/?channel=${channel}&parent=${window.location.hostname}`;
    }
    if (player.main_platform === 'vk' && player.vk_stream_link) {
        const channel = player.vk_stream_link.split('/').pop();
        return `https://live.vkvideo.ru/app/embed/${channel}`;
    }
    if (player.main_platform === 'kick' && player.kick_stream_link) {
        const channel = player.kick_stream_link.split('/').pop();
        return `https://player.kick.com/${channel}?autoplay=false`;
    }
    return null;
};

export const getDirectStreamUrl = (player: any) => {
    if (player.main_platform === 'twitch' && player.twitch_stream_link) {
        return player.twitch_stream_link;
    }
    if (player.main_platform === 'vk' && player.vk_stream_link) {
        return player.vk_stream_link;
    }
    if (player.main_platform === 'kick' && player.kick_stream_link) {
        return player.kick_stream_link;
    }
    return null;
};

export const getStreamPlatform = (player: any) => {
    if (player.main_platform === 'twitch') return 'Twitch';
    if (player.main_platform === 'vk') return 'VK Video';
    if (player.main_platform === 'kick') return 'Kick';
    return 'Unknown';
};

export const getChatUrl = (player: any) => {
    if (player.main_platform === 'twitch' && player.twitch_stream_link) {
        const channel = player.twitch_stream_link.split('/').pop();
        return `https://www.twitch.tv/embed/${channel}/chat?parent=${window.location.hostname}&darkpopout`;
    }
    if (player.main_platform === 'vk' && player.vk_stream_link) {
        const channel = player.vk_stream_link.split('/').pop();
        return `https://widgets.live.vkvideo.ru/web-view/${channel}/chat`;
    }
    if (player.main_platform === 'kick' && player.kick_stream_link) {
        const channel = player.kick_stream_link.split('/').pop();
        return `https://kick.com/popout/${channel}/chat`;
    }
    return null;
};

export const hasStream = (player: any) => {
    if (player.main_platform === 'twitch') return !!player.twitch_stream_link;
    if (player.main_platform === 'vk') return !!player.vk_stream_link;
    if (player.main_platform === 'kick') return !!player.kick_stream_link;
    return false;
};
