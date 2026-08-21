#!/usr/bin/env node
/**
 * Release script — bumps version, commits, tags, and pushes in one step.
 *
 * Usage:  bun run release 1.1.0 --note "Added multistreaming capabilities"
 *         bun run release 1.1.0
 */
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { execSync } from 'child_process'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const ROOT  = resolve(__dir, '..')

const args    = process.argv.slice(2)
const version = args.find((a) => /^\d+\.\d+\.\d+(-[\w.]+)?$/.test(a))

let releaseNote = ''
const noteIdx = args.indexOf('--note')
if (noteIdx !== -1 && noteIdx + 1 < args.length) {
    releaseNote = args[noteIdx + 1]
}

if (!version) {
    console.error('Usage: bun run release <semver> [--note "release note"]')
    console.error('  e.g. bun run release 1.1.0 --note "Added multistreaming capabilities"')
    process.exit(1)
}

const tag = `v${version}`
const commitMsg = releaseNote || `release ${tag}`
console.log(`\n🚀  Releasing ${tag}${releaseNote ? ` — ${releaseNote}` : ''}\n`)

function patch(file, fn) {
    const abs  = resolve(ROOT, file)
    if (!existsSync(abs)) { console.log(`  (skip) ${file} — not found`); return }
    const orig = readFileSync(abs, 'utf-8')
    const next = fn(orig)
    if (next === orig) { console.log(`  (no change) ${file}`); return }
    writeFileSync(abs, next, 'utf-8')
    console.log(`  ✓ ${file}`)
}

function run(cmd) {
    return execSync(cmd, { cwd: ROOT, stdio: 'inherit' })
}

patch('package.json', (src) => {
    const pkg = JSON.parse(src)
    pkg.version = version
    return JSON.stringify(pkg, null, 2) + '\n'
})

patch('README.md', (src) =>
    src.replace(
        /release-v[\d]+\.[\d]+\.[\d]+[\w.-]*/g,
        `release-${tag}`
    ).replace(
        /version-[\d.]+-[\w]+\.svg/g,
        `version-${version}-22d3ee.svg`
    )
)

patch('public/releases.json', (src) => {
    const data = JSON.parse(src)
    if (data.current && data.current.version) {
        data.history = data.history || []
        data.history.unshift({ ...data.current })
    }
    data.current = { version, note: releaseNote || '' }
    return JSON.stringify(data, null, 2) + '\n'
})

writeFileSync(resolve(ROOT, 'public/release-info.json'), JSON.stringify({
    version,
    note: releaseNote || 'No note provided',
    date: new Date().toISOString(),
}, null, 2) + '\n')
console.log('  ✓ public/release-info.json')

try {
    run('git add -A')
    run(`git commit -m "${commitMsg.replace(/"/g, '\\"')}"`)
    run(`git tag ${tag}`)
    console.log(`\n📦  Committed and tagged ${tag}.`)
    run('git push && git push --tags')
    console.log(`\n✅  ${tag} pushed to remote.\n`)
} catch (e) {
    console.error('\n⚠️  Git step failed.')
    console.error(e.message)
    process.exit(1)
}
