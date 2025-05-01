<template>
    <!-- Toast -->
    <Toast position="top-center">
        <template #message="slotProps">
            <div class="toast-content-container">
                <div class="toast-summary">
                    <span>{{ slotProps.message.summary }}</span>
                </div>
                <div class="toast-detail">{{ slotProps.message.detail }}</div>
            </div>
        </template>
    </Toast>

    <!-- <h1 class="header-text">Hololive Channels</h1> -->
    <img src="../assets/hololive_logo.png" style="width:250px;height:80px;margin-bottom:10px;">

    <!-- Channels List -->
    <ScrollPanel class="scroll-panel">
        <Skeleton v-if="loading" class="gen-list-loading"></Skeleton>

        <Accordion class="gen-list" v-else :multiple="true">
            <AccordionPanel v-for="(channelsList, genName) in hololiveChannels" :value="genName" :key="genName">
                <AccordionHeader>
                    {{ genName }}
                </AccordionHeader>
                <AccordionContent>
                    <DataView :value="channelsList" item-content-class="data-view-item">
                        <template #list="{ items }">
                            <div v-for="(item, idx) in items" :key="idx" class="channel-item">
                                <Avatar
                                    v-if="item.status?.live === true"
                                    :image="item.status.profilePic"
                                    size="xlarge"
                                    alt="Channel Profile Picture"
                                    shape="circle"
                                    class="channel-icon-live"
                                />
                                <Avatar
                                    v-else-if="item.status?.live === false"
                                    :image="item.status.profilePic"
                                    size="xlarge"
                                    alt="Channel Profile Picture"
                                    shape="circle"
                                    class="channel-icon-notlive"
                                />
                                <div class="channel-details">
                                    <div class="channel-name">{{ item.name }}</div>
                                    <div class="channel-status">
                                        <Tag
                                            class="live-tag"
                                            v-if="item.status?.live === false && item.alumn === false"
                                            severity="secondary"
                                            value="Offline"
                                        />
                                        <Tag
                                            class="live-tag"
                                            v-else-if="item.status?.live === true && item.alumn === false"
                                            severity="success"
                                            value="Live"
                                        />
                                        <Tag
                                            class="live-tag"
                                            v-else-if="item.alumn === true"
                                            severity="secondary"
                                        >
                                            <i class="pi pi-graduation-cap" style="margin-right: 0.5rem;"></i>
                                            Alumn
                                        </Tag>
                                        <Tag v-else class="live-tag" severity="warn" value="Error" />
                                    </div>
                                </div>
                                <div class="live-info">
                                    <div class="live-container">
                                        <img
                                            v-if="item.status?.live === true"
                                            :src="item.status.preview"
                                            alt="Live Thumbnail"
                                            class="channel-thumbnail"
                                        />
                                        <a
                                            v-if="item.status?.live === true"
                                            style="font-size: 10px"
                                            :href="`https://www.youtube.com/watch?v=${item.status.videoID}`"
                                            target="_blank"
                                        >
                                            {{ item.status.title }}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </DataView>
                </AccordionContent>
            </AccordionPanel>
        </Accordion>
    </ScrollPanel>

    <!-- Settings Button and Popover -->
    <!-- <div class="bottom-buttons"> -->
        <!-- <Button icon="pi pi-cog" @click="toggleSettings" label="Settings" severity="contrast" /> -->
    <Button icon="pi pi-refresh" @click="reloadData" label="Reload" severity="secondary" class="reload-btn" />
    <!-- </div> -->
    <!-- <Popover ref="settingsPopup">
        <div class="popover-container">
            <span class="settings-header">Settings</span>
            <Button icon="pi pi-save" @click="saveSettings" label="Save" />
        </div>
    </Popover> -->
</template>

<script>
import { ref } from 'vue';

import ScrollPanel from 'primevue/scrollpanel';
import Accordion from 'primevue/accordion';
import AccordionPanel from 'primevue/accordionpanel';
import AccordionHeader from 'primevue/accordionheader';
import AccordionContent from 'primevue/accordioncontent';
import DataView from 'primevue/dataview';
import Tag from 'primevue/tag';
import Avatar from 'primevue/avatar';
import Button from 'primevue/button';
import Popover from 'primevue/popover';
import FloatLabel from 'primevue/floatlabel';
import InputText from 'primevue/inputtext';
import Skeleton from 'primevue/skeleton';

import { useToast } from 'primevue/usetoast';

