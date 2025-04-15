package handlers

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/hridaya14/Web-Tech-Project/internal/database"
	"github.com/hridaya14/Web-Tech-Project/internal/models"
	"github.com/hridaya14/Web-Tech-Project/pkg/auth"
)

const (
	CANDIDATE = "candidate"
	ADMIN     = "admin"
	COMPANY   = "company"
)

type LoginInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
}

type RegisterInput struct {
	Username string `json:"username" binding:"required,username"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
	Role     string `json:"role" binding:"required,oneof=candidate company admin"`
}

func LoginHandler(c *gin.Context) {
	fmt.Printf("Login Successful")
}

func RegisterHandler(c *gin.Context) {

	//Validate request
	var input RegisterInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	//Checking for existing user
	exists, err := database.CheckUserExists(input.Email)

	if err != nil {
		c.JSON(
			http.StatusInternalServerError,
			gin.H{"error": "failed to check user existence"})
	}
	if exists {
		c.JSON(
			http.StatusBadRequest,
			gin.H{"Error": "User with this email already exists."})
	}

	//Hashing password
	hashedPass,err := auth.HashPassword(input.Password)

	//Creating user
	user := models.User{
		Username: input.Username,
		Email: input.Email,
		PasswordHash: hashedPass,
		Role: input.Role,
	}

	err = database.CreateUser(&user)
	if err != nil {
		c.JSON(
			http.StatusInternalServerError, 
			gin.H{"error": "Unable to create user!"})
	}

	c.JSON(http.StatusCreated,gin.H{"Message": "Successfuly Created User"})
}
