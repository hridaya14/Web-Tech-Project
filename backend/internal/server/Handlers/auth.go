package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/hridaya14/Web-Tech-Project/internal/database"
	"github.com/hridaya14/Web-Tech-Project/internal/models"
	"github.com/hridaya14/Web-Tech-Project/pkg/auth"
	"log"
	"net/http"
	"os"
)

var (
	isProd = os.Getenv("ENV") == "production"
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
	Username string `json:"username" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
	Role     string `json:"role" binding:"required,oneof=candidate company admin"`
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
		return
	}
	if exists {
		c.JSON(
			http.StatusBadRequest,
			gin.H{"Error": "User with this email already exists."})
		return
	}

	//Hashing password
	hashedPass, err := auth.HashPassword(input.Password)

	//Creating user
	user := models.User{
		Username:     input.Username,
		Email:        input.Email,
		PasswordHash: hashedPass,
		Role:         input.Role,
	}

	id, err := database.CreateUser(&user)
	if err != nil {
		c.JSON(
			http.StatusInternalServerError,
			gin.H{"error": "Unable to create user!"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"Message": "Successfuly Created User",
		"user_id": id})
}

func LoginHandler(c *gin.Context) {

	//Validate request body
	var input LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "login input validation failed"})
		return
	}

	log.Print("Flag 1")

	//Retrieve user
	exists, err := database.CheckUserExists(input.Email)

	if !exists || err != nil {
		c.JSON(
			http.StatusBadRequest,
			gin.H{"Error": "Unable to login with provided credentials"},
		)
		return
	}

	log.Print("Flag 2")

	user, err := database.GetUserByEmail(input.Email)

	if err != nil {
		log.Printf("Error in GetUserByEmail: %v", err) // 🔍 Add this
		c.JSON(
			http.StatusBadRequest,
			gin.H{"error": err.Error()}) // 🔧 Fix error serialization
		return
	}
	log.Print("Flag 3")
	needsOnboarding := user.OnboardingStatus == "NOT_STARTED" || user.OnboardingStatus == "IN_PROGRESS"

	//Compare pass with hashed password
	err = auth.CheckPassword(user.PasswordHash, input.Password)

	if err != nil {
		c.JSON(
			http.StatusBadRequest,
			gin.H{"Error": "Incorrect Password"})
		return
	}

	// Generate Token
	signedToken, err := auth.CreateToken(user.ID, user.Username, user.Role)

	if err != nil {
		c.JSON(
			http.StatusBadGateway,
			gin.H{"Error": "Unable to process request"})
		return
	}

	age := 60 * 60 * 24 * 30
	c.SetCookie("token", // Token Name
		signedToken, // Token
		age,         //Age
		"/",
		"localhost",
		isProd, //Https
		true)   // Httponly

	c.JSON(http.StatusOK, gin.H{
		"Message":         "Successfully logged in user",
		"needsOnboarding": needsOnboarding,
		"role":            user.Role,
	})

	return

}

func LogoutHandler(c *gin.Context) {
	c.SetCookie(
		"token", // name
		"",      // value
		-1,      // maxAge
		"/",     // path
		"",      // domain (leave empty for default)
		true,    // secure
		true,    // httpOnly
	)

	// Respond with success
	c.JSON(http.StatusOK, gin.H{
		"message": "Logout successful",
	})
}
