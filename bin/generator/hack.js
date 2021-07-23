

function hackForClient(editor) {
  // 1 remove ssr
  // remove title
  editor = editor.replace(/<title>([\S\s]*?)<\/title>/, "")

  // remove faviconImgPath
  editor = editor.replace(/<link([\S\s]*?)faviconImgPath([\S\s]*?)\/>/, "")
  
  // remove suanpanSdkCSSPath
  editor = editor.replace(/<link([\S\s]*?)suanpanSdkCSSPath([\S\s]*?)%>([\S\s]*?)>/, "")

  
  // remove loadingImgPath
  editor = editor.replace(/<img([\S\s]*?)loadingImgPath([\S\s]*?)\/>/, "")
  
  // remove appConfig
  editor = editor.replace(/window.appConfig\s*=\s*{([\S\s]*?)};/, "")
  
  // remove suanpanSdkPath
  editor = editor.replace(/<script src="<%- suanpanSdkPath %>"><\/script>/, "")

  // 2 add BASE_URL
  // <link>
  editor = editor.replace(/<link([\S\s]+?)href="assets([\S\s]+?)"([\S\s]*?)>/g, '<link$1href="<%= BASE_URL %>assets$2"$3>')

  // <script>
  editor = editor.replace(/<script([\S\s]+?)src="assets([\S\s]+?)"([\S\s]*?)>([\S\s]*?)<\/script>/g, '<script$1src="<%= BASE_URL %>assets$2"$3>$4</script>');

  return editor
}

module.exports = {
  hackForClient
}