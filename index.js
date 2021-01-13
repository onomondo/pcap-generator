module.exports = configure({})

function configure (_opts) {
  const isNode = typeof global === 'object'
  const bufferExists = _opts.Buffer || isNode

  if (!bufferExists) {
    return () => {
      throw new Error('pcap-generator needs a Buffer to run')
    }
  }

  const Buffer = _opts.Buffer || global.Buffer
  const opts = {
    majorVersion: _opts.majorVersion || 2,
    minorVersion: _opts.minorVersion || 4,
    gmtOffset: _opts.gmtOffset || 0,
    timestampAccuracy: _opts.timestampAccuracy || 0,
    snapshotLength: _opts.snapshotLength || 65535,
    linkLayerType: _opts.linkLayerType || 101
  }

  function generate(packets) {
    const globalHeader = Buffer.alloc(24)
    globalHeader.writeUInt32BE(2712847316, 0) // 4
    globalHeader.writeUInt16BE(opts.majorVersion, 4) // 2
    globalHeader.writeUInt16BE(opts.minorVersion, 6) // 2
    globalHeader.writeInt32BE(opts.gmtOffset, 8) // 4
    globalHeader.writeUInt32BE(opts.timestampAccuracy, 12) // 4
    globalHeader.writeUInt32BE(opts.snapshotLength, 16) // 4
    globalHeader.writeUInt32BE(opts.linkLayerType, 20) // 4

    packets = packets.map(packet => {
      const packetHeader = Buffer.alloc(16)
      const isTimestampMicroPrecision = isMicroseconds(packet.timestamp)
      const [seconds, microseconds] = isTimestampMicroPrecision
        ? String(packet.timestamp).split('.').map(str => Number(str))
        : [Math.floor(packet.timestamp / 1000), Math.floor(((packet.timestamp / 1000) % 1) * 1000000)]
      const addToSeconds = isTimestampMicroPrecision ? Math.floor(microseconds / 1000000) : 0
      packetHeader.writeUInt32BE(seconds + addToSeconds, 0) // 4 - if in microsecond precision then increase seconds if microsecond is above 1,000,000 (see documentation)
      packetHeader.writeUInt32BE(microseconds % 1000000, 4) // 4 - if in microsecond precision then microseconds has to be below 1,000,000 (see documentation)
      packetHeader.writeUInt32BE(packet.buffer.length, 8) // 4
      packetHeader.writeUInt32BE(packet.buffer.length, 12) // 4

      return Buffer.concat([packetHeader, packet.buffer])
    })

    const packetsBuffer = Buffer.concat(packets)
    return Buffer.concat([globalHeader, packetsBuffer])
  }

  generate.configure = configure

  return generate
}

function isMicroseconds (ts) {
  return ts % 1 !== 0
}
