package server

import (
	"github.com/gin-gonic/gin"
	handlers "github.com/hridaya14/Web-Tech-Project/internal/server/Handlers"
	"net/http"
)

func registerRoutes(router *gin.Engine) (*gin.Engine, error) {

	router.GET("/", func(c *gin.Context) {
		c.String(200, "Welcome to the server !!")
	})

	// Auth Handlers
	router.POST("/auth/login", handlers.LoginHandler)
	router.POST("/auth/register", handlers.RegisterHandler)
	router.POST("/auth/logout", handlers.LogoutHandler)
	router.GET("/home", authenticateMiddleware, func(g *gin.Context) {
		g.JSON(http.StatusOK, gin.H{"Message ": "Welcome!!"})
	})

	//Profile Onboarding
	router.GET("/getProfile", authenticateMiddleware, handlers.GetProfile)
	router.POST("/profile/createCandidate", authenticateMiddleware, handlers.CreateCandidateProfile)
	router.POST("/profile/createCompany", authenticateMiddleware, handlers.CreateCompanyProfile)

	//Job Seeker
	router.GET("/candidate/getJobs", authenticateMiddleware, handlers.GetFilteredJobListings)
	router.POST("candidate/apply", authenticateMiddleware, handlers.CreateJobApplication)
	router.GET("/candidate/Applications", authenticateMiddleware, handlers.GetCandidateApplications)
	router.GET("/candidate/:id", authenticateMiddleware, handlers.GetCandidateHandler)
	router.POST("/candidate/deleteApplication", authenticateMiddleware, handlers.DeleteApplication)

	//Company
	router.POST("/company/createListing", authenticateMiddleware, handlers.CreateJob)
	router.GET("/company/getListings", authenticateMiddleware, handlers.GetJobListings)
	router.GET("/company/Applicants", authenticateMiddleware, handlers.GetCompanyApplicants)
	router.POST("/company/deleteListing", authenticateMiddleware, handlers.DeleteCompanyListing)
	router.GET("/getListing/:job_id", authenticateMiddleware, handlers.GetJobDetailsHandler)

	return router, nil
}
