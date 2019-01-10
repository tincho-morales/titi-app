CREATE DATABASE `coopidrogas-comerssia`;

CREATE TABLE `references_codes` (
  `source_code` varchar(255) DEFAULT NULL,
  `source_barcode` varchar(255) DEFAULT NULL,
  `source_description` varchar(255) DEFAULT NULL,
  `final_code` varchar(255) DEFAULT NULL,
  `final_presentation` varchar(255) DEFAULT NULL,
  `updated` DATE DEFAULT CURRENT_TIMESTAMP,
  primary key (`source_code`, `source_barcode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE `references_locals` (
  `source_local_id` varchar(100) DEFAULT NULL,
  `final_local_id` varchar(100) DEFAULT NULL,
  `updated` DATETIME DEFAULT CURRENT_TIMESTAMP,
  primary key (`source_local_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;