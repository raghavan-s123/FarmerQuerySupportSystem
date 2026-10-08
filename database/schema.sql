-- =========================================================
-- KrishiMitra / AI-Based Farmer Advisory System - DB Schema
-- =========================================================

CREATE DATABASE IF NOT EXISTS chatbot;
USE chatbot;

-- ---------- MODULE: AUTHENTICATION (Login Page for Farmers / Experts) ----------
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,          -- BCrypt hashed
    phone VARCHAR(15),
    role VARCHAR(20) NOT NULL,               -- FARMER, STUDENT, EXPERT, ADMIN
    preferred_language VARCHAR(20) DEFAULT 'English', -- English, Tamil, Telugu
    expert_domain VARCHAR(100),              -- only used for EXPERT role
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------- MODULE: FARMER MANAGEMENT ----------
CREATE TABLE farm_details (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    farm_name VARCHAR(100),
    crop_details VARCHAR(255),
    location VARCHAR(150),
    preferred_language VARCHAR(30) DEFAULT 'English',
    land_size_acres DOUBLE,
    soil_type VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ---------- MODULE: AI CHAT WITH RAG (Multilingual Query Interface + RAG) ----------
CREATE TABLE ai_queries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    farmer_id BIGINT NOT NULL,
    original_question TEXT NOT NULL,       -- as typed/spoken by the farmer (any language)
    detected_language VARCHAR(20),         -- en, ta, te ... (from BERT language detection)
    translated_question TEXT,              -- English version sent to the RAG pipeline
    answer_english TEXT,                   -- raw LLM answer in English
    final_answer TEXT,                     -- answer translated back into farmer's language
    source_documents TEXT,
    input_type VARCHAR(10) DEFAULT 'TEXT', -- TEXT or VOICE
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ---------- MODULE: DISEASE DETECTION ----------
CREATE TABLE disease_results (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    farmer_id BIGINT NOT NULL,
    image_path VARCHAR(255),
    predicted_disease VARCHAR(150),
    confidence DOUBLE,
    recommendation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ---------- MODULE: EXPERT CONSULTATION (Socket.IO real-time chat) ----------
CREATE TABLE expert_queries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    farmer_id BIGINT NOT NULL,
    expert_id BIGINT,
    question TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',    -- PENDING, ACCEPTED, CLOSED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (expert_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Every chat message is persisted here so Socket.IO can replay full
-- chat history to a client the moment they (re)join a chat room.
CREATE TABLE expert_chat_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    query_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    sender_role VARCHAR(20),
    message TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (query_id) REFERENCES expert_queries(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ---------- MODULE: WEATHER ----------
CREATE TABLE weather_data (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    location VARCHAR(150) NOT NULL,
    temperature DOUBLE,
    humidity DOUBLE,
    rainfall DOUBLE,
    fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------- MODULE: RECOMMENDATION ----------
CREATE TABLE recommendations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    farmer_id BIGINT NOT NULL,
    irrigation_advice TEXT,
    fertilizer_advice TEXT,
    harvest_advice TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ---------- MODULE: MARKET ----------
CREATE TABLE market_prices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    crop_name VARCHAR(100) NOT NULL,
    market_name VARCHAR(150) NOT NULL,
    price_per_quintal DOUBLE NOT NULL,
    recorded_date DATE NOT NULL
);

-- ---------- MODULE: GOVERNMENT SCHEMES ----------
CREATE TABLE government_schemes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    scheme_name VARCHAR(150) NOT NULL,
    description TEXT,
    eligibility TEXT,
    documents_required TEXT
);

-- ---------- MODULE: NOTIFICATIONS ----------
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'GENERAL',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ---------- MODULE: ADMIN / FEEDBACK ----------
CREATE TABLE feedback (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ---------- SEED DATA ----------
INSERT INTO government_schemes (scheme_name, description, eligibility, documents_required) VALUES
('PM-KISAN', 'Income support of Rs 6000/year to farmer families', 'All landholding farmer families', 'Aadhaar, Land Records, Bank Passbook'),
('Pradhan Mantri Fasal Bima Yojana', 'Crop insurance scheme against natural calamities', 'Farmers growing notified crops', 'Aadhaar, Land Records, Sowing Certificate'),
('Kisan Credit Card', 'Easy access to credit for farmers', 'All farmers, tenant farmers, sharecroppers', 'Aadhaar, Land Records, Passport size photo');

INSERT INTO market_prices (crop_name, market_name, price_per_quintal, recorded_date) VALUES
('Wheat', 'Coimbatore Mandi', 2200.00, CURDATE()),
('Rice', 'Coimbatore Mandi', 1900.00, CURDATE()),
('Tomato', 'Coimbatore Mandi', 1500.00, CURDATE());
