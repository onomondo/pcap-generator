# pcap-generator

Generate PCAP files from packets

```
# npm install pcap-generator
```

## Usage

`pcap-generator` can be used both in Node and in the browser. In Node.js it uses the native `Buffer` and in the browser you have to specify it by calling `.configure`

Note that it supports both miliseconds (timestamp is an integer) and microseconds (timestamp is a float).

### Node.js

``` js
const generator = require('pcap-generator')
const fs = require('fs')

const ipPackets = [{
  timestamp: Date.now(), // miliseconds
  buffer: Buffer.from('4500002d000000000011d0970a0a0a0a0b0b0b0b450000210019ffff7b2268656c6c6f223a22776f726c64227d', 'hex')
}]
const pcapFile = generator(ipPackets)

fs.writeFileSync('test.pcap', pcapFile)
console.log('Open test.pcap in Wireshark')
```

### Browser (in this example uses the `buffer` module)

``` js
import { Buffer } from 'buffer'
import { configure } from 'pcap-generator'

const generator = configure({ Buffer: Buffer })
const ipPackets = [{
  timestamp: 1802869.484431046, // microseconds
  buffer: Buffer.from('4500002d000000000011d0970a0a0a0a0b0b0b0b450000210019ffff7b2268656c6c6f223a22776f726c64227d', 'hex')
}]
const pcapFile = generator(ipPackets)

console.log('This here is your pcap file in hex:', pcapFile.toString('hex'))
```

## API

**(packets)**

`packets` is an array of of objects similar to:
```
[{
  timestamp: Date.now(),
  buffer: somePacket
}]
```

Returns a buffer of the generated pcap file.

**.configure(opts)**

Returns a new instance of `pcap-generator` with the passed options.

- **Buffer**. Override the `Buffer` used. _Default_: Buffer (in Node.js) or none (in the browser)
- **linkLayerType**. The type of packets in the file. E.g. `101` for raw IP packets, or `1` for Ethernet packets. See https://www.tcpdump.org/linktypes.html for more details _Default_: 101 (Raw IP packets)
- **majorVersion**. Major version of pcap. _Default_: 2
- **minorVersion**. Minor version of pcap. _Default_: 4
- **gmtOffset**. The GMT offset in pcap. _Default_: 0
- **timestampAccuracy**. The accuracy of the timestamps. _Default_: 0
- **snapshotLength**. The snapshot length of the packets. _Default_: 65535
