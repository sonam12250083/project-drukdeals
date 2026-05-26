package controller

import (
	"drukdeals/model"
	"drukdeals/utils"
	"io"
	"net/http"
	"os"
	"strconv"

	"github.com/gorilla/mux"
)

func AddProduct(w http.ResponseWriter, r *http.Request) {
	userID, loggedIn := GetUserID(r)
	if !loggedIn {
		utils.SendError(w, http.StatusUnauthorized, "Please login first")
		return
	}

	r.ParseMultipartForm(10 << 20) // 10MB

	title := r.FormValue("title")
	price, _ := strconv.ParseFloat(r.FormValue("price"), 64)
	catID, _ := strconv.Atoi(r.FormValue("cat_id"))
	description := r.FormValue("description")

	if title == "" || price <= 0 || catID == 0 {
		utils.SendError(w, http.StatusBadRequest, "Title, price and category are required")
		return
	}

	// Handle image upload
	var imagePath string
	file, handler, err := r.FormFile("image")
	if err == nil {
		defer file.Close()

		os.MkdirAll("./uploads", 0755)

		// Sanitize filename
		filename := strconv.Itoa(userID) + "_" + strconv.FormatFloat(price, 'f', 0, 64) + "_" + handler.Filename
		imagePath = "/uploads/" + filename

		dst, err := os.Create("./uploads/" + filename)
		if err == nil {
			defer dst.Close()
			io.Copy(dst, file)
		}
	}

	product := model.Product{
		UserID:      userID,
		CatID:       catID,
		Title:       title,
		Price:       price,
		Description: description,
		ImagePath:   imagePath,
	}

	err = product.Create()
	if err != nil {
		utils.SendError(w, http.StatusInternalServerError, "Failed to add product: "+err.Error())
		return
	}

	utils.SendJSON(w, http.StatusCreated, map[string]interface{}{
		"message": "Item posted successfully!",
		"prod_id": product.ProdID,
	})
}

func GetAllProducts(w http.ResponseWriter, r *http.Request) {
	products, err := model.GetAllProducts()
	if err != nil {
		utils.SendError(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.SendJSON(w, http.StatusOK, products)
}

func GetMyProducts(w http.ResponseWriter, r *http.Request) {
	userID, loggedIn := GetUserID(r)
	if !loggedIn {
		utils.SendError(w, http.StatusUnauthorized, "Please login")
		return
	}

	products, err := model.GetProductsByUser(userID)
	if err != nil {
		utils.SendError(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.SendJSON(w, http.StatusOK, products)
}

func DeleteProduct(w http.ResponseWriter, r *http.Request) {
	userID, loggedIn := GetUserID(r)
	if !loggedIn {
		utils.SendError(w, http.StatusUnauthorized, "Please login")
		return
	}

	vars := mux.Vars(r)
	prodID, err := strconv.Atoi(vars["id"])
	if err != nil {
		utils.SendError(w, http.StatusBadRequest, "Invalid product ID")
		return
	}

	product := model.Product{ProdID: prodID, UserID: userID}
	err = product.Delete()
	if err != nil {
		utils.SendError(w, http.StatusForbidden, "Delete failed: "+err.Error())
		return
	}

	utils.SendJSON(w, http.StatusOK, map[string]string{"message": "Item deleted successfully"})
}

func GetCategories(w http.ResponseWriter, r *http.Request) {
	cats, err := model.GetCategories()
	if err != nil {
		utils.SendError(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.SendJSON(w, http.StatusOK, cats)
}

func CheckAuth(w http.ResponseWriter, r *http.Request) {
	userID, loggedIn := GetUserID(r)
	if !loggedIn {
		utils.SendJSON(w, http.StatusOK, map[string]interface{}{"logged_in": false})
		return
	}
	utils.SendJSON(w, http.StatusOK, map[string]interface{}{
		"logged_in": true,
		"user_id":   userID,
	})
}
