<script>
  export default {
    toCapitalize (str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
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