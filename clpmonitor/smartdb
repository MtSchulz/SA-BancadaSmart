create schema smartdb;
use smartdb;

CREATE TABLE storage (
  id int NOT NULL AUTO_INCREMENT,
  name varchar(255) NOT NULL,
  capacity int NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE orders (
  id int NOT NULL AUTO_INCREMENT,
  production_order varchar(255) NOT NULL UNIQUE,  
  PRIMARY KEY (id)
);

CREATE TABLE block (
  id int NOT NULL AUTO_INCREMENT,
  position int NOT NULL,
  color int NOT NULL,
  storage_id int NOT NULL,
  production_order_id int DEFAULT NULL,
  PRIMARY KEY (id),
  KEY FK_Block_Storage (storage_id),
  KEY FK_Block_Orders (production_order_id),
  CONSTRAINT FK_Block_Storage FOREIGN KEY (storage_id) REFERENCES storage (id),
  CONSTRAINT FK_Block_Orders FOREIGN KEY (production_order_id) REFERENCES orders (id)
);

SELECT id, position, color, storage_id, production_order_id
FROM block
ORDER BY position;

