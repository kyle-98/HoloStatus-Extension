export async function checkIfLive(input: string) {
    async function getChannelInfo(handle: string) {
        try {
            var text = '';
            if (handle.startsWith('@')){
                const response = await fetch(`https://www.youtube.com/${handle}`);
                text = await response.text();
            }
            else {
                const response = await fetch(`https://www.youtube.com/channel/${handle}`);
                text = await response.text();
            }
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');
            const ogImageTag = doc.querySelector('meta[property="og:image"]');
            const profilePic = ogImageTag ? ogImageTag.getAttribute('content') : null;
            const canonicalURLTag = doc.querySelector('link[rel="canonical"]');
            if (canonicalURLTag) {
                const canonicalURL = canonicalURLTag.getAttribute('href');
                if (canonicalURL) {
                    const match = canonicalURL.match(/\/channel\/([a-zA-Z0-9_-]+)/);
                    if (match) {
                        return {
                            channelId: match[1],
                            pfp: profilePic
                        };
                    }
                }
            }

            return {
                channelId: null,
                pfp: profilePic
            };
        } catch (error) {
            console.error("Error fetching or parsing the YouTube channel handle:", error);
            return {
                channelId: null,
                pfp: null
            };
        }
    }

    async function checkLiveStatus(channelId: string, pfp: string) {
        try {
            const response = await fetch(`https://youtube.com/channel/${channelId}/live`);
            const text = await response.text();
            
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');
            const canonicalURLTag = doc.querySelector('link[rel="canonical"]');
            if (canonicalURLTag === null || canonicalURLTag === undefined) {
                return { 
                    live: false,
                    profilePic: pfp 
                };
            }

            const canonicalURL = canonicalURLTag.getAttribute('href');
            if (!canonicalURL) {
                return { 
                    live: false,
                    profilePic: pfp 
                 };
            }

            const isLive = canonicalURL.includes('/watch?v=');
            if (isLive) {
                const match = text.match(/var ytInitialPlayerResponse =([\s\S]*?);var meta =/);
                if (match === null || match === undefined) {
                    console.error('MATCH NOT FOUND');
                    return { 
                        live: false,
                        profilePic: pfp 
                    };
                }

                const jsonText = match[1].trim();
                const json = JSON.parse(jsonText);
                
                const isOffline = json.playabilityStatus.status === "LIVE_STREAM_OFFLINE";
                if (isOffline) {
                    return { 
                        live: false,
                        profilePic: pfp  
                    };
                }

                const title = json.videoDetails.title;
                const preview = json.videoDetails.thumbnail.thumbnails[0].url;
                const videoID = json.videoDetails.videoId;

                return {
                    live: true,
                    videoID,
                    title,
                    preview,
                    profilePic: pfp
                };
            } else {
                return { 
                    live: false,
                    profilePic: pfp 
                };
            }
        } catch (error) {
            console.error("Error fetching or parsing the live stream status:", error);
            return { 
                live: false,
                profilePic: pfp  
            };
        }
    }

    const channelInfo = await getChannelInfo(input);
    if (input.startsWith('@')) {
        const channelId = channelInfo.channelId ?? '';
        const channelPfp = channelInfo.pfp ?? '';
        if (channelInfo) {
            return checkLiveStatus(channelId, channelPfp);
        } else {
            return { live: false };
        }
    } else {
        const channelPfp = channelInfo.pfp ?? '';
        return checkLiveStatus(input, channelPfp);
    }
}
