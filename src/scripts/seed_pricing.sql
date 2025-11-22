-- GiGSHUB Seed Data for Pricing

-- MTN Packages
INSERT INTO pricing (provider, name, size, price, agent_price, product_code) VALUES
('MTN','MTN Regular 1GB','1GB',5.5,4.9,'mtn_reg_1gb'),
('MTN','MTN Regular 2GB','2GB',12,9.8,'mtn_reg_2gb'),
('MTN','MTN Regular 3GB','3GB',18,14.7,'mtn_reg_3gb'),
('MTN','MTN Regular 4GB','4GB',23,19.2,'mtn_reg_4gb'),
('MTN','MTN Regular 5GB','5GB',27,25,'mtn_reg_5gb'),
('MTN','MTN Regular 6GB','6GB',34,29,'mtn_reg_6gb'),
('MTN','MTN Regular 8GB','8GB',42,38.6,'mtn_reg_8gb'),
('MTN','MTN Regular 10GB','10GB',47,45,'mtn_reg_10gb'),
('MTN','MTN Regular 15GB','15GB',74,70,'mtn_reg_15gb'),
('MTN','MTN Regular 20GB','20GB',90,86,'mtn_reg_20gb'),
('MTN','MTN Agent 30GB','30GB',125,125,'mtn_agent_30gb'),
('MTN','MTN Agent 50GB','50GB',200,200,'mtn_agent_50gb'),
('MTN','MTN Agent 100GB','100GB',399,399,'mtn_agent_100gb');

-- Telecel Packages
INSERT INTO pricing (provider, name, size, price, agent_price, product_code) VALUES
('Telecel','Telecel 5GB','5GB',28,23,'telecel_5gb'),
('Telecel','Telecel 10GB','10GB',47,42,'telecel_10gb'),
('Telecel','Telecel 15GB','15GB',65,60,'telecel_15gb'),
('Telecel','Telecel 20GB','20GB',85,80,'telecel_20gb'),
('Telecel','Telecel 25GB','25GB',104,98,'telecel_25gb'),
('Telecel','Telecel 30GB','30GB',130,117,'telecel_30gb'),
('Telecel','Telecel 40GB','40GB',165,157,'telecel_40gb'),
('Telecel','Telecel 50GB','50GB',193,187,'telecel_50gb'),
('Telecel','Telecel 100GB','100GB',390,385,'telecel_100gb');

-- AirtelTigo Ishare Packages
INSERT INTO pricing (provider, name, size, price, agent_price, product_code) VALUES
('AirtelTigo','AT Ishare 1GB','1GB',5,4.3,'at_ishare_1gb'),
('AirtelTigo','AT Ishare 2GB','2GB',10,8.6,'at_ishare_2gb'),
('AirtelTigo','AT Ishare 3GB','3GB',15,NULL,'at_ishare_3gb'),
('AirtelTigo','AT Ishare 4GB','4GB',20,18,'at_ishare_4gb'),
('AirtelTigo','AT Ishare 5GB','5GB',25,20.6,'at_ishare_5gb'),
('AirtelTigo','AT Ishare 6GB','6GB',30,24.8,'at_ishare_6gb'),
('AirtelTigo','AT Ishare 7GB','7GB',35,28.6,'at_ishare_7gb'),
('AirtelTigo','AT Ishare 8GB','8GB',40,33,'at_ishare_8gb'),
('AirtelTigo','AT Ishare 10GB','10GB',50,40.2,'at_ishare_10gb'),
('AirtelTigo','AT Ishare 15GB','15GB',70,60.2,'at_ishare_15gb');

-- AirtelTigo Bigtime Packages
INSERT INTO pricing (provider, name, size, price, agent_price, product_code) VALUES
('AirtelTigo','AT Bigtime 20GB','20GB',70,68,'at_bigtime_20gb'),
('AirtelTigo','AT Bigtime 30GB','30GB',80,78,'at_bigtime_30gb'),
('AirtelTigo','AT Bigtime 40GB','40GB',90,88,'at_bigtime_40gb'),
('AirtelTigo','AT Bigtime 50GB','50GB',110,103,'at_bigtime_50gb'),
('AirtelTigo','AT Bigtime 100GB','100GB',120,190,'at_bigtime_100gb'),
('AirtelTigo','AT Bigtime 200GB','200GB',350,350,'at_bigtime_200gb');