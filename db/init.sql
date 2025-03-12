CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
                       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                       name TEXT NOT NULL,
                       balance DECIMAL(10,2) NOT NULL DEFAULT 0.00
);

CREATE TABLE products (
                          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                          name TEXT NOT NULL,
                          price DECIMAL(10,2) NOT NULL
);

CREATE TABLE purchases (
                           id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                           user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                           product_id UUID REFERENCES products(id) ON DELETE CASCADE,
                           purchase_date TIMESTAMP DEFAULT NOW()
);
