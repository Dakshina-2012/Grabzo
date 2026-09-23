ALTER TABLE `orders` ADD `cancelReason` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `cancelledAt` timestamp;--> statement-breakpoint
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_user_product_unique` UNIQUE(`userId`,`productId`);