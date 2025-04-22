package server

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/hridaya14/Web-Tech-Project/pkg/auth"
	"net/http"
)

func authenticateMiddleware(c *gin.Context) {
	fmt.Println("[Middleware] Starting authentication middleware")

	// Retrieve the token from the cookie
	tokenString, err := c.Cookie("token")
	if err != nil {
		fmt.Println("[Middleware] Token missing in cookie")
		c.Redirect(http.StatusSeeOther, "/login")
		c.Abort()
		return
	}
	fmt.Println("[Middleware] Token retrieved from cookie")

	// Verify the token
	token, err := auth.VerifyToken(tokenString)
	if err != nil {
		fmt.Printf("[Middleware] Token verification failed: %v\n", err)
		c.JSON(http.StatusUnauthorized, gin.H{"Message": "Unauthorized access"})
		c.Abort()
		return
	}
	fmt.Println("[Middleware] Token verified successfully")

	// Extract claims
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		fmt.Println("[Middleware] Invalid token claims")
		c.JSON(http.StatusUnauthorized, gin.H{"Message": "Invalid token"})
		c.Abort()
		return
	}
	fmt.Println("[Middleware] Claims extracted from token")

	username, ok := claims["sub"].(string)
	if !ok {
		fmt.Println("[Middleware] Username not found in token claims")
		c.JSON(http.StatusUnauthorized, gin.H{"Message": "Invalid token claims"})
		c.Abort()
		return
	}
	fmt.Printf("[Middleware] Username extracted from token: %s\n", username)

	// Store the username in Gin context
	c.Set("username", username)
	fmt.Println("[Middleware] Username set in Gin context")

	// Continue with the next middleware or handler
	fmt.Println("[Middleware] Passing control to the next handler")
	c.Next()
}
