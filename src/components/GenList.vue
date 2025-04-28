<template>

    <!-- Chanenls List -->
    <ScrollPanel class="scroll-panel">
        <Accordion class="gen-list" v-if="!loading" :multiple="true">
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

            <FloatLabel variant="on">
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

    import 'primeicons/primeicons.css'; 

    import { hololiveChannels } from '../data/holoChannels.ts';
    import { checkIfLive, getApiKey, saveApiKey } from '../api/youtubeAPI.ts';

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
            InputText
        },
        data() {
            return {
                hololiveChannels,
                loading: true
            };
        },
        setup() {
            const settingsPopup = ref();
            const inputApiKey = ref('');
            const apiKey = ref(null);

            const toggleSettings = (event) => {
                settingsPopup.value.toggle(event);
            };

            return {
                settingsPopup,
                toggleSettings,
                apiKey,
                inputApiKey
            };
        },
        async created() {
            this.apiKey = await getApiKey();
            if(this.apiKey !== null) {
                this.inputApiKey = this.apiKey;
                for (let genName in this.hololiveChannels) {
                    let channelsList = this.hololiveChannels[genName];
                    for (let channel of channelsList) {
                        channel.status = await this.checkStatus(channel.channelId);
                    }
                    this.loading = false;
                }
            }
            else { 
                console.log('no api key found');
            }
           
        },
        methods: {
            async checkStatus(channelId) {
                return await checkIfLive(channelId);
            },
            async saveSettings(){
                const response = await saveApiKey(this.inputApiKey);
                if(response.status === 'success'){
                    console.log('done');
                    await this.loadChannels();
                }
                else {
                    console.error(response.errorReason);
                }
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
        width: 85px;
        height: 50px;
        margin-right: 10px;
    }

    .channel-icon-notlive {
        width: 60px;
        height: 50px;
        margin-right: 10px;
    }


    .gen-list { 
        min-width: 500px;
        max-width: 500px;
    }

    .live-container {
        display: flex;
        flex-direction: column;
        align-items: center;
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

</style>
