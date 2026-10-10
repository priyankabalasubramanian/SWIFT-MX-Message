-- =====================================================================
-- SWIFT MX Message Portal - Database Initialization Script
-- Database: swift_mx_db
-- =====================================================================

CREATE DATABASE IF NOT EXISTS swift_mx_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE swift_mx_db;

-- ---------------------------------------------------------------------
-- 1. Users Table (Authentication Credentials)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) NOT NULL UNIQUE,
  username VARCHAR(50) NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role VARCHAR(30) NOT NULL DEFAULT 'OPERATOR',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email),
  INDEX idx_users_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 2. Messages Table (SWIFT MX ISO 20022 Messages & Payloads)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS messages (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  message_id VARCHAR(64) NOT NULL UNIQUE,
  message_type VARCHAR(32) NOT NULL DEFAULT 'pacs.008',
  creation_date DATE NOT NULL,
  currency VARCHAR(3) NOT NULL,
  amount DECIMAL(18, 2) NOT NULL,
  sender_name VARCHAR(150) NOT NULL,
  sender_bic VARCHAR(11) NOT NULL,
  receiver_name VARCHAR(150) NOT NULL,
  receiver_bic VARCHAR(11) NOT NULL,
  debtor_name VARCHAR(150) NOT NULL,
  debtor_account VARCHAR(34) NOT NULL,
  creditor_name VARCHAR(150) NOT NULL,
  creditor_account VARCHAR(34) NOT NULL,
  remittance_info VARCHAR(500) NOT NULL,
  generated_xml LONGTEXT NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'CREATED',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_messages_message_id (message_id),
  INDEX idx_messages_type (message_type),
  INDEX idx_messages_sender_bic (sender_bic),
  INDEX idx_messages_receiver_bic (receiver_bic),
  INDEX idx_messages_creation_date (creation_date),
  INDEX idx_messages_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 3. Initial Seed Data (Pre-hashed BCrypt passwords for development)
-- Password for all seed users is: password123
-- Seed Email Accounts:
--   operator@swiftmx.bank (Role: OPERATOR)
--   admin@swiftmx.bank    (Role: ADMIN)
-- ---------------------------------------------------------------------
INSERT INTO users (email, username, password_hash, full_name, role)
VALUES
  ('operator@swiftmx.bank', 'OP-84920', '$2a$10$e8p2r4P7wZ8F2gC8K6zWue2m1u3.X1K8O3G4J7e9d1W0Y6A5B2C3D', 'Authorised Operations Specialist', 'OPERATOR'),
  ('admin@swiftmx.bank', 'admin', '$2a$10$e8p2r4P7wZ8F2gC8K6zWue2m1u3.X1K8O3G4J7e9d1W0Y6A5B2C3D', 'System Administrator', 'ADMIN')
ON DUPLICATE KEY UPDATE email=email;
