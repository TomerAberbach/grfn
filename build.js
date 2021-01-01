import { gzip as gzipCb } from 'zlib'
import { promises as fs } from 'fs'
import { promisify } from 'util'
import { minify } from 'terser'

const UNITS = [`B `, `kB`, `MB`, `GB`]
function size(val = 0) {
  if (val < 1e3) {
    return `${val} ${UNITS[0]}`
  }
  const exp = Math.min(Math.floor(Math.log10(val) / 3), UNITS.length - 1) || 1
  let out = (val / 1e3 ** exp).toPrecision(3)
  const idx = out.indexOf(`.`)
  if (idx === -1) {
    out += `.00`
  } else if (out.length - idx - 1 !== 2) {
    // 2 + 1 for 0-based
    out = `${out}00`.substring(0, idx + 3)
  }
  return `${out} ${UNITS[exp]}`
}

const gzip = promisify(gzipCb)

const files = [`debug.js`, `index.js`, `validate.js`]
const build = async () => {
  try {
    await fs.mkdir(`./dist`)
  } catch {}
  const { terser } = JSON.parse(
    (await fs.readFile(`./package.json`)).toString(`utf8`)
  )

  const queue = []

  await Promise.all(
    files.map(async file => {
      const source = (await fs.readFile(`./src/${file}`)).toString(`utf8`)
      const minified = (await minify(source, terser)).code

      queue.push(
        file,
        `Size: ${size(minified.length)}`,
        `Size (gzip): ${size((await gzip(minified)).length)}`,
        ``
      )

      await fs.writeFile(`./dist/${file}`, minified)
    })
  )

  for (const a of queue) {
    console.log(a)
  }
}

build()
