import { unique } from 'drizzle-orm/sqlite-core';
import { text } from 'drizzle-orm/sqlite-core';
import { integer } from 'drizzle-orm/sqlite-core';
import { sqliteTable } from 'drizzle-orm/sqlite-core';

export const hosts = sqliteTable(
  'hosts',
  {
    id: integer('id').primaryKey({
      autoIncrement: true,
    }),
    host: text('host').notNull(),
    topic: text('topic').notNull(),
  },
  (self) => ({
    host_topic: unique().on(self.host, self.topic),
  }),
);
