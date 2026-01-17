import { Injectable } from '@nestjs/common';
import * as process from 'node:process';

import cluster from 'node:cluster';

const numCPUs = 1;

@Injectable()
export class ClusterService {
  static clusterize(callback: () => void): void {
    if (process.env.NODE_ENV === 'production') {
      if (cluster.isPrimary) {
        console.log(`MASTER SERVER (${process.pid}) IS RUNNING `);

        for (let i = 0; i < numCPUs; i++) {
          cluster.fork();
        }

        cluster.on('exit', (worker) => {
          console.log(`worker ${worker.process.pid} died`);
        });
      } else {
        callback();
      }
    } else {
      callback();
    }
  }
}
