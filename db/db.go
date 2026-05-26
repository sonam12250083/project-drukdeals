package db

import (
	"database/sql"

	_ "github.com/go-sql-driver/mysql"
)

var DB *sql.DB

func InitDB() error {
	var err error
	// In Docker: db:3306, locally: 127.0.0.1:3306
	DB, err = sql.Open("mysql", "root:root@tcp(db:3306)/drukdeals_db?parseTime=true")
	if err != nil {
		return err
	}
	return DB.Ping()
}
