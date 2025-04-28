/// <reference types="chrome" />
/// <reference types="firefox-webext-browser" />

import { storageApi } from '../api/browserApi';

export async function checkIfLive(channelId: string) {
  try {
    // const response = await fetch(
    //   `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&eventType=live&type=video&key=${apiKey}`
    // );

    // const data = await response.json();

    // if (data.items.length > 0) {
    //   return {
    //     live: true,
    //     title: data.items[0].snippet.title,
    //     preview: data.items[0].snippet.thumbnails.default.url,
    //     videoID: data.items[0].id.videoId
    //   };
    // }

    return { live: false };
    // return { 
    //   live: true, 
    //   title: '【🤎】Good Laughs &amp; Good Byes !! 凸待ち ~',
    //   preview: 'https://i.ytimg.com/vi/0CxQ7XOVWZA/default_live.jpg',
    //   videoID: '0CxQ7XOVWZA'
    // };
  } catch (error) {
    console.error('Error checking live status:', error);
    return { live: false };
  }
};

export function getApiKey(): Promise<string | null> {
  return storageApi.get('holoStatusApiKey')
    .then((data) => {
      // console.log('Data from storage:', JSON.stringify(data, null, 2));
      
      if (data && data.holoStatusApiKey) {
        return data.holoStatusApiKey; 
      } else {
        return null;
      }
    })
    .catch((error) => {
      console.error('Error retrieving API key:', error);
      return null;
    });
};

export function saveApiKey(apiKey: string) {
  return new Promise((resolve, reject) => {
    storageApi.set({ holoStatusApiKey: apiKey })
      .then(() => {
        console.log('API Key saved successfully!');
        resolve({ status: 'success' });
      })
      .catch((error) => {
        console.error('Error saving API key:', error);
        reject({ status: 'error', errorReason: error} );
      });
  });
};
