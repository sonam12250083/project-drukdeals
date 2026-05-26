package routes

import (
	"net/http"
	"github.com/gorilla/mux"
	"drukdeals/controller"
)

func InitializeRoutes() *mux.Router {
	r := mux.NewRouter()

	// Auth routes
	r.HandleFunc("/signup", controller.Signup).Methods("POST")
	r.HandleFunc("/login", controller.Login).Methods("POST")
	r.HandleFunc("/logout", controller.Logout).Methods("POST")
	r.HandleFunc("/auth/check", controller.CheckAuth).Methods("GET")

	// Product routes
	r.HandleFunc("/products", controller.GetAllProducts).Methods("GET")
	r.HandleFunc("/product", controller.AddProduct).Methods("POST")
	r.HandleFunc("/my-products", controller.GetMyProducts).Methods("GET")
	r.HandleFunc("/product/{id}", controller.DeleteProduct).Methods("DELETE")
	r.HandleFunc("/categories", controller.GetCategories).Methods("GET")

	// Serve HTML pages
	r.HandleFunc("/", serveFile("./view/index.html"))
	r.HandleFunc("/signup-page", serveFile("./view/signup.html"))
	r.HandleFunc("/home", serveFile("./view/home.html"))
	r.HandleFunc("/add-item", serveFile("./view/add-item.html"))
	r.HandleFunc("/my-items", serveFile("./view/my-items.html"))

	return r
}

func serveFile(path string) func(http.ResponseWriter, *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, path)
	}
}
