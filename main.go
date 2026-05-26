package main

import (
	"log"
	"net/http"
	"drukdeals/db"
	"drukdeals/routes"
)

func main() {
	err := db.InitDB()
	if err != nil {
		log.Fatal("Database connection failed:", err)
	}
	log.Println(" Database connected")

	router := routes.InitializeRoutes()

	// Serve static files
	router.PathPrefix("/css/").Handler(http.StripPrefix("/css/", http.FileServer(http.Dir("./view/css/"))))
	router.PathPrefix("/js/").Handler(http.StripPrefix("/js/", http.FileServer(http.Dir("./view/js/"))))
	router.PathPrefix("/uploads/").Handler(http.StripPrefix("/uploads/", http.FileServer(http.Dir("./uploads/"))))

	log.Println(" Server starting on http://localhost:8080")
	http.ListenAndServe(":8080", router)
}
