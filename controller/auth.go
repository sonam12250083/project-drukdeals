package controller

import (
	"encoding/json"
	"net/http"
	"strconv"
	"drukdeals/model"
	"drukdeals/utils"
)

func Signup(w http.ResponseWriter, r *http.Request) {
	var user model.User
	json.NewDecoder(r.Body).Decode(&user)

	if user.Fullname == "" || user.Email == "" || user.Password == "" {
		utils.SendError(w, http.StatusBadRequest, "All fields are required")
		return
	}

	err := user.Create()
	if err != nil {
		utils.SendError(w, http.StatusBadRequest, "Email already exists")
		return
	}

	utils.SendJSON(w, http.StatusCreated, map[string]string{"message": "Signup successful"})
}

func Login(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	json.NewDecoder(r.Body).Decode(&req)

	user := model.User{Email: req.Email}
	err := user.GetByEmail()
	if err != nil || !user.CheckPassword(req.Password) {
		utils.SendError(w, http.StatusUnauthorized, "Invalid email or password")
		return
	}

	// Set cookie with user ID as string
	http.SetCookie(w, &http.Cookie{
		Name:     "user_id",
		Value:    strconv.Itoa(user.UserID),
		MaxAge:   86400,
		Path:     "/",
		HttpOnly: true,
	})

	utils.SendJSON(w, http.StatusOK, map[string]interface{}{
		"message": "Login successful",
		"user_id": user.UserID,
		"name":    user.Fullname,
	})
}

func Logout(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{
		Name:   "user_id",
		Value:  "",
		MaxAge: -1,
		Path:   "/",
	})
	utils.SendJSON(w, http.StatusOK, map[string]string{"message": "Logged out"})
}

// GetUserID extracts the user ID from the session cookie
func GetUserID(r *http.Request) (int, bool) {
	cookie, err := r.Cookie("user_id")
	if err != nil || cookie.Value == "" {
		return 0, false
	}
	id, err := strconv.Atoi(cookie.Value)
	if err != nil || id <= 0 {
		return 0, false
	}
	return id, true
}
