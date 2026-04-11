import core from '@actions/core'
import tc from '@actions/tool-cache'
import io from '@actions/io'
import cache from '@actions/cache'
import exec from '@actions/exec'
import path from 'path'
import os from 'os'
import http from '@actions/http-client'
import fs from 'fs'

const input = {
  version: core.getInput('version', {required: true}).replace(/^[vV]/, ''),
}

async function runAction() {
  let version

  if (input.version.toLowerCase() === 'latest') {
    core.debug('Requesting latest Chamber version...')
    version = await getLatestVersion()
    core.debug(`Latest version: ${version}`)
  } else {
    version = input.version
  }

  core.startGroup('Install Chamber')
  await doInstall(version)
  core.endGroup()

  core.startGroup('Installation check')
  await doCheck()
  core.endGroup()
}

/**
 * @param {string} version
 */
async function doInstall(version) {
  const pathToInstall = path.join(os.tmpdir(), `chamber-${version}`)
  const cacheKey = `chamber-cache-${version}-${process.platform}-${process.arch}`

  core.info(`Version to install: ${version} (target directory: ${pathToInstall})`)

  let restoredFromCache = undefined

  try {
    restoredFromCache = await cache.restoreCache([pathToInstall], cacheKey)
  } catch (e) {
    core.warning(e)
  }

  if (restoredFromCache) {
    core.info(`Chamber restored from cache`)
  } else {
    const distUri = getDistUrl(process.platform, process.arch, version)
    const distPath = await tc.downloadTool(distUri)
    const binName = process.platform === 'win32' ? 'chamber.exe' : 'chamber'

    await io.mkdirP(pathToInstall)
    const destPath = path.join(pathToInstall, binName)
    await io.mv(distPath, destPath)
    fs.chmodSync(destPath, 0o755)

    try {
      await cache.saveCache([pathToInstall], cacheKey)
    } catch (e) {
      core.warning(e)
    }
  }

  core.addPath(pathToInstall)
}

async function doCheck() {
  const binPath = await io.which('chamber', true)

  if (binPath === '') {
    throw new Error('chamber binary file not found in $PATH')
  }

  await exec.exec('chamber', ['version'], {silent: true})

  core.setOutput('chamber-bin', binPath)
  core.info(`Chamber installed: ${binPath}`)
}

/**
 * @returns {Promise<string>}
 */
async function getLatestVersion() {
  const resp = await new http.HttpClient('allixsenos/install-chamber', undefined, {
    allowRedirects: false,
  }).get('https://github.com/segmentio/chamber/releases/latest')

  if (resp.message.statusCode !== 302) {
    throw new Error(`Failed to fetch latest version: ${resp.message.statusCode} ${resp.message.statusMessage}`)
  }

  const location = resp.message.headers.location.replace(/^https?:\/\//, '')
  const parts = location.split('/')

  if (parts.length < 6) {
    throw new Error(`Invalid redirect URL: ${location}`)
  }

  return parts[5].replace(/^[vV]/, '')
}

/**
 * Chamber releases are plain binaries named: chamber-v{version}-{platform}-{arch}
 * @link https://github.com/segmentio/chamber/releases
 *
 * @param {('linux'|'darwin'|'win32')} platform
 * @param {('x32'|'x64'|'arm'|'arm64')} arch
 * @param {string} version
 * @returns {string}
 */
function getDistUrl(platform, arch, version) {
  const baseUrl = `https://github.com/segmentio/chamber/releases/download/v${version}`
  const platformName = platform === 'win32' ? 'windows' : platform

  let archName
  switch (arch) {
    case 'x64':
      archName = 'amd64'
      break
    case 'arm64':
      archName = 'arm64'
      break
    default:
      throw new Error(`Unsupported architecture: ${arch}`)
  }

  const ext = platform === 'win32' ? '.exe' : ''

  return `${baseUrl}/chamber-v${version}-${platformName}-${archName}${ext}`
}

;(async () => {
  await runAction()
})().catch(error => {
  core.setFailed(error.message)
})
