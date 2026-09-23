ALTER TABLE `orders` ADD `paymentStatus` enum('completed','pending','failed') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `paymentReference` varchar(80);--> statement-breakpoint
UPDATE `orders` SET `paymentStatus` = CASE WHEN `paymentMethod` = 'cod' THEN 'pending' ELSE 'completed' END;--> statement-breakpoint
UPDATE `orders` SET `paymentReference` = CASE WHEN `paymentMethod` = 'cod' THEN CONCAT('COD-', `orderNumber`) ELSE CONCAT('GZPAY-', `orderNumber`) END WHERE `paymentReference` IS NULL;
