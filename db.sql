CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    google_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE temp_users (
    id SERIAL PRIMARY KEY,
    ip INET NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE links (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    short_code VARCHAR(10) UNIQUE,
    original_url TEXT NOT NULL,
    clicks INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
);

CREATE TABLE temp_links (
    id SERIAL PRIMARY KEY,
    temp_user_id INTEGER REFERENCES temp_users(id) ON DELETE CASCADE,
    short_code VARCHAR(10) UNIQUE NOT NULL,
    original_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days'),
    clicks INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
);

CREATE TABLE qr_code (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    original_url TEXT NOT NULL,
    qr_data_url TEXT,
    scans INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true    
);

CREATE TABLE temp_qrcode (
    id SERIAL PRIMARY KEY,
    temp_user_id INTEGER REFERENCES temp_users(id) ON DELETE CASCADE,
    qr_url TEXT NOT NULL,
    qr_data_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days'),
    scans INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true 
);
