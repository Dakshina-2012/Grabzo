CREATE TABLE `returnRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`userId` int NOT NULL,
	`status` enum('requested','approved','rejected','received','refunded','cancelled') NOT NULL DEFAULT 'requested',
	`reason` varchar(180) NOT NULL,
	`customerNote` text,
	`sellerNote` text,
	`items` text NOT NULL,
	`refundAmount` int NOT NULL,
	`refundReference` varchar(100),
	`requestedAt` timestamp NOT NULL DEFAULT (now()),
	`reviewedAt` timestamp,
	`refundedAt` timestamp,
	CONSTRAINT `returnRequests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `orders` ADD `trackingCarrier` varchar(100);--> statement-breakpoint
ALTER TABLE `orders` ADD `trackingNumber` varchar(120);--> statement-breakpoint
ALTER TABLE `orders` ADD `trackingUrl` text;--> statement-breakpoint
CREATE INDEX `returns_order_idx` ON `returnRequests` (`orderId`);--> statement-breakpoint
CREATE INDEX `returns_user_idx` ON `returnRequests` (`userId`);