export async function checkIfLive(channelID: string) {
    try {
        const response = await fetch(`https://youtube.com/channel/${channelID}/live`);
        const text = await response.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        const canonicalURLTag = doc.querySelector('link[rel="canonical"]');
        if (canonicalURLTag === null || canonicalURLTag === undefined) {
            return { live: false };
        }

        const canonicalURL = canonicalURLTag.getAttribute('href');

        if (!canonicalURL) {
            return { live: false };
        }

        const isLive = canonicalURL.includes('/watch?v=');

        if(isLive){
            const match = text.match(/var ytInitialPlayerResponse =([\s\S]*?);var meta =/);
            if(match === null || match === undefined){
                console.error('MATCH NOT FOUND');
                return { live: false };
            }
    
            const jsonText = match[1].trim();
            const json = JSON.parse(jsonText);
            console.log(json);
            
            const isOffline = json.playabilityStatus.status === "LIVE_STREAM_OFFLINE";
    
            if(isOffline) {
                return { live: false };
            }
    
            const title = json.videoDetails.title;
            const preview = json.videoDetails.thumbnail.thumbnails[0].url;
            const videoID = json.videoDetails.videoId;
    
            return {
                live: true,
                videoID,
                title,
                preview
            };
        }
        else {
            return { live: false };
        }

        


        // const parser = new DOMParser();
        // const doc = parser.parseFromString(text, 'text/html');
        // console.log(channelID);
        // console.log(doc.documentElement.outerHTML);

        // const canonicalURLTag = doc.querySelector('link[rel="canonical"]');

        // if (!canonicalURLTag) {
        //     console.log("Error: Could not find canonical link.");
        //     return { live: false };
        // }

        // const canonicalURL = canonicalURLTag.getAttribute('href');

        // if (!canonicalURL) {
        //     return { live: false };
        // }

        // const offlineText = doc.querySelector('.ytp-offline-slate-main-text');
        // console.log(offlineText);
        // const liveInLabel = doc.querySelector('[aria-label^="Live in "]');

        // if(offlineText){
        //     if (offlineText.textContent?.trim() !== '' || liveInLabel){
        //         return { live: false };
        //     }
        // }

        // const live = canonicalURL.includes('/watch?v=');

        // const upcomingStreamIndicator = doc.querySelector('div.yt-live-upcoming');
        // if (upcomingStreamIndicator) {
        //     return { live: false };
        // }

        // if (live) {
        //     const videoID = canonicalURL.split('/watch?v=')[1];

        //     const preview = `https://i.ytimg.com/vi/${videoID}/hqdefault.jpg`;

        //     const titleTag = doc.querySelector('title');
        //     let title = titleTag?.textContent?.trim() || '';

        //     return {
        //         live: true,
        //         videoID,
        //         title,
        //         preview
        // //     };
        // } else {
        //     return { live: false };
        // }
    } catch (error) {
        console.error("Error fetching or parsing the channel's live page:", error);
        return { live: false };
    }
};
