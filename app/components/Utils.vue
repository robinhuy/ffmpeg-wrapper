<script>
  export default {
    toCapitalize (str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    },
    convertTime (seconds) {
      if (seconds < 60) {
        return '00:00:' + ('0' + Math.floor(seconds)).slice(-2)
      } else if (seconds < 3600) {
        return '00:' + ('0' + Math.floor(seconds / 60)).slice(-2) + ':' + ('0' + Math.floor(seconds % 60)).slice(-2)
      } else {
        return Math.floor(seconds / 3600) + ':' + ('0' + Math.floor(seconds % 3600 / 60)).slice(-2) + ':' + ('0' + Math.floor(seconds % 60)).slice(-2)
      }
    },
    notify (message) {
      if (!remote.BrowserWindow.getFocusedWindow()) {
        notifyDesktop('FFMPEG WRAPPER', message)
      } else {
        alert(message)
      }
    }
  }
</script>