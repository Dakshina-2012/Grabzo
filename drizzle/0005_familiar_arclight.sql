CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`orderId` int,
	`channel` enum('in_app','email') NOT NULL DEFAULT 'in_app',
	`status` enum('unread','read','queued','sent','failed') NOT NULL DEFAULT 'unread',
	`type` enum('order','shipment','review') NOT NULL DEFAULT 'order',
	`title` varchar(180) NOT NULL,
	`body` text NOT NULL,
	`actionUrl` varchar(255),
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orderEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`status` enum('placed','confirmed','packed','shipped','out_for_delivery','delivered','cancelled') NOT NULL,
	`title` varchar(180) NOT NULL,
	`description` text NOT NULL,
	`actorRole` enum('system','customer','vendor','admin') NOT NULL DEFAULT 'system',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orderEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `vendorId` int;--> statement-breakpoint
CREATE INDEX `notifications_user_idx` ON `notifications` (`userId`);--> statement-breakpoint
CREATE INDEX `notifications_order_idx` ON `notifications` (`orderId`);--> statement-breakpoint
CREATE INDEX `order_events_order_idx` ON `orderEvents` (`orderId`);