CREATE TABLE `vendorFollows` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`vendorId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vendorFollows_id` PRIMARY KEY(`id`),
	CONSTRAINT `vendor_follow_user_vendor_unique` UNIQUE(`userId`,`vendorId`)
);
