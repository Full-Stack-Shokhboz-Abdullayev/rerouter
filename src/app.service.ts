import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import axios from 'axios';
import { eq } from 'drizzle-orm';
import { db } from 'src/db';
import { hosts } from 'src/db/schema';
import { CreateHostDto } from 'src/dto';
import { mapFromArray } from 'src/utils';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const https = require('https');

@Injectable()
export class AppService implements OnModuleInit {
  cachedHosts = {} as Record<
    string | number,
    {
      id: number;
      host: string;
      topic: string;
    }
  >;

  logger = new Logger(AppService.name);

  async onModuleInit() {
    this.cachedHosts = mapFromArray(
      (await this._getHosts({ headers: {} })).filter((data) => data),
      ({ id }) => id,
    );

    this.logger.log(
      `Cached Hosts: \n` + JSON.stringify(this.cachedHosts, null, 2),
    );

    this.logger.log(
      'Env: \n' +
        JSON.stringify(
          {
            PORT: process.env.PORT,
            ADMIN_TOKEN: process.env.ADMIN_TOKEN,
            WEBHOOK_TOKEN: process.env.WEBHOOK_TOKEN,
          },
          null,
          2,
        ),
    );
  }

  webhook(body: Record<string, string>, headers: Record<string, string>) {
    setImmediate(() => {
      for (const key of Object.keys(
        this.cachedHosts,
      ) as (keyof typeof this.cachedHosts)[])
        this.makeRequest({ headers, body }, this.cachedHosts[key].host);
    });

    return 200;
  }

  async addHost(body: CreateHostDto) {
    const result = await db
      .insert(hosts)
      .values({
        host: body.host,
        topic: body.topic,
      })
      .returning()
      .execute();

    // cachedHosts.push(...result)
    for (const value of result) this.cachedHosts[value.id] = value;

    return result;
  }

  async removeHost(id: number) {
    const [host] = isNaN(id)
      ? [null]
      : await db.select().from(hosts).where(eq(hosts.id, id));

    if (!host) return 404;

    await db
      .delete(hosts)
      .where(eq(hosts.id, id))
      .execute()
      .then(() => delete this.cachedHosts[id]);
  }

  getHosts() {
    return this.cachedHosts;
  }

  private async _getHosts(
    request: { headers: Record<string, string> },
    empty?: boolean,
  ) {
    const topic =
      request.headers['topic'] ||
      request.headers['TOPIC'] ||
      request.headers['Topic'];

    const getBase = () => db.select().from(hosts);

    if (!topic) {
      empty && console.warn('No Topic was sent', request.headers);
      return empty ? [] : getBase().execute();
    }

    const result = await getBase().where(eq(hosts.topic, topic)).execute();

    return result;
  }

  private async makeRequest(
    request: { body: Record<string, string>; headers: Record<string, string> },
    host: string,
  ) {
    console.log('hi');

    return axios
      .create({
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        }),
      })
      .post(host, { ...request.body, WEBHOOK_TOKEN: process.env.REQUEST_TOKEN })
      .then(() => {
        console.log(
          `Successfully sent to ${host} with params: \n`,
          JSON.stringify({
            ...request.body,
            WEBHOOK_TOKEN: process.env.REQUEST_TOKEN,
          }),
        );
      })
      .catch((err) => {
        console.warn(
          `Error occurs while sending to ${host}`,
          err.response?.message ?? err.message,
        );

        return;
      });
  }
}
