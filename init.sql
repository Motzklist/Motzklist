-- 1. Create Tables

CREATE TABLE school (
    sid BIGSERIAL PRIMARY KEY,
    sname TEXT NOT NULL
);

CREATE TABLE grade (
    gid BIGSERIAL PRIMARY KEY,
    sid BIGINT NOT NULL,
    gname TEXT NOT NULL,
    
    CONSTRAINT fk_school
        FOREIGN KEY (sid)
        REFERENCES school(sid)
        ON DELETE CASCADE
);

CREATE INDEX idx_grade_school_id ON grade(sid);

CREATE TABLE equipment (
    eid BIGSERIAL PRIMARY KEY,
    ename TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 1 CHECK (price >= 0)
);

CREATE TABLE requirement (
    rid BIGSERIAL PRIMARY KEY,
    gid BIGINT NOT NULL,
    eid BIGINT NOT NULL,
    quantity BIGINT NOT NULL CHECK (quantity > 0),

    CONSTRAINT fk_grade
        FOREIGN KEY(gid)
        REFERENCES grade(gid)
        ON DELETE CASCADE,

    CONSTRAINT fk_equipment
        FOREIGN KEY(eid)
        REFERENCES equipment(eid)
        ON DELETE CASCADE,

    CONSTRAINT unq_grade_equipment UNIQUE (gid, eid)
);

CREATE INDEX idx_requirement_grade_id ON requirement(gid);

CREATE TABLE users (
    uid BIGSERIAL PRIMARY KEY,
    uname TEXT NOT NULL,
    password TEXT NOT NULL
);

CREATE TABLE cart_entry (
    ceid BIGSERIAL PRIMARY KEY,
    gid BIGINT NOT NULL,
    uid BIGINT NOT NULL,

    CONSTRAINT fk_grade
        FOREIGN KEY(gid)
        REFERENCES grade(gid)
        ON DELETE CASCADE,

    CONSTRAINT fk_user
        FOREIGN KEY(uid)
        REFERENCES users(uid)
        ON DELETE CASCADE
);

CREATE TABLE cart_item (
    ciid BIGSERIAL PRIMARY KEY,
    ceid BIGINT NOT NULL,
    eid BIGINT NOT NULL,

    CONSTRAINT fk_cart_entry
        FOREIGN KEY(ceid)
        REFERENCES cart_entry(ceid)
        ON DELETE CASCADE,

    CONSTRAINT fk_equipment
        FOREIGN KEY(eid)
        REFERENCES equipment(eid)
        ON DELETE CASCADE
);

CREATE TABLE orders (
    oid BIGSERIAL PRIMARY KEY,
    uid BIGINT NOT NULL,
    gid BIGINT NOT NULL,
    purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,

    CONSTRAINT fk_user
        FOREIGN KEY(uid)
        REFERENCES users(uid)
        ON DELETE CASCADE,

    CONSTRAINT fk_grade
        FOREIGN KEY(gid)
        REFERENCES grade(gid)
        ON DELETE CASCADE
);

CREATE TABLE order_item (
    oiid BIGSERIAL PRIMARY KEY,
    oid BIGINT NOT NULL,
    eid BIGINT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_purchase DECIMAL(10, 2) NOT NULL CHECK (price_at_purchase >= 0),

    CONSTRAINT fk_order
        FOREIGN KEY(oid)
        REFERENCES orders(oid)
        ON DELETE CASCADE,

    CONSTRAINT fk_equipment
        FOREIGN KEY(eid)
        REFERENCES equipment(eid)
        ON DELETE CASCADE
);

-- 2. Insert Sample Data

-- Insert Schools
INSERT INTO school (sname) VALUES 
('Ort Kiryat Motzkin'),
('Rabin High School');

-- Insert Grades
INSERT INTO grade (sid, gname) VALUES 
(1, 'Grade 10 - Science'),
(1, 'Grade 11 - Literature'),
(2, 'Grade 10 - General');

-- Insert Equipment Catalog
INSERT INTO equipment (ename, price) VALUES 
('Benny Goren Math 4 Units', 85.50),
('Physics Textbook Part 1', 120.00),
('Spiral Notebook 40 pages', 5.00),
('Blue Pen Pack', 12.50);

-- Insert Requirements (What each grade needs)
INSERT INTO requirement (gid, eid, quantity) VALUES 
(1, 1, 1),
(1, 2, 1),
(1, 3, 5),
(2, 3, 10),
(2, 4, 2);

-- Insert Users
INSERT INTO users (uname, password) VALUES 
('roi', 'hashed_pass_123'),
('avner', 'hashed_pass_456');

-- Insert an active Shopping Cart for user 'roi' (for Grade 10 - Science)
INSERT INTO cart_entry (gid, uid) VALUES 
(1, 1);

-- Insert Items into the active Shopping Cart
INSERT INTO cart_item (ceid, eid) VALUES 
(1, 1),
(1, 3);

-- Insert a completed Order for user 'avner' (for Grade 11 - Literature)
INSERT INTO orders (uid, gid, total_amount) VALUES 
(2, 2, 75.00);

-- Insert Order Items (Saving the state of the prices at purchase)
INSERT INTO order_item (oid, eid, quantity, price_at_purchase) VALUES 
(1, 3, 10, 5.00),
(1, 4, 2, 12.50);