import 'primeicons/primeicons.css'; 

import { hololiveChannels } from '../data/holoChannels.ts';
import { checkIfLive } from '../api/youtubeData.ts';

export default {
    name: 'GenList',
    components: {
        ScrollPanel,
        Accordion,
        AccordionPanel,
        AccordionHeader,
        AccordionContent,
        DataView,
        Tag,
        Avatar,
        Button,
        Popover,
        Skeleton
    },
    data() {
        return {
            hololiveChannels,
            loading: true
        };
    },
    setup() {
        const settingsPopup = ref();
        const toast = useToast();

        const toggleSettings = (event) => {
            settingsPopup.value.toggle(event);
        };

        return {
            settingsPopup,
            toggleSettings,
            toast
        };
    },
    mounted() {
        this.loadCachedChannels();
    },
    methods: {
        async checkStatus(channelId) {
            return await checkIfLive(channelId);
        },

        // async saveSettings() {
        //     this.toast.add({
        //         severity: 'success',
        //         summary: 'Settings Saved',
        //         detail: 'Your settings have been saved.',
        //         life: 3000
        //     });
        // },

        async loadChannels() {
            for (let genName in this.hololiveChannels) {
                let channelsList = this.hololiveChannels[genName];
                for (let channel of channelsList) {
                    channel.status = await this.checkStatus(channel.channelId);
                }
            }
            this.cacheChannelData();
            this.loading = false;
        },

        async loadCachedChannels() {
            const cached = localStorage.getItem('hololiveCache');
            if (cached) {
                try {
                    const parsed = JSON.parse(cached);
                    for (let gen in this.hololiveChannels) {
                        const channelsList = this.hololiveChannels[gen];
                        for (let i = 0; i < channelsList.length; i++) {
                            channelsList[i].status = parsed[gen][i].status;
                        }
                    }
                    this.loading = false;
                    return;
                } catch (e) {
                    console.warn('Cache parsing failed. Loading live data instead.');
                }
            }
            this.loadChannels();
        },

        cacheChannelData() {
            const dataToCache = {};
            for (let gen in this.hololiveChannels) {
                dataToCache[gen] = this.hololiveChannels[gen].map(channel => ({
                    status: channel.status
                }));
            }
            localStorage.setItem('hololiveCache', JSON.stringify(dataToCache));
        },

        reloadData() {
            this.loading = true;
            this.loadChannels();
        }
    }
};
</script>

<style scoped>
    .scroll-panel {
        max-height: 400px;
        min-height: 400px;
    }

    .channel-icon-live {
        width: 100px;
        height: 50px;
        margin-right: 10px;
    }

    .channel-icon-notlive {
        width: 100px;
        height: 50px;
        margin-right: 10px;
    }


    .gen-list { 
        min-width: 500px;
        max-width: 500px;
        backdrop-filter: blur(14px);
        border-radius: 16px;
        border: 1px solid rgba(255, 255, 255, 0.25);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        padding: 0.5rem;
        overflow: hidden;
    }

    .gen-list-loading {
        min-width: 500px;
        max-width: 500px;
        min-height: 150px; 
        max-height: 150px; 
    }

    .live-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 165px;
        max-width: 165px;
    }

    .channel-item {
        display: flex;
        align-items: center;
        padding: 10px 0;
        border-bottom: 1px solid #ddd;
    }

    .channel-item:last-child {
        border-bottom: none;
    }

    .channel-thumbnail {
        width: 90px;
        height: 60px;
        margin-right: 10px;
        border-radius: 5px;
        margin-bottom: 10px;
    }

    .channel-details {
        display: flex;
        width: 100%;
    }

    .channel-name {
        font-weight: bold;
        margin-right: 10px;
    }

    .channel-status {
        font-size: 12px;
        color: #888;
    }

    .live-tag {
        font-size: 12px;
        padding: 1px 6px;
        border-radius: 6px;
    }

    /* Settings Menu */
    .popover-container {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .settings-header {
        font-size: 20px;
        font-weight: bold;
        margin-bottom: 10px;
    }

    /* Toast Notifications */
    .toast-content-container {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .toast-summary {
        font-size: 18px;
        font-weight: bold;
    }

    .bottom-buttons {
        display: flex;
        flex-direction: row;
        justify-content: center;
    }

    .reload-btn {
        margin-left: 10px;
        opacity: 0.9;
    }

    .header-text {
        font-size: 40px;
    }

</style>
