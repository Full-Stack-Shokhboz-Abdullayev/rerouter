CREATE TABLE `hosts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`host` text NOT NULL,
	`topic` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `hosts_host_topic_unique` ON `hosts` (`host`,`topic`);