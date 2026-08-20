create table users (
	id BIGSERIAL not null PRIMARY key,
	email VARCHAR(150),
	password VARCHAR(255) not null ,
	created_at TIMESTAMP with time zone default now()
);

create table tasks (
	id BIGSERIAL NOT NULL PRIMARY KEY,
	title TEXT NOT NULL,
	completed BOOLEAN NOT NULL DEFAULT false,
	created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
	user_id bigint not null references users(id)
);
