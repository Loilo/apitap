import alias from 'rollup-plugin-alias'
import uglify from 'rollup-plugin-uglify'

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/browser.esm.min.js',
    format: 'es'
  },
  plugins: [
    alias({
      '@debugger': './log.browser.js'
    }),
    uglify()
  ]
}
