import { Readable, ReadableOptions } from 'stream';
import type { TBufferGenerator } from '../../types/rtsp-server/buffer-pool';

class BufferPool extends Readable {
  private readonly gFun: TBufferGenerator;
  private readBytes = 0;
  private poolBytes = 0;
  private needBytes = 0;

  constructor(genFun: TBufferGenerator, options?: ReadableOptions) {
    super(options);
    this.gFun = genFun;
  }

  _read(_size: number): void {}

  init(): void {
    this.readBytes = 0;
    this.poolBytes = 0;
    this.needBytes = 0;
    this.gFun.next(false);
  }

  stop(): void {
    try {
      this.gFun.next(true);
    } catch (e) {
      // console.log(e);
    }
  }

  push(buf: Buffer | null): boolean {
    const ret = super.push(buf);
    if (!buf) {
      return ret;
    }
    this.poolBytes += buf.length;
    this.readBytes += buf.length;
    if (this.needBytes > 0 && this.needBytes <= this.poolBytes) {
      this.gFun.next(false);
    }
    return ret;
  }

  read(size?: number): Buffer | null {
    const data = super.read(size) as Buffer | null;
    if (data) {
      this.poolBytes -= data.length;
    }
    return data;
  }

  need(size: number): boolean {
    let ret = this.poolBytes < size;
    if (ret) {
      this.needBytes = size;
    } else {
      this.needBytes = 0;
    }
    return ret;
  }
}

export default BufferPool;
