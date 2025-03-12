CREATE TABLE users (
                       id SERIAL PRIMARY KEY,
                       name TEXT NOT NULL,
                       balance DECIMAL(10,2) NOT NULL DEFAULT 0.00
);

CREATE TABLE products (
                          id SERIAL PRIMARY KEY,
                          name TEXT NOT NULL,
                          price DECIMAL(10,2) NOT NULL
);

CREATE TABLE purchases (
                           id SERIAL PRIMARY KEY,
                           user_id INT REFERENCES users(id),
                           product_id INT REFERENCES products(id),
                           purchase_date TIMESTAMP DEFAULT NOW()
);
