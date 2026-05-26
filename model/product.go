package model

import (
	"fmt"
	"drukdeals/db"
)

type Product struct {
	ProdID      int     `json:"prod_id"`
	UserID      int     `json:"user_id"`
	CatID       int     `json:"cat_id"`
	CatName     string  `json:"cat_name"`
	Title       string  `json:"title"`
	Price       float64 `json:"price"`
	Description string  `json:"description"`
	ImagePath   string  `json:"image_path"`
	SellerName  string  `json:"seller_name"`
	CreatedAt   string  `json:"created_at"`
}

func (p *Product) Create() error {
	query := "INSERT INTO products (user_id, cat_id, title, price, description, image_path) VALUES (?, ?, ?, ?, ?, ?)"
	result, err := db.DB.Exec(query, p.UserID, p.CatID, p.Title, p.Price, p.Description, p.ImagePath)
	if err != nil {
		return err
	}
	id, _ := result.LastInsertId()
	p.ProdID = int(id)
	return nil
}

func GetAllProducts() ([]Product, error) {
	query := `SELECT p.prod_id, p.user_id, p.cat_id, c.cat_name, p.title, p.price, 
	          COALESCE(p.description, ''), COALESCE(p.image_path, ''), u.fullname,
	          DATE_FORMAT(p.created_at, '%Y-%m-%d')
	          FROM products p 
	          JOIN users u ON p.user_id = u.user_id 
	          JOIN categories c ON p.cat_id = c.cat_id
	          ORDER BY p.created_at DESC`
	rows, err := db.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []Product
	for rows.Next() {
		var p Product
		rows.Scan(&p.ProdID, &p.UserID, &p.CatID, &p.CatName, &p.Title, &p.Price, &p.Description, &p.ImagePath, &p.SellerName, &p.CreatedAt)
		products = append(products, p)
	}
	if products == nil {
		products = []Product{}
	}
	return products, nil
}

func GetProductsByUser(userID int) ([]Product, error) {
	query := `SELECT p.prod_id, p.user_id, p.cat_id, c.cat_name, p.title, p.price, 
	          COALESCE(p.description, ''), COALESCE(p.image_path, ''),
	          DATE_FORMAT(p.created_at, '%Y-%m-%d')
	          FROM products p
	          JOIN categories c ON p.cat_id = c.cat_id
	          WHERE p.user_id = ?
	          ORDER BY p.created_at DESC`
	rows, err := db.DB.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []Product
	for rows.Next() {
		var p Product
		rows.Scan(&p.ProdID, &p.UserID, &p.CatID, &p.CatName, &p.Title, &p.Price, &p.Description, &p.ImagePath, &p.CreatedAt)
		products = append(products, p)
	}
	if products == nil {
		products = []Product{}
	}
	return products, nil
}

func (p *Product) Delete() error {
	query := "DELETE FROM products WHERE prod_id = ? AND user_id = ?"
	result, err := db.DB.Exec(query, p.ProdID, p.UserID)
	if err != nil {
		return err
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("product not found or not authorized")
	}
	return nil
}

func GetCategories() ([]map[string]interface{}, error) {
	rows, err := db.DB.Query("SELECT cat_id, cat_name FROM categories ORDER BY cat_id")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var cats []map[string]interface{}
	for rows.Next() {
		var id int
		var name string
		rows.Scan(&id, &name)
		cats = append(cats, map[string]interface{}{"cat_id": id, "cat_name": name})
	}
	return cats, nil
}
