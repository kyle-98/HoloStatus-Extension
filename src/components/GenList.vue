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

    <!-- Hololive title image -->
    <img src="../assets/hololive_logo.png" style="width:250px;height:80px;margin-bottom:10px;">

    <!-- Channels List -->
    <ScrollPanel class="scroll-panel">
        <!-- Skeleton template used to indicate loading -->
        <Skeleton v-if="loading" class="gen-list-loading"></Skeleton>

        <!-- Main display dropdowns of all channels separated by gens -->
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

                                    <!-- Tag to store the current state of the channel -->
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

                                <!-- Thumbnail and title (Displayed if the channel is currently live) -->
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

    <!-- Loading Card (This will be shown when the extension is loading and will display what channel is being fetched in real time) -->
    <Card v-if="loading" style="background-color: transparent;border-color:transparent;box-shadow:none;">
        <template #title>
            <div class="loading-info">
                <p class="loading-static-text">Loading Channel -></p>
                <p class="loading-channel-text"> {{ currLoadingChannel }}</p>

            </div>
        </template>
    </Card>

    <!-- Reload button -->
    <Button icon="pi pi-refresh" @click="reloadData" label="Reload" severity="secondary" class="reload-btn" />
    
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
    import Skeleton from 'primevue/skeleton';
    import Card from 'primevue/card';

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
            Skeleton,
            Card
        },
        data() {
            const currLoadingChannel = ref(''); // Store the current channel the extension is fetching the status of so it can be displayed
            const cacheDate = ref(); // Store the date of the last cache storage event so it can be displayed

            return {
                hololiveChannels,
                loading: true,
                currLoadingChannel,
                cacheDate
            };
        },
        setup() {
            const toast = useToast();

            return {
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

            // Call the checkIfLive function from youtubeData.ts to get the live status of the channels
            async loadChannels() {
                // Loop through the gens
                for (let genName in this.hololiveChannels) {
                    // Get a list of all channels in the specified gen
                    let channelsList = this.hololiveChannels[genName];
                    // Loop through the channels in the gen and use the channel id provided to get the current live status of the channel
                    for (let channel of channelsList) {
                        this.currLoadingChannel = channel.name;
                        channel.status = await this.checkStatus(channel.channelId);
                    }
                }
                this.currLoadingChannel = '';
                this.cacheChannelData(); // Cache the loaded data into hololiveCache in browser cache
                this.loading = false;
            },

            // Load cached channels if they exist
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

            // Cache fetched channel data in hololiveCache in browser storage
            cacheChannelData() {
                const dataToCache = {};
                // loop through all the gens and map their status -> name
                for (let gen in this.hololiveChannels) {
                    dataToCache[gen] = this.hololiveChannels[gen].map(channel => ({
                        status: channel.status
                    }));
                }
                localStorage.setItem('hololiveCache', JSON.stringify(dataToCache));
            },

            // reload the data stored in the extension
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

    .loading-info {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
    }

</style>
