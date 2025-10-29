CREATE TABLE `articles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` text NOT NULL,
	`url` varchar(1024) NOT NULL,
	`source` varchar(255) NOT NULL,
	`publishedDate` timestamp,
	`collectedDate` timestamp NOT NULL DEFAULT (now()),
	`relevanceScore` int NOT NULL DEFAULT 0,
	`matchedKeywords` text,
	`category` varchar(100),
	`summary` text,
	`notified` int NOT NULL DEFAULT 0,
	CONSTRAINT `articles_id` PRIMARY KEY(`id`),
	CONSTRAINT `articles_url_unique` UNIQUE(`url`)
);
