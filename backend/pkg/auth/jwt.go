package auth

import (
	"fmt"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"log"
	"os"
	"time"
)

func GetSecretKey() []byte {
	secret := os.Getenv("SECRET_KEY")
	if secret == "" {
		log.Fatal("JWT secret key is not set!")
	}
	return []byte(secret)
}

func CreateToken(id int, username string, role string) (string, error) {
	// Create a new JWT token with claims
	claims := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user": id,
		"sub":  username,                         // Subject (user identifier)
		"iss":  "JobHunt AI",                     // Issuer
		"aud":  role,                             // User Role
		"exp":  time.Now().Add(time.Hour).Unix(), // Expiration time
		"iat":  time.Now().Unix(),                // Issued at
	})

	// Print information about the created token
	fmt.Printf("Token claims added: %+v\n", claims)

	secretKey := GetSecretKey()
	// Signing the JWT using secret
	tokenString, err := claims.SignedString(secretKey)
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

// Function to verify JWT tokens
func VerifyToken(tokenString string) (*jwt.Token, error) {

	secretKey := GetSecretKey()

	// Parse the token with the secret key
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (any, error) {
		return secretKey, nil
	})

	// Check for verification errors
	if err != nil {
		return nil, err
	}

	// Check if the token is valid
	if !token.Valid {
		return nil, fmt.Errorf("invalid token")
	}

	// Return the verified token
	return token, nil
}

// HashPassword hashes the given plain password using bcrypt
func HashPassword(password string) (string, error) {
	hashedBytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(hashedBytes), err
}

// CheckPassword compares plain password with hashed password from DB
func CheckPassword(hashedPassword, plainPassword string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(plainPassword))
}
