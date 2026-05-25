// Patches buffer-equal-constant-time to guard against SlowBuffer being undefined
// (SlowBuffer was removed in Node.js 22+, causing a TypeError at module load time)
'use strict';
const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '..', 'node_modules', 'buffer-equal-constant-time', 'index.js');
let src = fs.readFileSync(target, 'utf8');

if (src.includes('SlowBuffer.prototype.equal = function equal(that)')) {
  src = src
    .replace(
      'bufferEq.install = function() {\n  Buffer.prototype.equal = SlowBuffer.prototype.equal = function equal(that) {\n    return bufferEq(this, that);\n  };\n};',
      'bufferEq.install = function() {\n  Buffer.prototype.equal = function equal(that) {\n    return bufferEq(this, that);\n  };\n  if (SlowBuffer) {\n    SlowBuffer.prototype.equal = function equal(that) {\n      return bufferEq(this, that);\n    };\n  }\n};'
    )
    .replace(
      'var origSlowBufEqual = SlowBuffer.prototype.equal;\nbufferEq.restore = function() {\n  Buffer.prototype.equal = origBufEqual;\n  SlowBuffer.prototype.equal = origSlowBufEqual;\n};',
      'var origSlowBufEqual = SlowBuffer ? SlowBuffer.prototype.equal : undefined;\nbufferEq.restore = function() {\n  Buffer.prototype.equal = origBufEqual;\n  if (SlowBuffer) {\n    SlowBuffer.prototype.equal = origSlowBufEqual;\n  }\n};'
    );
  fs.writeFileSync(target, src);
  console.log('Patched buffer-equal-constant-time for Node.js 22+ compatibility');
} else {
  console.log('buffer-equal-constant-time already patched, skipping');
}
