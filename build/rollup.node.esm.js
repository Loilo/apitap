import alias from 'rollup-plugin-alias'

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/node.esm.mjs',
    format: 'es'
  },
  plugins: [
    alias({
      '@debugger': './log.node.js'
    })
  ]
}
