-- DB: PostgreSQL
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  pwd VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user', -- user, trainer, admin
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  content TEXT,
  media_url VARCHAR(255),
  tags VARCHAR(255), -- AI tags
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE likes (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  post_id INT REFERENCES posts(id) ON DELETE CASCADE,
  UNIQUE(user_id, post_id)
);

CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  post_id INT REFERENCES posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE follows (
  follower_id INT REFERENCES users(id) ON DELETE CASCADE,
  followed_id INT REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY(follower_id, followed_id)
);

CREATE TABLE groups (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  owner_id INT REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE group_members (
  group_id INT REFERENCES groups(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending', -- pending, accepted
  PRIMARY KEY(group_id, user_id)
);
