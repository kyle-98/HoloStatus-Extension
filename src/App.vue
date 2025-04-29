<template>
    <GenList class="main-view"/>
</template>

<script>
    import GenList from './components/GenList.vue';

    export default {
        name: 'App',
        components: {
            GenList
        }
    }

</script>
    
<style scoped>
    .main-view {
        min-width: 500px;
        max-width: 500px;
    }
</style>
