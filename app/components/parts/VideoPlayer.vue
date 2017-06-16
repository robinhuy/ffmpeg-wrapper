<template>
    <div>
        <video controls style="width: 100%">
            <source :src="videoSource" :type="videoType">
        </video>
    </div>
</template>

<script>
  export default {
    name: 'video-player',
    props: ['videoSource', 'videoType']
  }

</script>
