const { Pool } = require('pg');

// Create a connection pool to PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: "rideshare_app",
  password: "alphasigmaphi",
  port: 5432,
});

pool.connect().then(()=> console.log("connected"));

const createQuery =  `CREATE TABLE IF NOT EXISTS accounts(
user_id serial PRIMARY KEY,
username VARCHAR (50 ) UNIQUE NOT NULL,
password VARCHAR (50) UNIQUE NOT NULL);`

pool.query(createQuery).then((res) => {
  console.log("database created");
  console.log(res);


}).catch((error) => {
  console.log(error);
})

  
  pool.query(`CREATE TABLE IF NOT EXISTS public.drivers(
    name character varying COLLATE pg_catalog."default",
    phone_number character varying COLLATE pg_catalog."default",
    car_model character varying COLLATE pg_catalog."default",
    car_make character varying COLLATE pg_catalog."default",
    car_color character varying COLLATE pg_catalog."default",
    is_driving boolean,
    queue_length integer
  )

  TABLESPACE pg_default;

  ALTER TABLE IF EXISTS public.drivers
      OWNER to postgres;

  GRANT ALL ON TABLE public.drivers TO postgres;`)
  .then((res) => {
    console.log("database created");
    console.log(res);
  
  
  }).catch((error) => {
    console.log(error);
  })


module.exports = pool;

