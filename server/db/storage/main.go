package main

import (
	"database/sql"
	"log"
	"os"
	"server/db"
	"server/utils"

	_ "github.com/lib/pq"
)

type PostgresStore struct {
	db *sql.DB
}

func NewPostgresStore() (*PostgresStore, error) {
	dbName := os.Getenv("DB_NAME")
	connStr := os.Getenv("CONN_STRING")

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, err
	}

	if err := db.Ping(); err != nil {
		log.Println(err)
		log.Println("Creating the new database")

		createDbErr := CreateDatabase(dbName)
		if createDbErr != nil {
			return nil, createDbErr
		}
		log.Println("Connecting to the new database")
		return NewPostgresStore()
	}

	return &PostgresStore{db: db}, nil

}
func CreateDatabase(dbName string) error {
	connStrWithoutDb := os.Getenv("CONN_STRING_WITHOUT_DBNAME")
	db, err := sql.Open("postgres", connStrWithoutDb)
	if err != nil {
		return err
	}

	query := "create database " + dbName

	_, dbCreateErr := db.Exec(query)

	return dbCreateErr
}

func CreateUsersTable(s *db.Database) error {
	query := `create table if not exists users (
		id bigserial primary key,
		username varchar NOT NULL,
		email varchar NOT NULL,
		password varchar NOT NULL,
		created_at timestamp default current_timestamp   
	);`

	_, err := s.GetDB().Exec(query)
	return err
}

func InitTables(s *db.Database) {
	log.Println("database migrations start..")

	err := CreateUsersTable(s)
	if err != nil {
		log.Fatal("could not create users table: ", err)
	}

}

func main() {
	utils.LoadEnvs()

	db, err := db.NewDatabase()
	if err != nil {
		log.Fatal("could not connect to database: ", err)

	} else {

		InitTables(db)

		log.Println("database initialized..")
	}
}
