import alias from 'rollup-plugin-alias'
import uglify from 'rollup-plugin-uglify'

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/browser.min.js',
    format: 'iife',
    name: 'apitap'
  },
  plugins: [
    alias({
      debug: './browser-log.js'
    }),
    uglify()
  ]
}
