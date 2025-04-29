<template>
    <Toast position="top-center" >
            <template #message="slotProps">
                <div class="toast-content-container">
                    <div class="toast-summary">
                        <span>{{ slotProps.message.summary }}</span>
                    </div>
                    <div class="toast-detail">{{ slotProps.message.detail }}</div>
                </div>
            </template>
        </Toast>

    <!-- Chanenls List -->
    <ScrollPanel class="scroll-panel">
        <Skeleton v-if="loading" class="gen-list-loading"></Skeleton>

        <Accordion class="gen-list" v-else-if="!loading" :multiple="true">
            <AccordionPanel v-for="(channelsList, genName) in hololiveChannels" :value="genName" :key="genName">
                <AccordionHeader>
                    {{ genName }}
                </AccordionHeader>
                <AccordionContent>
                    <DataView :value="channelsList" item-content-class="data-view-item">
                        <template #list="{ items }">
                            <div v-for="(item, idx) in items" :key="idx" class="channel-item">
                                <Avatar v-if="item.status !== undefined && item.status.live === true" :image="item.channelIcon" size="xlarge" alt="Channel Profile Picture" shape="circle" class="channel-icon-live"/>
                                <Avatar v-else-if="item.status !== undefined && item.status.live === false" :image="item.channelIcon" size="xlarge" alt="Channel Profile Picture" shape="circle" class="channel-icon-notlive"/>
                                <div class="channel-details">
                                    <div class="channel-name">{{ item.name }}</div>
                                    <div class="channel-status">
                                        <Tag class="live-tag" v-if="item.status !== undefined && item.status.live === false" severity="secondary" value="Offline"/>
                                        <Tag class="live-tag" v-else-if="item.status !== undefined && item.status.live === true" severity="success" value="Live"/>
                                        <Tag class="live-tag" v-else severity="warn" value="Error"/>
                                    </div>
                                </div>
                                <div class="live-info">
                                    <div class="live-container">
                                        <img v-if="item.status !== undefined && item.status.live === true" :src="item.status.preview" alt="Live Thumbnail" class="channel-thumbnail">
                                        <a v-if="item.status !== undefined && item.status.live === true" style="font-size: 10px;" :href="`https://www.youtube.com/watch?v=${item.status.videoID}`"> {{ item.status.title }} </a>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </DataView>
                </AccordionContent>
            </AccordionPanel>
        </Accordion>
    </ScrollPanel>


    <!-- Settings Stuff -->
    <Button
        icon="pi pi-cog"
        @click="toggleSettings"
        label="Settings"
        severity="contrast"
    />

    <Popover ref="settingsPopup">
        <div class="popover-container">
            <span class="settings-header">Settings</span>

            <FloatLabel variant="on" class="input-api-key">
                <InputText id="api-key-input" v-model="inputApiKey"/>
                <label for="api-key-input">Youtube API Key</label>
            </FloatLabel>

            <Button
                icon="pi pi-save"
                @click="saveSettings"
                label="Save"
            />

        </div>
    </Popover>
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
            FloatLabel,
            InputText,
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
        async mounted() {
            for (let genName in this.hololiveChannels) {
                let channelsList = this.hololiveChannels[genName];
                for (let channel of channelsList) {
                    channel.status = await this.checkStatus(channel.channelId);
                }
            }
            this.loading = false;
        },
        methods: {
            async checkStatus(channelId) {
                return await checkIfLive(channelId);
            },

            async saveSettings(){
               
            },

            async loadChannels() {
                for (let genName in this.hololiveChannels) {
                    let channelsList = this.hololiveChannels[genName];
                    for (let channel of channelsList) {
                        channel.status = await this.checkStatus(channel.channelId);
                    }
                    this.loading = false;
                }
            }
        }
    };
</script>

<style scoped>
    .scroll-panel {
        max-height: 450px;
        min-height: 450px;
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

    .input-api-key {
        margin-top: 15px;
        margin-bottom: 15px;
    }

    .settings-header {
        font-size: 20px;
        font-weight: bold;
    }

    #api-key-input {
        min-width: 405px;
        max-width: 405px;
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

</style>
