CREATE TABLE `cartItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`productId` int NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cartItems_id` PRIMARY KEY(`id`),
	CONSTRAINT `cart_user_product_unique` UNIQUE(`userId`,`productId`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(80) NOT NULL,
	`name` varchar(120) NOT NULL,
	`eyebrow` varchar(80),
	`image` text NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `orderItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`productId` int NOT NULL,
	`productName` varchar(220) NOT NULL,
	`vendorId` int NOT NULL,
	`vendorName` varchar(160) NOT NULL,
	`price` int NOT NULL,
	`quantity` int NOT NULL,
	`image` text,
	CONSTRAINT `orderItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`orderNumber` varchar(40) NOT NULL,
	`status` enum('placed','confirmed','packed','shipped','out_for_delivery','delivered','cancelled') NOT NULL DEFAULT 'placed',
	`subtotal` int NOT NULL,
	`discount` int NOT NULL DEFAULT 0,
	`delivery` int NOT NULL DEFAULT 0,
	`tax` int NOT NULL DEFAULT 0,
	`total` int NOT NULL,
	`address` text NOT NULL,
	`paymentMethod` enum('upi','credit_card','debit_card','cod') NOT NULL,
	`expectedDelivery` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_orderNumber_unique` UNIQUE(`orderNumber`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(160) NOT NULL,
	`name` varchar(220) NOT NULL,
	`description` text NOT NULL,
	`price` int NOT NULL,
	`originalPrice` int NOT NULL,
	`discount` int NOT NULL,
	`categoryId` int,
	`category` varchar(100) NOT NULL,
	`subcategory` varchar(100),
	`brand` varchar(120),
	`vendorId` int NOT NULL,
	`vendorName` varchar(160) NOT NULL,
	`images` text NOT NULL,
	`rating` int NOT NULL DEFAULT 45,
	`reviewCount` int NOT NULL DEFAULT 0,
	`stock` int NOT NULL DEFAULT 0,
	`sku` varchar(100) NOT NULL,
	`specifications` text,
	`tags` text,
	`isFeatured` boolean NOT NULL DEFAULT false,
	`isDeal` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`productId` int NOT NULL,
	`userName` varchar(160) NOT NULL,
	`rating` int NOT NULL,
	`title` varchar(180) NOT NULL,
	`body` text NOT NULL,
	`verifiedPurchase` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vendors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(100) NOT NULL,
	`name` varchar(160) NOT NULL,
	`logo` text,
	`coverImage` text,
	`description` text,
	`rating` int NOT NULL DEFAULT 47,
	`reviewCount` int NOT NULL DEFAULT 0,
	`productCount` int NOT NULL DEFAULT 0,
	`categories` text,
	`location` varchar(120),
	`verified` boolean NOT NULL DEFAULT true,
	`followers` int NOT NULL DEFAULT 0,
	`contact` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vendors_id` PRIMARY KEY(`id`),
	CONSTRAINT `vendors_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `wishlists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`productId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wishlists_id` PRIMARY KEY(`id`),
	CONSTRAINT `wishlist_user_product_unique` UNIQUE(`userId`,`productId`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','vendor','admin') NOT NULL DEFAULT 'user';--> statement-breakpoint
CREATE INDEX `cart_user_idx` ON `cartItems` (`userId`);--> statement-breakpoint
CREATE INDEX `orders_user_idx` ON `orders` (`userId`);--> statement-breakpoint
CREATE INDEX `products_category_idx` ON `products` (`category`);--> statement-breakpoint
CREATE INDEX `products_vendor_idx` ON `products` (`vendorId`);--> statement-breakpoint
CREATE INDEX `reviews_product_idx` ON `reviews` (`productId`);