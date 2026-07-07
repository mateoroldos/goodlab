CREATE TABLE `episode_progress` (
	`user_id` text NOT NULL,
	`series_slug` text NOT NULL,
	`episode_slug` text NOT NULL,
	`started_at` integer NOT NULL,
	`completed_at` integer,
	PRIMARY KEY(`user_id`, `series_slug`, `episode_slug`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
